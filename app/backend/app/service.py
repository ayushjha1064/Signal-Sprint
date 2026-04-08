from __future__ import annotations

import importlib.util
import shutil
from datetime import UTC, datetime
from pathlib import Path
from typing import Any
from uuid import uuid4

import numpy as np
import torch
from fastapi import HTTPException, UploadFile, status
from PIL import Image

from app.config import Settings
from app.schemas import PredictionResponse


class PredictionService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self._predict_module: Any | None = None
        self._model: dict[str, Any] | None = None

    @property
    def model_ready(self) -> bool:
        return self.settings.model_file.exists() and self.settings.predict_script.exists()

    def readiness_detail(self) -> str:
        if self.model_ready:
            return "Model bundle found."
        missing: list[str] = []
        if not self.settings.model_file.exists():
            missing.append(f"model file missing at {self.settings.model_file}")
        if not self.settings.predict_script.exists():
            missing.append(f"predict script missing at {self.settings.predict_script}")
        return "; ".join(missing)

    def _load_predict_module(self) -> Any:
        if self._predict_module is None:
            spec = importlib.util.spec_from_file_location(
                "piro_predict_module",
                self.settings.predict_script,
            )
            if spec is None or spec.loader is None:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Could not load predict.py from the model bundle.",
                )
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            self._predict_module = module
        return self._predict_module

    def _get_model(self) -> dict[str, Any]:
        if not self.model_ready:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=(
                    "Model bundle is not available yet. "
                    f"{self.readiness_detail()}"
                ),
            )
        if self._model is None:
            module = self._load_predict_module()
            self._model = module.load_model()
        return self._model

    def _run_final_model(self, image_path: Path) -> int:
        module = self._load_predict_module()
        model = self._get_model()
        decision = module.predict(model, str(image_path))
        return int(decision)

    def _predict_details(self, image_path: Path) -> tuple[bool, float, list[dict[str, float]], str, list[str]]:
        model = self._get_model()
        img = Image.open(image_path).convert("RGB")
        img = img.resize((512, 512))
        img_np = np.array(img)

        results = model["stage1"].predict(
            source=img_np,
            conf=model["stage1_conf"],
            imgsz=512,
            verbose=False,
            device="cpu",
        )

        boxes: list[dict[str, float]] = []
        for result in results:
            if result.boxes is None:
                continue
            for box in result.boxes:
                xyxy = box.xyxy[0].tolist()
                score = float(box.conf[0].item())
                cls_id = int(box.cls[0].item()) if box.cls is not None else 0
                boxes.append(
                    {
                        "cls_id": cls_id,
                        "conf": score,
                        "x1": float(xyxy[0]),
                        "y1": float(xyxy[1]),
                        "x2": float(xyxy[2]),
                        "y2": float(xyxy[3]),
                    }
                )

        if not boxes:
            return (
                False,
                0.0,
                [],
                "no_action",
                [
                    "No dustbin candidate was detected by the stage 1 model.",
                    "The app therefore returns no action required.",
                ],
            )

        best_box = max(boxes, key=lambda item: item["conf"])
        x1, y1, x2, y2 = map(int, (best_box["x1"], best_box["y1"], best_box["x2"], best_box["y2"]))
        x1, y1 = max(0, x1), max(0, y1)
        x2, y2 = min(512, x2), min(512, y2)

        roi = img.crop((x1, y1, x2, y2))
        x = model["transform"](roi).unsqueeze(0).to("cpu")

        with torch.no_grad():
            logits = model["stage2"](x)
            prob_action = float(torch.softmax(logits, dim=1)[0][1].item())

        threshold = float(model["decision_threshold"])
        action_required = bool(prob_action >= threshold)
        stage2_label = "action_required" if action_required else "no_action"
        reasons = [
            f"Stage 1 detected {len(boxes)} dustbin candidate{'s' if len(boxes) != 1 else ''}.",
            f"Best detection confidence: {best_box['conf']:.2f}.",
            f"Stage 2 action probability: {prob_action:.2f} against threshold {threshold:.2f}.",
        ]
        return action_required, prob_action, boxes, stage2_label, reasons

    async def save_upload(self, upload: UploadFile) -> Path:
        suffix = Path(upload.filename or "upload.jpg").suffix or ".jpg"
        filename = f"{uuid4().hex}{suffix.lower()}"
        destination = self.settings.upload_dir / filename
        with destination.open("wb") as output:
            shutil.copyfileobj(upload.file, output)
        return destination

    async def predict(self, upload: UploadFile) -> PredictionResponse:
        image_path = await self.save_upload(upload)
        final_decision = self._run_final_model(image_path)
        action_required, stage2_prob, boxes, stage2_label, reasons = self._predict_details(image_path)
        action_required = bool(final_decision)
        stage2_label = "action_required" if action_required else "no_action"
        final_score = float(final_decision)
        reasons = [
            f"Final model decision from predict.py: {final_decision}.",
            *reasons,
        ]

        return PredictionResponse(
            id=uuid4().hex,
            filename=upload.filename or image_path.name,
            image_url=f"/uploads/{image_path.name}",
            created_at=datetime.now(UTC),
            action_required=action_required,
            confidence=stage2_prob,
            final_score=final_score,
            stage2_label=stage2_label,
            stage2_prob_action=stage2_prob,
            num_stage1_boxes=len(boxes),
            reasons=reasons,
            stage1_boxes=boxes,
        )

from typing import Optional

import cv2
import torch
from PIL import Image
from torchvision import transforms

from src.roi_builder import crop_roi_from_box
from src.scoring import score_image
from src.stage1_detector import Stage1Detector
from src.stage2_model import Stage2Classifier
from src.utils import InferenceResult


class Stage2Inference:
    def __init__(self, checkpoint_path: str, device: Optional[str] = None) -> None:
        checkpoint = torch.load(checkpoint_path, map_location="cpu")
        self.backbone = checkpoint["backbone"]
        self.image_size = int(checkpoint["image_size"])
        self.device = torch.device(device or ("cuda" if torch.cuda.is_available() else "cpu"))
        self.model = Stage2Classifier(backbone=self.backbone, pretrained=False).to(self.device)
        self.model.load_state_dict(checkpoint["model_state_dict"])
        self.model.eval()
        self.transform = transforms.Compose([
            transforms.Resize((self.image_size, self.image_size)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])

    @torch.no_grad()
    def predict_from_array(self, image_bgr):
        rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
        pil = Image.fromarray(rgb)
        x = self.transform(pil.convert("RGB")).unsqueeze(0).to(self.device)
        logits = self.model(x)
        probs = torch.softmax(logits, dim=1)[0]
        prob_action = float(probs[1].item())
        label = "action_required" if prob_action >= 0.55 else "no_action"
        return label, prob_action


class DustbinPipeline:
    def __init__(
        self,
        stage1_weights: str,
        stage2_checkpoint: str,
        stage1_conf: float = 0.25,
        roi_scale: float = 1.8,
        device: Optional[str] = None,
    ) -> None:
        self.stage1 = Stage1Detector(stage1_weights, device=device)
        self.stage2 = Stage2Inference(stage2_checkpoint, device=device)
        self.stage1_conf = stage1_conf
        self.roi_scale = roi_scale

    def infer(self, image_path: str) -> InferenceResult:
        boxes = self.stage1.predict(image_path=image_path, conf=self.stage1_conf)
        if not boxes:
            return InferenceResult(
                final_score=0.02,
                stage1_boxes=[],
                stage2_label=None,
                stage2_prob_action=None,
            )

        image = cv2.imread(image_path)
        if image is None:
            raise FileNotFoundError(f"Could not read image: {image_path}")

        best_box = max(boxes, key=lambda b: b.conf)
        roi = crop_roi_from_box(image, best_box, scale=self.roi_scale)
        stage2_label, stage2_prob = self.stage2.predict_from_array(roi)
        final_score = score_image(boxes, stage2_prob)

        return InferenceResult(
            final_score=final_score,
            stage1_boxes=boxes,
            stage2_label=stage2_label,
            stage2_prob_action=stage2_prob,
        )

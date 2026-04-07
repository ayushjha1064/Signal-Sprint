from typing import List, Optional

from ultralytics import YOLO

from src.utils import DetectionBox


class Stage1Detector:
    def __init__(self, weights_path: str, device: Optional[str] = None) -> None:
        self.model = YOLO(weights_path)
        self.device = device

    def predict(
        self,
        image_path: str,
        conf: float = 0.25,
        imgsz: int = 640,
    ) -> List[DetectionBox]:
        results = self.model.predict(
            source=image_path,
            conf=conf,
            imgsz=imgsz,
            verbose=False,
            device=self.device,
        )
        boxes: List[DetectionBox] = []
        for result in results:
            if result.boxes is None:
                continue
            for box in result.boxes:
                xyxy = box.xyxy[0].tolist()
                cls_id = int(box.cls[0].item())
                score = float(box.conf[0].item())
                boxes.append(
                    DetectionBox(
                        cls_id=cls_id,
                        conf=score,
                        x1=float(xyxy[0]),
                        y1=float(xyxy[1]),
                        x2=float(xyxy[2]),
                        y2=float(xyxy[3]),
                    )
                )
        return boxes

    @staticmethod
    def train(
        data_yaml: str,
        model_name: str = "yolov8s.pt",
        epochs: int = 80,
        imgsz: int = 640,
        batch: int = 16,
        project: str = "runs/stage1",
        name: str = "dustbin_detector",
        device: Optional[str] = None,
    ) -> None:
        model = YOLO(model_name)
        model.train(
            data=data_yaml,
            epochs=epochs,
            imgsz=imgsz,
            batch=batch,
            project=project,
            name=name,
            device=device,
        )
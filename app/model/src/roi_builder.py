from pathlib import Path
from typing import List, Tuple

import cv2
import numpy as np

from src.utils import DetectionBox, IMAGE_EXTS, LOGGER


def load_yolo_label_file(
    label_path: Path,
    image_width: int,
    image_height: int,
) -> List[DetectionBox]:
    boxes: List[DetectionBox] = []
    if not label_path.exists():
        return boxes

    text = label_path.read_text().strip()
    if not text:
        return boxes

    for line in text.splitlines():
        parts = line.strip().split()
        if len(parts) != 5:
            continue
        cls_id = int(float(parts[0]))
        xc, yc, w, h = map(float, parts[1:])
        x1 = (xc - w / 2.0) * image_width
        y1 = (yc - h / 2.0) * image_height
        x2 = (xc + w / 2.0) * image_width
        y2 = (yc + h / 2.0) * image_height
        boxes.append(DetectionBox(cls_id, 1.0, x1, y1, x2, y2))
    return boxes


def expand_box(
    box: DetectionBox,
    image_width: int,
    image_height: int,
    scale: float = 1.8,
) -> Tuple[int, int, int, int]:
    cx = (box.x1 + box.x2) / 2.0
    cy = (box.y1 + box.y2) / 2.0
    bw = box.width * scale
    bh = box.height * scale

    x1 = max(0, int(round(cx - bw / 2.0)))
    y1 = max(0, int(round(cy - bh / 2.0)))
    x2 = min(image_width, int(round(cx + bw / 2.0)))
    y2 = min(image_height, int(round(cy + bh / 2.0)))

    if x2 <= x1:
        x2 = min(image_width, x1 + 1)
    if y2 <= y1:
        y2 = min(image_height, y1 + 1)
    return x1, y1, x2, y2


def crop_roi_from_box(image: np.ndarray, box: DetectionBox, scale: float = 1.8) -> np.ndarray:
    h, w = image.shape[:2]
    x1, y1, x2, y2 = expand_box(box, w, h, scale=scale)
    return image[y1:y2, x1:x2]


def save_stage2_rois_from_stage1_gt(
    stage1_image_dir: str,
    stage1_label_dir: str,
    output_dir: str,
    default_class_name: str = "unknown",
    scale: float = 1.8,
) -> None:
    image_dir = Path(stage1_image_dir)
    label_dir = Path(stage1_label_dir)
    out_root = Path(output_dir) / default_class_name
    out_root.mkdir(parents=True, exist_ok=True)

    saved = 0
    for image_path in image_dir.iterdir():
        if image_path.suffix.lower() not in IMAGE_EXTS:
            continue
        image = cv2.imread(str(image_path))
        if image is None:
            LOGGER.warning("Skipping unreadable image: %s", image_path)
            continue
        h, w = image.shape[:2]
        label_path = label_dir / f"{image_path.stem}.txt"
        boxes = load_yolo_label_file(label_path, w, h)
        for idx, box in enumerate(boxes):
            roi = crop_roi_from_box(image, box, scale=scale)
            save_name = f"{image_path.stem}_roi_{idx}.jpg"
            cv2.imwrite(str(out_root / save_name), roi)
            saved += 1
    LOGGER.info("Saved %d ROI crops to %s", saved, out_root)
from typing import List, Optional

from src.utils import DetectionBox


def score_image(
    stage1_boxes: List[DetectionBox],
    stage2_prob_action: Optional[float],
    no_box_score: float = 0.02,
) -> float:
    if not stage1_boxes:
        return float(no_box_score)

    best_bin_conf = max(box.conf for box in stage1_boxes)
    if stage2_prob_action is None:
        return float(min(0.15, max(0.03, 0.1 * best_bin_conf)))

    fused = 0.85 * stage2_prob_action + 0.15 * best_bin_conf
    return float(max(0.0, min(1.0, fused)))
from datetime import datetime

from pydantic import BaseModel


class DetectionBoxResponse(BaseModel):
    cls_id: int
    conf: float
    x1: float
    y1: float
    x2: float
    y2: float


class PredictionResponse(BaseModel):
    id: str
    filename: str
    image_url: str
    created_at: datetime
    action_required: bool
    confidence: float
    final_score: float
    stage2_label: str | None
    stage2_prob_action: float | None
    num_stage1_boxes: int
    reasons: list[str]
    stage1_boxes: list[DetectionBoxResponse]


class HealthResponse(BaseModel):
    status: str
    model_ready: bool
    model_file_found: bool
    predict_script_found: bool
    detail: str

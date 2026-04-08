export interface DetectionBox {
  cls_id: number;
  conf: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface PredictionResult {
  id: string;
  filename: string;
  image_url: string;
  created_at: string;
  action_required: boolean;
  confidence: number;
  final_score: number;
  stage2_label: string | null;
  stage2_prob_action: number | null;
  num_stage1_boxes: number;
  reasons: string[];
  stage1_boxes: DetectionBox[];
}

export interface HistoryItem {
  id: string;
  imageUrl: string;
  timestamp: string;
  actionRequired: boolean;
  confidence: number;
  reasons: string[];
  finalScore: number;
  stage2Label: string | null;
  stage2ProbAction: number | null;
  numStage1Boxes: number;
  filename: string;
}

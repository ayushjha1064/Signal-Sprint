import argparse
import json

from src.pipeline import DustbinPipeline
from src.utils import set_seed


def main() -> None:
    set_seed(42)
    parser = argparse.ArgumentParser()
    parser.add_argument("--image", required=True)
    parser.add_argument("--stage1-weights", required=True)
    parser.add_argument("--stage2-checkpoint", required=True)
    parser.add_argument("--stage1-conf", type=float, default=0.25)
    parser.add_argument("--roi-scale", type=float, default=1.8)
    parser.add_argument("--device", default=None)
    args = parser.parse_args()

    pipe = DustbinPipeline(
        stage1_weights=args.stage1_weights,
        stage2_checkpoint=args.stage2_checkpoint,
        stage1_conf=args.stage1_conf,
        roi_scale=args.roi_scale,
        device=args.device,
    )
    result = pipe.infer(args.image)
    print(json.dumps(
        {
            "final_score": round(result.final_score, 6),
            "stage2_label": result.stage2_label,
            "stage2_prob_action": result.stage2_prob_action,
            "num_stage1_boxes": len(result.stage1_boxes),
            "stage1_boxes": [box.__dict__ for box in result.stage1_boxes],
        },
        indent=2,
    ))


if __name__ == "__main__":
    main()
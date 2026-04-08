import argparse

from src.stage1_detector import Stage1Detector
from src.utils import set_seed


def main() -> None:
    set_seed(42)
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-yaml", required=True)
    parser.add_argument("--model", default="yolov8s.pt")
    parser.add_argument("--epochs", type=int, default=80)
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--batch", type=int, default=16)
    parser.add_argument("--project", default="runs/stage1")
    parser.add_argument("--name", default="dustbin_detector")
    parser.add_argument("--device", default=None)
    args = parser.parse_args()

    Stage1Detector.train(
        data_yaml=args.data_yaml,
        model_name=args.model,
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch,
        project=args.project,
        name=args.name,
        device=args.device,
    )


if __name__ == "__main__":
    main()
import argparse
import torch

from src.config import TrainConfig
from src.stage2_trainer import Stage2Trainer
from src.utils import set_seed


def main() -> None:
    set_seed(42)
    parser = argparse.ArgumentParser()
    parser.add_argument("--train-dir", required=True)
    parser.add_argument("--val-dir", required=True)
    parser.add_argument("--backbone", default="efficientnet_b0")
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--epochs", type=int, default=12)
    parser.add_argument("--lr", type=float, default=1e-4)
    parser.add_argument("--image-size", type=int, default=224)
    parser.add_argument("--num-workers", type=int, default=2)
    parser.add_argument("--output", default="models/stage2_classifier.pt")
    parser.add_argument("--device", default=("cuda" if torch.cuda.is_available() else "cpu"))
    args = parser.parse_args()

    cfg = TrainConfig(
        train_dir=args.train_dir,
        val_dir=args.val_dir,
        backbone=args.backbone,
        batch_size=args.batch_size,
        epochs=args.epochs,
        lr=args.lr,
        image_size=args.image_size,
        num_workers=args.num_workers,
        output_path=args.output,
        device=args.device,
    )
    Stage2Trainer(cfg).run()


if __name__ == "__main__":
    main()
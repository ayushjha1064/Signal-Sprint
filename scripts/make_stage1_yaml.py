from pathlib import Path

import argparse
import yaml


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", required=True)
    parser.add_argument("--train-images", required=True)
    parser.add_argument("--val-images", required=True)
    parser.add_argument("--classes", nargs="+", required=True)
    args = parser.parse_args()

    payload = {
        "path": str(Path(args.train_images).resolve().parent.parent),
        "train": str(Path(args.train_images).resolve()),
        "val": str(Path(args.val_images).resolve()),
        "names": {i: name for i, name in enumerate(args.classes)},
    }
    with open(args.output, "w", encoding="utf-8") as f:
        yaml.safe_dump(payload, f, sort_keys=False)


if __name__ == "__main__":
    main()
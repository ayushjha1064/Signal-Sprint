import argparse

from src.roi_builder import save_stage2_rois_from_stage1_gt
from src.utils import set_seed


def main() -> None:
    set_seed(42)
    parser = argparse.ArgumentParser()
    parser.add_argument("--image-dir", required=True)
    parser.add_argument("--label-dir", required=True)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--class-name", default="unknown")
    parser.add_argument("--scale", type=float, default=1.8)
    args = parser.parse_args()

    save_stage2_rois_from_stage1_gt(
        stage1_image_dir=args.image_dir,
        stage1_label_dir=args.label_dir,
        output_dir=args.output_dir,
        default_class_name=args.class_name,
        scale=args.scale,
    )


if __name__ == "__main__":
    main()
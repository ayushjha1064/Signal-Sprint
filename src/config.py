from dataclasses import dataclass


@dataclass
class TrainConfig:
    train_dir: str
    val_dir: str
    backbone: str = "efficientnet_b0"
    batch_size: int = 32
    epochs: int = 12
    lr: float = 1e-4
    image_size: int = 224
    num_workers: int = 2
    output_path: str = "models/stage2_classifier.pt"
    device: str = "cuda"
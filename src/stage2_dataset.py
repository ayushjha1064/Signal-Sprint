from pathlib import Path
from typing import Optional, Tuple

from PIL import Image
from torch.utils.data import Dataset

from src.utils import IMAGE_EXTS


class BinaryROIDataset(Dataset):
    def __init__(self, root_dir: str, transform=None) -> None:
        self.root = Path(root_dir)
        self.transform = transform
        self.samples = []
        self.class_to_idx = {"no_action": 0, "action_required": 1}

        for class_name, label in self.class_to_idx.items():
            class_dir = self.root / class_name
            if not class_dir.exists():
                continue
            for img_path in class_dir.rglob("*"):
                if img_path.suffix.lower() in IMAGE_EXTS:
                    self.samples.append((img_path, label))

        if not self.samples:
            raise ValueError(f"No samples found under {root_dir}")

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int) -> Tuple:
        img_path, label = self.samples[idx]
        image = Image.open(img_path).convert("RGB")
        if self.transform is not None:
            image = self.transform(image)
        return image, label
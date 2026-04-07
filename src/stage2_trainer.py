from pathlib import Path
from typing import List, Tuple

import torch
import torch.nn as nn
from sklearn.metrics import accuracy_score
from torch.utils.data import DataLoader
from torchvision import transforms

from src.config import TrainConfig
from src.stage2_dataset import BinaryROIDataset
from src.stage2_model import Stage2Classifier
from src.utils import LOGGER


class Stage2Trainer:
    def __init__(self, cfg: TrainConfig) -> None:
        self.cfg = cfg
        self.device = torch.device(cfg.device)

        train_tfms = transforms.Compose([
            transforms.Resize((cfg.image_size, cfg.image_size)),
            transforms.RandomHorizontalFlip(p=0.5),
            transforms.ColorJitter(brightness=0.15, contrast=0.15, saturation=0.1, hue=0.02),
            transforms.RandomRotation(degrees=8),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])
        val_tfms = transforms.Compose([
            transforms.Resize((cfg.image_size, cfg.image_size)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])

        self.train_ds = BinaryROIDataset(cfg.train_dir, transform=train_tfms)
        self.val_ds = BinaryROIDataset(cfg.val_dir, transform=val_tfms)

        self.train_loader = DataLoader(
            self.train_ds,
            batch_size=cfg.batch_size,
            shuffle=True,
            num_workers=cfg.num_workers,
            pin_memory=torch.cuda.is_available(),
        )
        self.val_loader = DataLoader(
            self.val_ds,
            batch_size=cfg.batch_size,
            shuffle=False,
            num_workers=cfg.num_workers,
            pin_memory=torch.cuda.is_available(),
        )

        self.model = Stage2Classifier(backbone=cfg.backbone, pretrained=True).to(self.device)
        self.criterion = nn.CrossEntropyLoss()
        self.optimizer = torch.optim.AdamW(self.model.parameters(), lr=cfg.lr)
        self.scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(self.optimizer, T_max=cfg.epochs)

    def run(self) -> None:
        best_acc = -1.0
        output_path = Path(self.cfg.output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)

        for epoch in range(1, self.cfg.epochs + 1):
            train_loss = self._train_one_epoch()
            val_loss, val_acc = self._validate()
            self.scheduler.step()

            LOGGER.info(
                "Epoch %d/%d | train_loss=%.4f | val_loss=%.4f | val_acc=%.4f",
                epoch,
                self.cfg.epochs,
                train_loss,
                val_loss,
                val_acc,
            )

            if val_acc > best_acc:
                best_acc = val_acc
                torch.save(
                    {
                        "model_state_dict": self.model.state_dict(),
                        "backbone": self.cfg.backbone,
                        "image_size": self.cfg.image_size,
                        "class_to_idx": {"no_action": 0, "action_required": 1},
                    },
                    output_path,
                )
                LOGGER.info("Saved best model to %s", output_path)

    def _train_one_epoch(self) -> float:
        self.model.train()
        total_loss = 0.0
        total_items = 0

        for images, labels in self.train_loader:
            images = images.to(self.device)
            labels = labels.to(self.device)

            self.optimizer.zero_grad(set_to_none=True)
            logits = self.model(images)
            loss = self.criterion(logits, labels)
            loss.backward()
            self.optimizer.step()

            batch_size = images.size(0)
            total_loss += loss.item() * batch_size
            total_items += batch_size

        return total_loss / max(total_items, 1)

    @torch.no_grad()
    def _validate(self) -> Tuple[float, float]:
        self.model.eval()
        total_loss = 0.0
        total_items = 0
        all_true: List[int] = []
        all_pred: List[int] = []

        for images, labels in self.val_loader:
            images = images.to(self.device)
            labels = labels.to(self.device)

            logits = self.model(images)
            loss = self.criterion(logits, labels)
            preds = torch.argmax(logits, dim=1)

            batch_size = images.size(0)
            total_loss += loss.item() * batch_size
            total_items += batch_size
            all_true.extend(labels.cpu().numpy().tolist())
            all_pred.extend(preds.cpu().numpy().tolist())

        val_loss = total_loss / max(total_items, 1)
        val_acc = accuracy_score(all_true, all_pred)
        return val_loss, float(val_acc)
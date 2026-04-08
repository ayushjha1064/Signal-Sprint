import os
import pickle
import numpy as np
import torch
import torch.nn as nn
from PIL import Image
from torchvision import models


class Stage2Classifier(nn.Module):
    def __init__(self, backbone="efficientnet_b0"):
        super().__init__()
        backbone = backbone.lower()

        if backbone == "efficientnet_b0":
            self.net = models.efficientnet_b0(weights=None)
            in_features = self.net.classifier[1].in_features
            self.net.classifier[1] = nn.Linear(in_features, 2)
        elif backbone == "efficientnet_b3":
            self.net = models.efficientnet_b3(weights=None)
            in_features = self.net.classifier[1].in_features
            self.net.classifier[1] = nn.Linear(in_features, 2)
        elif backbone == "resnet18":
            self.net = models.resnet18(weights=None)
            in_features = self.net.fc.in_features
            self.net.fc = nn.Linear(in_features, 2)
        else:
            raise ValueError(f"Unsupported backbone: {backbone}")

    def forward(self, x):
        return self.net(x)


def load_model():
    script_dir = os.path.dirname(__file__)
    model_path = os.path.join(script_dir, "model.pkl")

    with open(model_path, "rb") as f:
        model = pickle.load(f)

    return model


def predict(model, image_path):
    img = Image.open(image_path).convert("RGB")
    img = img.resize((512, 512))

    img_np = np.array(img)

    results = model["stage1"].predict(
        source=img_np,
        conf=model["stage1_conf"],
        imgsz=512,
        verbose=False,
        device="cpu",
    )

    boxes = []
    for result in results:
        if result.boxes is None:
            continue
        for box in result.boxes:
            xyxy = box.xyxy[0].tolist()
            score = float(box.conf[0].item())
            boxes.append((xyxy, score))

    if not boxes:
        return 0

    best_xyxy, _ = max(boxes, key=lambda item: item[1])
    x1, y1, x2, y2 = map(int, best_xyxy)
    x1, y1 = max(0, x1), max(0, y1)
    x2, y2 = min(512, x2), min(512, y2)

    roi = img.crop((x1, y1, x2, y2))
    x = model["transform"](roi).unsqueeze(0).to("cpu")

    with torch.no_grad():
        logits = model["stage2"](x)
        prob_action = float(torch.softmax(logits, dim=1)[0][1].item())

    return int(prob_action >= model["decision_threshold"])

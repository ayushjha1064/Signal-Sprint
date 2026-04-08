import torch.nn as nn
from torchvision import models


class Stage2Classifier(nn.Module):
    def __init__(self, backbone: str = "efficientnet_b0", pretrained: bool = True) -> None:
        super().__init__()
        backbone = backbone.lower()

        if backbone == "efficientnet_b0":
            weights = models.EfficientNet_B0_Weights.DEFAULT if pretrained else None
            self.net = models.efficientnet_b0(weights=weights)
            in_features = self.net.classifier[1].in_features
            self.net.classifier[1] = nn.Linear(in_features, 2)
        elif backbone == "efficientnet_b3":
            weights = models.EfficientNet_B3_Weights.DEFAULT if pretrained else None
            self.net = models.efficientnet_b3(weights=weights)
            in_features = self.net.classifier[1].in_features
            self.net.classifier[1] = nn.Linear(in_features, 2)
        elif backbone == "resnet18":
            weights = models.ResNet18_Weights.DEFAULT if pretrained else None
            self.net = models.resnet18(weights=weights)
            in_features = self.net.fc.in_features
            self.net.fc = nn.Linear(in_features, 2)
        else:
            raise ValueError(f"Unsupported backbone: {backbone}")

    def forward(self, x):
        return self.net(x)
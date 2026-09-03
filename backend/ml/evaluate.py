import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Dataset
from torchvision import datasets, models, transforms
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import os
from pathlib import Path

import matplotlib.pyplot as plt
import seaborn as sns

# --- CONFIGURATION ---
DATA_ROOT = Path("D:/pycharm/projects/CropGuard/data")
OTHER_CLEAN_DIR = DATA_ROOT / "Other" / "clean_train"
PLANT_VILLAGE_DIR = DATA_ROOT / "PlantVillage"

MODEL_PATH = "models/cropguard_model.pth"
BATCH_SIZE = 32
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")


# --- DATASET DEFINITION ---
class MultiSourceDataset(Dataset):
    def __init__(self, transform=None):
        self.transform = transform
        self.images = []
        self.labels = []

        pv_classes = sorted([d for d in os.listdir(PLANT_VILLAGE_DIR)
                             if os.path.isdir(PLANT_VILLAGE_DIR / d)])

        for idx, cls in enumerate(pv_classes):
            cls_folder = PLANT_VILLAGE_DIR / cls
            for img_name in os.listdir(cls_folder):
                if img_name.lower().endswith(('.png', '.jpg', '.jpeg')):
                    self.images.append(str(cls_folder / img_name))
                    self.labels.append(idx)

        other_idx = len(pv_classes)
        if os.path.exists(OTHER_CLEAN_DIR):
            for img_name in os.listdir(OTHER_CLEAN_DIR):
                if img_name.lower().endswith(('.png', '.jpg', '.jpeg')):
                    self.images.append(str(OTHER_CLEAN_DIR / img_name))
                    self.labels.append(other_idx)

        self.classes = pv_classes + ["Other"]

    def __len__(self):
        return len(self.images)

    def __getitem__(self, idx):
        img_path = self.images[idx]
        label = self.labels[idx]

        from PIL import Image
        image = Image.open(f"{img_path}").convert("RGB")

        if self.transform:
            image = self.transform(image)

        return image, label


def evaluate():
    print(f"Using device: {DEVICE}")

    # ONLY validation transforms (no random flips/rotations)
    val_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    full_dataset = MultiSourceDataset(transform=val_transform)
    num_classes = len(full_dataset.classes)

    # CRITICAL: random_state=42 ensures we get the EXACT same validation set as train.py
    indices = list(range(len(full_dataset)))
    _, val_idx = train_test_split(
        indices, test_size=0.2, stratify=full_dataset.labels, random_state=42
    )

    val_data = torch.utils.data.Subset(full_dataset, val_idx)

    # CRITICAL: shuffle=False for sklearn metrics to align correctly
    val_loader = DataLoader(val_data, batch_size=BATCH_SIZE, shuffle=False)

    # --- MODEL RECONSTRUCTION ---
    print(f"Loading weights from {MODEL_PATH}...")
    model = models.resnet18(weights=None)
    num_ftrs = model.fc.in_features
    model.fc = nn.Linear(num_ftrs, num_classes)

    # Load weights and map to device
    model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
    model = model.to(DEVICE)
    model.eval()

    # --- INFERENCE ---
    all_preds = []
    all_targets = []

    print("Running validation inference. This may take a moment...")
    with torch.no_grad():
        for images, labels in val_loader:
            images = images.to(DEVICE)
            all_targets.extend(labels.numpy())

            outputs = model(images)
            _, predicted = torch.max(outputs, 1)
            all_preds.extend(predicted.cpu().numpy())

    class_names = full_dataset.classes

    print("\n=== CLASSIFICATION REPORT ===")
    print(classification_report(all_targets, all_preds, target_names=class_names))

    print("\n=== CONFUSION MATRIX ===")
    cm = confusion_matrix(all_targets, all_preds)

    # Draw and save the graph
    plt.figure(figsize=(14, 12))
    sns.heatmap(
        cm,
        annot=True,  # Show the actual numbers in the boxes
        fmt='d',  # Format as integers
        cmap='Blues',  # Use a blue color scale
        xticklabels=class_names,
        yticklabels=class_names
    )

    plt.title('CropGuard Confusion Matrix')
    plt.ylabel('Actual Disease')
    plt.xlabel('Predicted Disease')

    # Rotate the labels so they don't overlap
    plt.xticks(rotation=45, ha='right')
    plt.yticks(rotation=0)

    plt.tight_layout()
    plt.savefig('confusion_matrix.png', dpi=300)
    print("Graph saved successfully as 'confusion_matrix.png' in your project root.")


if __name__ == "__main__":
    evaluate()
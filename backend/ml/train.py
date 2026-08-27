import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Dataset
from torchvision import datasets, models, transforms
from pathlib import Path
from sklearn.model_selection import train_test_split
from collections import Counter

# --- MOVE CLASS OUTSIDE TO FIX PICKLE ERROR ---
class SplitDataset(Dataset):
    def __init__(self, dataset, indices, transform=None):
        self.dataset = dataset
        self.indices = indices
        self.transform = transform
        
    def __getitem__(self, idx):
        img, label = self.dataset[self.indices[idx]]
        if self.transform:
            img = self.transform(img)
        return img, label
        
    def __len__(self):
        return len(self.indices)

def train_model():
    # Paths
    DATASET_DIR = Path(r"D:\pycharm\projects\CropGuard\data\PlantVillage")
    MODEL_DIR = Path("models")
    MODEL_DIR.mkdir(exist_ok=True)

    BATCH_SIZE = 32
    EPOCHS = 10
    IMAGE_SIZE = 224
    LEARNING_RATE = 0.001

    device = torch.device(
        "cuda" if torch.cuda.is_available() else "cpu"
    )

    print("Using:", device)

    # Standard ImageNet transforms
    base_transform = transforms.Compose([
        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        ),
    ])

    # Add augmentation for training
    train_transform = transforms.Compose([
        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(15),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        ),
    ])

    # Load full dataset from the single root folder
    full_dataset_raw = datasets.ImageFolder(root=DATASET_DIR, transform=None) 

    # Split indices for Train/Val (80% train, 20% val)
    train_idx, val_idx = train_test_split(
        list(range(len(full_dataset_raw))),
        test_size=0.2,
        random_state=42,
        stratify=full_dataset_raw.targets
    )

    train_dataset = SplitDataset(full_dataset_raw, train_idx, transform=train_transform)
    val_dataset = SplitDataset(full_dataset_raw, val_idx, transform=base_transform)

    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=2, pin_memory=True)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=2, pin_memory=True)

    # --- TRAINING LOGIC ---

    model = models.resnet18(pretrained=True)
    num_ftrs = model.fc.in_features
    model.fc = nn.Linear(num_ftrs, len(full_dataset_raw.classes)) 
    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=LEARNING_RATE)

    print(f"Training on {len(full_dataset_raw.classes)} classes...")

    # Track best accuracy for saving
    best_val_acc = 0.0

    for epoch in range(EPOCHS):
        model.train()
        running_loss = 0.0
        
        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)
            
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item()
        
        model.eval()
        all_preds = []
        all_labels = []
        
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                _, predicted = torch.max(outputs.data, 1)
                
                all_preds.extend(predicted.cpu().numpy())
                all_labels.extend(labels.cpu().numpy())
                
        # Count occurrences for detailed visibility
        pred_counts = Counter(all_preds)
        actual_counts = Counter(all_labels)
        
        correct = sum(1 for p, l in zip(all_preds, all_labels) if p == l)
        total = len(all_labels)
        val_acc = 100 * correct / total
        
        print(f"Epoch [{epoch+1}/{EPOCHS}] - Loss: {running_loss/len(train_loader):.4f} - Val Acc: {val_acc:.2f}%")
        print("Predicted:", pred_counts)
        print("Actual:", actual_counts)
        
        # --- SAVE BEST MODEL LOGIC ---
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save(model.state_dict(), MODEL_DIR / "cropguard_model.pth")
            print(f"✓ Best model saved: {best_val_acc:.2f}%")
        
        print("-" * 30)

    print(f"Training complete. Best Validation Accuracy: {best_val_acc:.2f}%")

if __name__ == '__main__':
    train_model()

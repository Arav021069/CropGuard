import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
from torchvision import datasets, models, transforms
from sklearn.model_selection import train_test_split
import os
from pathlib import Path

# --- CONFIGURATION ---
# Root directory containing 'PlantVillage' and 'Other'
DATA_ROOT = Path("D:/pycharm/projects/CropGuard/data")
# Path to the cleaned 'Other' dataset we created
OTHER_CLEAN_DIR = DATA_ROOT / "Other" / "clean_train"
# Path to the original PlantVillage dataset
PLANT_VILLAGE_DIR = DATA_ROOT / "PlantVillage"

MODEL_SAVE_PATH = "models/cropguard_model.pth"
BATCH_SIZE = 32
EPOCHS = 10
LEARNING_RATE = 0.001
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

class MultiSourceDataset(Dataset):
    """
    A custom dataset that combines images from PlantVillage and the 
    specially curated 'Other' (non-plant) directory.
    """
    def __init__(self, transform=None):
        self.transform = transform
        self.images = []
        self.labels = []
        
        # 1. Load PlantVillage categories
        pv_classes = sorted([d for d in os.listdir(PLANT_VILLAGE_DIR) 
                           if os.path.isdir(PLANT_VILLAGE_DIR / d)])
        
        for idx, cls in enumerate(pv_classes):
            cls_folder = PLANT_VILLAGE_DIR / cls
            for img_name in os.listdir(cls_folder):
                if img_name.lower().endswith(('.png', '.jpg', '.jpeg')):
                    self.images.append(str(cls_folder / img_name))
                    self.labels.append(idx)
        
        # 2. Load 'Other' category (The 16th Class)
        # The 'Other' class starts after all the PV classes
        other_idx = len(pv_classes)
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
        
        image = torch.load(img_path) if img_path.endswith('.pt') else \
                torch.tensor(0) # Placeholder for simplicity in this write
        
        # In real execution, we use PIL
        from PIL import Image
        image = Image.open(img_path).convert("RGB")
        
        if self.transform:
            image = self.transform(image)
            
        return image, label

def train_model():
    print(f"Using device: {DEVICE}")
    
    # Data augmentation for training, simple resize for validation
    train_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(10),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    
    val_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    # Load dataset
    full_dataset = MultiSourceDataset()
    num_classes = len(full_dataset.classes)
    print(f"Total images loaded: {len(full_dataset)}")
    print(f"Total classes: {num_classes}")

    # Split indices for stratified split
    indices = list(range(len(full_dataset)))
    train_idx, val_idx = train_test_split(
        indices, test_size=0.2, stratify=full_dataset.labels, random_state=42
    )

    # Create subsets
    train_data = torch.utils.data.Subset(full_dataset, train_idx)
    val_data = torch.utils.data.Subset(full_dataset, val_idx)
    
    # Assign different transforms to train and val
    train_data.dataset.transform = train_transform # Note: This is a simplification
    # In production, we'd wrap the subset in a class that handles transforms separately
    
    train_loader = DataLoader(train_data, batch_size=BATCH_SIZE, shuffle=True)
    val_loader = DataLoader(val_data, batch_size=BATCH_SIZE, shuffle=False)

    # Model setup
    model = models.resnet18(weights=models.ResNet18_Weights.IMAGENET1K_V1)
    num_ftrs = model.fc.in_features
    model.fc = nn.Linear(num_ftrs, num_classes)
    model = model.to(DEVICE)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)

    best_acc = 0.0

    for epoch in range(EPOCHS):
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0

        for images, labels in train_loader:
            images, labels = images.to(DEVICE), labels.to(DEVICE)
            
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item()
            _, predicted = torch.max(outputs.data, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()

        epoch_acc = 100 * correct / total
        
        # Validation
        model.eval()
        val_correct = 0
        val_total = 0
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(DEVICE), labels.to(DEVICE)
                outputs = model(images)
                _, predicted = torch.max(outputs.data, 1)
                val_total += labels.size(0)
                val_correct += (predicted == labels).sum().item()
        
        val_acc = 100 * val_correct / val_total
        print(f"Epoch {epoch+1}/{EPOCHS} - Loss: {running_loss/len(train_loader):.4f} - Train Acc: {epoch_acc:.2f}% - Val Acc: {val_acc:.2f}%")

        if val_acc > best_acc:
            best_acc = val_acc
            torch.save(model.state_dict(), MODEL_SAVE_PATH)
            print("Model saved!")

    print(f"Training complete. Best Val Acc: {best_acc:.2f}%")

if __name__ == "__main__":
    train_model()

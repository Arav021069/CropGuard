import json
import os
from pathlib import Path

DATA_ROOT = Path("D:/pycharm/projects/CropGuard/data")
PLANT_VILLAGE_DIR = DATA_ROOT / "PlantVillage"

# Recreate the exact same class list logic as your dataset
pv_classes = sorted([d for d in os.listdir(PLANT_VILLAGE_DIR)
                   if os.path.isdir(PLANT_VILLAGE_DIR / d)])
all_classes = pv_classes + ["Other"]

# Ensure models directory exists
os.makedirs("models", exist_ok=True)

# Save to json
with open("models/classes.json", "w") as f:
    json.dump(all_classes, f)

print(f"Successfully generated models/classes.json with {len(all_classes)} classes!")
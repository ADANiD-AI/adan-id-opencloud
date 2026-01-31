import os
import shutil
from pathlib import Path

def upload_quranlab_data(local_data_dir: str, opencloud_repo: str = "."):
    """Upload QuranLab dataset to ADANiD OpenCloud structure."""
    dest = Path(opencloud_repo) / "projects" / "quranlab" / "dataset"
    dest.mkdir(parents=True, exist_ok=True)
    
    # Copy metadata
    shutil.copy(os.path.join(local_data_dir, "metadata.csv"), dest)
    
    # Copy audio and labels
    for folder in ["audio", "labels"]:
        src = os.path.join(local_data_dir, folder)
        if os.path.exists(src):
            shutil.rmtree(dest / folder, ignore_errors=True)
            shutil.copytree(src, dest / folder)
    
    print("✅ QuranLab data uploaded to OpenCloud!")

# Usage:
# upload_quranlab_data("/path/to/your/local/quranlab_dataset")

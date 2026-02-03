# Colab Dataset Update Script
!pip install -q kagglehub huggingface-hub pandas

import kagglehub
import os

# Download Kaggle datasets
kaggle_datasets = [
    "fahd09/hadith-dataset",
    "zusmani/hadithsahibukhari",
    "mamun18/islam-qa-dataset"
]

for dataset in kaggle_datasets:
    try:
        path = kagglehub.dataset_download(dataset)
        print(f"✅ {dataset} downloaded")
    except Exception as e:
        print(f"⚠️ {dataset} failed: {e}")

# Create directory structure
os.makedirs("quranlab-islamic-dataset/audio/quran_recitations", exist_ok=True)
os.makedirs("quranlab-islamic-dataset/text/quran", exist_ok=True)
os.makedirs("quranlab-islamic-dataset/text/hadith", exist_ok=True)
os.makedirs("quranlab-islamic-dataset/text/fiqh", exist_ok=True)

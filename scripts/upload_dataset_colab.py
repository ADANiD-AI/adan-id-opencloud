# Upload dataset to Hugging Face - Colab Updated Version
!pip install -q huggingface-hub

import os
os.environ["HF_TOKEN"] = "hf_fghiidiurhyd"

# Login to Hugging Face
!huggingface-cli login --token $HF_TOKEN

# Upload model
!huggingface-cli upload ADANiD/islamic-ai-foundation \
    models/islamic-ai-foundation \
    ./ \
    --repo-type model

# Upload dataset
!huggingface-cli upload ADANiD/Quranlab-islamic-dataset \
    datasets/quranlab-islamic-dataset \
    ./ \
    --repo-type dataset

print("✅ Model and dataset uploaded successfully!")
print("🔗 Model: https://huggingface.co/ADANiD/islamic-ai-foundation")
print("🔗 Dataset: https://huggingface.co/datasets/ADANiD/Quranlab-islamic-dataset")

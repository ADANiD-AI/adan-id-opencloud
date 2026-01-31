# QuranLab AI Model

This directory contains a placeholder for the trained model.

🔗 **Actual model is hosted on Hugging Face**:  
👉 https://huggingface.co/ADANiD-AI/quranlab-tajweed-scoring

## How to Load
```python
from huggingface_hub import hf_hub_download
import joblib

model = joblib.load(hf_hub_download(
    repo_id="ADANiD-AI/quranlab-tajweed-scoring",
    filename="quranlab_tajweed_v1.pkl"
))
```

## License
Non-commercial use only. See Hugging Face model card.

---
license: other
datasets:
- ADANiD/Quranlab-islamic-dataset
- adnanmd76/nooreabjad-dataset
base_model: bert-base-uncased
library_name: transformers
tags:
- islamic-ai
- quran
- hadith
- fiqh
- abjad
- adanid-ecosystem
- foundation-model
- multilingual
- noor-e-abjad
- tajweed
- jannah-points
---

# 🌙 ADANiD Islamic AI Foundation Model

> **World's first foundation model for comprehensive Islamic knowledge processing with Noor-e-Abjad integration**

## 🧠 Enhanced Capabilities
- **Quranic Analysis**: Recitation, Tajweed correction, Abjad validation with Jannah Points
- **Hadith Processing**: Authentication, classification, isnad analysis with Sahih collections
- **Fiqh Understanding**: Multi-madhhab rulings, contemporary issues with Islamic QA
- **Multilingual Support**: Arabic, Urdu, English with proper diacritics handling
- **Ethical Compliance**: Quranic principles built-in with ADANiD proprietary license
- **Noor-e-Abjad Integration**: Classical Hisab al-Jummal with 786 validation

## 🔧 Universal Integration

### As Base Model
```python
from transformers import AutoModelForSequenceClassification, AutoTokenizer

model = AutoModelForSequenceClassification.from_pretrained("ADANiD/islamic-ai-foundation")
tokenizer = AutoTokenizer.from_pretrained("ADANiD/islamic-ai-foundation")
```

### For Fine-tuning with Noor-e-Abjad Dataset
```python
from datasets import load_dataset

# Load Noor-e-Abjad dataset
dataset = load_dataset("adnanmd76/nooreabjad-dataset")
# Your fine-tuning code here
from transformers import Trainer, TrainingArguments

training_args = TrainingArguments(
    output_dir="./nooreabjad-finetuned",
    per_device_train_batch_size=4,
    num_train_epochs=3,
    fp16=True
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=dataset["train"]
)
```

### For Merging with Other Models
```yaml
# mergekit-template.yaml
models:
  - model: ADANiD/islamic-ai-foundation
    weight: 0.6
    parameters:
      - name: classifier
        weight: 0.7
  - model: aubmindlab/bert-base-arabertv2
    weight: 0.4
    parameters:
      - name: encoder
        weight: 0.3
merge_method: linear
dtype: float16
```

### API Integration
```python
# FastAPI integration
from fastapi import FastAPI
app = FastAPI()

@app.post("/validate-abjad")
async def validate_abjad(text: str):
    inputs = tokenizer(text, return_tensors="pt")
    outputs = model(**inputs)
    return {"prediction": outputs.logits.argmax().item()}
```

## 🔗 Ecosystem Integration
- **Kaggle Dataset**: [nooreabjad-dataset](https://www.kaggle.com/datasets/adnanmd76/nooreabjad-dataset)- **GitHub Repository**: [adan-id-opencloud](https://github.com/ADANiD-AI/adan-id-opencloud)
- **Hugging Face Dataset**: [Quranlab-islamic-dataset](https://huggingface.co/datasets/ADANiD/Quranlab-islamic-dataset)
- **Live Demo**: [Quranlab Demo Space](https://huggingface.co/spaces/ADANiD/quranlab-demo)

## 🔒 ADANiD Proprietary License
- ✅ **FREE** for educational, non-commercial use
- ✅ **PERMITTED**: Madaris, universities, non-profit Islamic organizations
- ✅ **ALLOWED**: Personal spiritual development and Quranic recitation practice
- ❌ **PROHIBITED**: Commercial applications without paid license
- ❌ **ABSOLUTELY FORBIDDEN**: Military, government, or enterprise use

> **"And We have certainly made the Qur’an easy for remembrance..." — Quran 54:17**
> **"Read in the name of your Lord who created..." — Quran 96:1**

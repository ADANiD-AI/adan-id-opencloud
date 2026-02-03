---
license: other
datasets:
- ADANiD/Quranlab-islamic-dataset
base_model: 
- google/electra-base-discriminator
- CAMeL-Lab/bert-base-arabic-camelbert-msa
- asafaya/bert-base-arabic
- aubmindlab/bert-base-arabertv2
- UBC-NLP/MARBERT
library_name: transformers
tags:
- quran
- hadith
- fiqh
- document-analysis
- arabic-nlp
- islamic-ai
- adanid-ecosystem
- merged-model
---

# 📖 Quranlab-AI: Islamic Knowledge Extraction System

> **First AI system for comprehensive Islamic knowledge extraction from documents**

## 🧠 Model Details
**Model Type**: Merged Multi-Model Architecture  
**Parent Models**: 5 state-of-the-art Arabic language models  
**Merging Technique**: Linear Merge (MergeKit)

## 🚀 How to Use
```python
from transformers import pipeline

classifier = pipeline("text-classification", model="ADANiD/Quranlab-AI")
result = classifier("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ")
print(result)
```

> **"Read in the name of your Lord who created..." — Quran 96:1**

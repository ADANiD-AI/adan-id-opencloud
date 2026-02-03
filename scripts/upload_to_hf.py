# Upload to Hugging Face - Updated Version
import os
import subprocess

def upload_to_hf():
    # Set HF token
    os.environ["HF_TOKEN"] = "hf_mmmmhfjjjnkdfjjjggkvhj"
    
    # Login
    subprocess.run(["huggingface-cli", "login", "--token", os.environ["HF_TOKEN"]])
    
    # Upload model
    subprocess.run([
        "huggingface-cli", "upload", 
        "ADANiD/islamic-ai-foundation",
        "models/islamic-ai-foundation",
        "./",
        "--repo-type", "model"
    ])
    
    # Upload dataset
    subprocess.run([
        "huggingface-cli", "upload",
        "ADANiD/Quranlab-islamic-dataset", 
        "datasets/quranlab-islamic-dataset",
        "./",
        "--repo-type", "dataset"
    ])
    
    print("✅ All models and datasets uploaded to Hugging Face!")

if __name__ == "__main__":
    upload_to_hf()

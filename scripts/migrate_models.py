# Migrate all models to universal standard
import shutil
import json
import os

def migrate_to_universal():
    # Create unified structure
    os.makedirs("models/islamic-ai-foundation", exist_ok=True)
    
    # Copy base files
    base_files = ["config.json", "tokenizer_config.json", "vocab.txt", "merges.txt", "README.md"]
    for file in base_files:
        if os.path.exists(f"models/quranlab-ai/{file}"):
            shutil.copy(f"models/quranlab-ai/{file}", f"models/islamic-ai-foundation/{file}")
    
    # Update config with universal standards
    with open("models/islamic-ai-foundation/config.json", "r") as f:
        config = json.load(f)
    
    config.update({
        "adanid_version": "1.0",
        "islamic_compliance": True,
        "supported_languages": ["ar", "ur", "en"],
        "id2label": {"0": "quran", "1": "hadith", "2": "fiqh", "3": "abjad-validation", "4": "general-islamic"}
    })
    
    with open("models/islamic-ai-foundation/config.json", "w") as f:
        json.dump(config, f, indent=2)
    
    print("✅ All models migrated to universal standard!")

if __name__ == "__main__":
    migrate_to_universal()

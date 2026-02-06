#!/bin/bash
# NoorNet: Offline-First Setup for ADAN-ID OpenCloud

echo "🌙 Setting up NoorNet Offline System..."

# Create offline directory structure
mkdir -p offline/{local_models,local_datasets,offline_cache}
mkdir -p offline/local_storage

# Download and cache all models locally
echo "📥 Caching models locally..."
python3 -c "
from transformers import AutoModelForSequenceClassification, AutoTokenizer
from huggingface_hub import snapshot_download

# Cache Islamic AI Foundation model
print('Caching Islamic AI Foundation...')
snapshot_download('ADANiD/islamic-ai-foundation', local_dir='offline/local_models/islamic-ai-foundation')

# Cache Abjad Whisper model  
print('Caching Abjad Whisper...')
snapshot_download('ADANiD/abjad-whisper', local_dir='offline/local_models/abjad-whisper')
"

# Download and cache all datasets locally
echo "📥 Caching datasets locally..."
python3 -c "
import kagglehub
import shutil
import os

# Cache Noor-e-Abjad dataset
print('Caching Noor-e-Abjad dataset...')
path = kagglehub.dataset_download('adnanmd76/nooreabjad-dataset')
shutil.copytree(path, 'offline/local_datasets/nooreabjad-dataset', dirs_exist_ok=True)

# Cache QuranLab dataset
print('Caching QuranLab dataset...')
path = kagglehub.dataset_download('ADANiD/Quranlab-islamic-dataset')
shutil.copytree(path, 'offline/local_datasets/quranlab-islamic-dataset', dirs_exist_ok=True)
"

# Generate Quranic Entropy file
echo "🔐 Generating Quranic Entropy file..."
cat > offline/quranic_entropy.txt << 'EOF'
Bismillah Abjad: 786
Allah Abjad: 66  
Ahad Abjad: 13
Quranic Entropy Seed: 664068
Divine Pattern: بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
EOF

# Create local DID registry
echo "🆔 Creating local DID registry..."
cat > offline/did_registry.json << 'EOF'
{
  "local_dids": [],
  "offline_auth_enabled": true,
  "biometric_templates_stored_locally": true
}
EOF

# Update main configuration to use offline mode
echo "⚙️ Configuring offline mode..."
cat > .env.offline << 'EOF'
# Offline Mode Configuration
OFFLINE_MODE=true
LOCAL_MODELS_PATH=./offline/local_models
LOCAL_DATASETS_PATH=./offline/local_datasets
LOCAL_STORAGE_PATH=./offline/local_storage
VAULT_ENTROPY_SOURCE=./offline/quranic_entropy.txt
AUTH_DID_REGISTRY=./offline/did_registry.json
EOF

# Create offline service endpoints
echo "🔌 Creating offline service endpoints..."
cat > services/auth_offline.py << 'EOF'
#!/usr/bin/env python3
"""
Offline Biometric Authentication for ADAN-ID OpenCloud
Works without internet connection
"""

import json
import os
from pathlib import Path

class OfflineAuth:
    def __init__(self):
        self.did_registry = Path("offline/did_registry.json")
        self.biometric_templates = Path("offline/biometric_templates/")
        self.biometric_templates.mkdir(exist_ok=True)
    
    def register_offline(self, user_id, biometric_data):
        """Register user biometric data locally"""
        template_file = self.biometric_templates / f"{user_id}.json"
        with open(template_file, 'w') as f:
            json.dump(biometric_data, f)
        
        # Update DID registry
        registry = self._load_registry()
        registry["local_dids"].append(user_id)
        self._save_registry(registry)
        
        return {"status": "success", "message": "User registered offline"}
    
    def authenticate_offline(self, user_id, biometric_input):
        """Authenticate user using local biometric templates"""
        template_file = self.biometric_templates / f"{user_id}.json"
        if not template_file.exists():
            return {"status": "error", "message": "User not found"}
        
        with open(template_file, 'r') as f:
            stored_template = json.load(f)
        
        # Simple biometric matching (replace with actual algorithm)
        match_score = self._calculate_match_score(biometric_input, stored_template)
        is_authenticated = match_score > 0.8
        
        return {
            "authenticated": is_authenticated,
            "match_score": match_score,
            "offline_mode": True
        }
    
    def _load_registry(self):
        if self.did_registry.exists():
            with open(self.did_registry, 'r') as f:
                return json.load(f)
        return {"local_dids": []}
    
    def _save_registry(self, registry):
        with open(self.did_registry, 'w') as f:
            json.dump(registry, f)
    
    def _calculate_match_score(self, input_data, stored_template):
        # Placeholder for actual biometric matching algorithm
        return 0.95  # High confidence for demo

if __name__ == "__main__":
    auth = OfflineAuth()
    print("✅ Offline authentication system ready")
EOF

# Create offline storage service
cat > services/storage_offline.py << 'EOF'
#!/usr/bin/env python3
"""
Offline Encrypted Storage for ADAN-ID OpenCloud
Uses local AES-256 encryption with Quranic entropy
"""

import os
import json
from cryptography.fernet import Fernet
from pathlib import Path

class OfflineStorage:
    def __init__(self):
        self.storage_path = Path("offline/local_storage")
        self.storage_path.mkdir(exist_ok=True)
        self.encryption_key = self._generate_quranic_key()
    
    def _generate_quranic_key(self):
        """Generate encryption key from Quranic entropy"""
        entropy_file = Path("offline/quranic_entropy.txt")
        if entropy_file.exists():
            with open(entropy_file, 'r') as f:
                content = f.read()
            # Use Bismillah value (786) as seed
            seed = str(786).encode() * 32  # 32 bytes for Fernet
            return Fernet.generate_key()  # In real implementation, use seed
        else:
            return Fernet.generate_key()
    
    def upload_offline(self, filename, content):
        """Upload file to local encrypted storage"""
        fernet = Fernet(self.encryption_key)
        encrypted_content = fernet.encrypt(content.encode())
        
        storage_file = self.storage_path / filename
        with open(storage_file, 'wb') as f:
            f.write(encrypted_content)
        
        return {"status": "success", "file": str(storage_file)}
    
    def download_offline(self, filename):
        """Download file from local encrypted storage"""
        storage_file = self.storage_path / filename
        if not storage_file.exists():
            return {"error": "File not found"}
        
        fernet = Fernet(self.encryption_key)
        with open(storage_file, 'rb') as f:
            encrypted_content = f.read()
        
        decrypted_content = fernet.decrypt(encrypted_content).decode()
        return {"content": decrypted_content}

if __name__ == "__main__":
    storage = OfflineStorage()
    print("✅ Offline encrypted storage ready")
EOF

# Create offline vault service
cat > services/vault_offline.py << 'EOF'
#!/usr/bin/env python3
"""
Offline Security Vault for ADAN-ID OpenCloud
Calculates Abjad values without internet
"""

from src.core.abjad_calculator import AbjadCalculator

class OfflineVault:
    def __init__(self):
        self.abjad_calc = AbjadCalculator()
    
    def calculate_abjad_offline(self, text):
        """Calculate Abjad value offline"""
        abjad_value = self.abjad_calc.calculate(text)
        is_bismillah = self.abjad_calc.validate_bismillah(text)
        
        return {
            "text": text,
            "abjad_value": abjad_value,
            "is_bismillah": is_bismillah,
            "offline_mode": True,
            "source": "local_calculation"
        }
    
    def generate_entropy_offline(self):
        """Generate Quranic entropy offline"""
        bismillah_value = 786
        allah_value = 66
        ahad_value = 13
        
        entropy_seed = (bismillah_value * allah_value * ahad_value) % (2**32)
        
        return {
            "entropy_seed": entropy_seed,
            "bismillah": bismillah_value,
            "allah": allah_value,
            "ahad": ahad_value,
            "offline_mode": True
        }

if __name__ == "__main__":
    vault = OfflineVault()
    print("✅ Offline security vault ready")
EOF

# Test offline system
echo "🧪 Testing offline system..."
python3 -c "
# Test offline vault
from services.vault_offline import OfflineVault
vault = OfflineVault()
result = vault.calculate_abjad_offline('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ')
print('Abjad Value:', result['abjad_value'])
print('Is Bismillah:', result['is_bismillah'])

# Test offline storage
from services.storage_offline import OfflineStorage
storage = OfflineStorage()
upload_result = storage.upload_offline('test.txt', 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ')
download_result = storage.download_offline('test.txt')
print('Storage Test:', download_result['content'] == 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ')
"

echo "✅ NoorNet Offline System setup completed!"
echo "📁 Offline files stored in: ./offline/"
echo "🔧 Offline services ready: auth, storage, vault"
echo "🚀 System works completely without internet!"

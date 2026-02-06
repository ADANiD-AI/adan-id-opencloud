#!/usr/bin/env python3
"""
Offline Router for ADAN-ID OpenCloud
Routes requests to offline services when internet is unavailable
"""

import os
import json
from pathlib import Path

class OfflineRouter:
    def __init__(self):
        self.offline_config = self._load_offline_config()
        self.offline_mode = self.offline_config.get("offline_mode", {}).get("enabled", False)
    
    def _load_offline_config(self):
        config_file = Path("offline/offline_config.json")
        if config_file.exists():
            with open(config_file, 'r') as f:
                return json.load(f)
        return {"offline_mode": {"enabled": False}}
    
    def route_request(self, endpoint, data=None):
        """Route request to appropriate offline service"""
        if not self.offline_mode:
            return {"error": "Offline mode not enabled"}
        
        if endpoint == "/auth/biometric/offline":
            from services.auth_offline import OfflineAuth
            auth = OfflineAuth()
            return auth.authenticate_offline(data.get("user_id"), data.get("biometric_input"))
        
        elif endpoint == "/storage/offline/upload":
            from services.storage_offline import OfflineStorage
            storage = OfflineStorage()
            return storage.upload_offline(data.get("filename"), data.get("content"))
        
        elif endpoint == "/storage/offline/download":
            from services.storage_offline import OfflineStorage
            storage = OfflineStorage()
            return storage.download_offline(data.get("filename"))
        
        elif endpoint == "/vault/abjad/offline":
            from services.vault_offline import OfflineVault
            vault = OfflineVault()
            return vault.calculate_abjad_offline(data.get("text"))
        
        elif endpoint == "/vault/entropy/offline":
            from services.vault_offline import OfflineVault
            vault = OfflineVault()
            return vault.generate_entropy_offline()
        
        else:
            return {"error": "Offline endpoint not supported"}

# Usage example
if __name__ == "__main__":
    router = OfflineRouter()
    print("✅ Offline router ready")

# /backend/app/plugins/security/vault_client.py
import hvac
import os
from apscheduler.schedulers.background import BackgroundScheduler


class VaultClient:
    def __init__(self):
        self.client = hvac.Client(
            url=os.getenv("VAULT_ADDR"),
            token=os.getenv("VAULT_TOKEN")
        )
    
    def rotate_keys(self):
        self.client.secrets.transit.rotate_key(name="aes-key")
        self.client.secrets.transit.rotate_key(name="fernet-key")
    
    def get_secret(self, path: str) -> bytes:
        response = self.client.secrets.kv.v2.read_secret_version(path=path)
        return response['data']['data']['value']
    
    def start_key_rotation(self):
        scheduler = BackgroundScheduler()
        scheduler.add_job(
            func=self.rotate_keys,
            trigger="interval",
            hours=24
        )
        scheduler.start()
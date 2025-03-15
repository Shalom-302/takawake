# /backend/app/plugins/security/deception_service.py

from fastapi import Request
import random
import logging
from datetime import datetime

class DeceptionService:
    def __init__(self):
        self.fake_db = {
            "users": ["admin", "root", "postgres"],
            "endpoints": [
                "/internal/users",
                "/admin/backup",
                "/.git/config"
            ]
        }
        self.honeytokens = {
            "aws_keys": [
                "AKIAXXXXXXXXXXXXXXXX:YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY"
            ],
            "db_creds": [
                "postgres://admin:password@localhost:5432"
            ]
        }

    async def log_deception_event(self, request: Request, trap_type: str):
        attacker_ip = request.client.host
        user_agent = request.headers.get("User-Agent", "")
        payload = await request.body()
        
        logging.warning(f"""
        🕵️ DECEPTION TRAP TRIGGERED!
        Type: {trap_type}
        IP: {attacker_ip}
        User-Agent: {user_agent}
        Payload: {payload[:500]}
        Timestamp: {datetime.utcnow().isoformat()}
        """)

    def generate_credential_leak(self):
        return random.choice([
            "<?php system($_GET['cmd']); ?>",
            "ENV DB_PASSWORD='s3cr3t'",
            "ssh-rsa AAAAB3NzaC1yc2E...",
            "X-Api-Key: abcdef123456"
        ])
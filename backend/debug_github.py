"""
Script de débogage pour diagnostiquer l'authentification GitHub.
"""
import sys
import os
from pathlib import Path
from typing import Dict, Any
import logging

# Configurons le logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Vérifions l'existence du fichier .env
env_path = Path(__file__).parent / ".env"
logger.info(f"Checking .env file at: {env_path}")
if env_path.exists():
    logger.info("👍 .env file exists")
else:
    logger.error("❌ .env file does not exist")

# Vérifions les variables d'environnement pour GitHub
github_client_id = os.getenv("GITHUB_CLIENT_ID")
github_client_secret = os.getenv("GITHUB_CLIENT_SECRET")

logger.info(f"GITHUB_CLIENT_ID set: {bool(github_client_id)}")
logger.info(f"GITHUB_CLIENT_SECRET set: {bool(github_client_secret)}")

# Log pour aider à configurer un nouveau compte GitHub OAuth
logger.info("\n=== Pour configurer GitHub OAuth ===")
logger.info("1. Allez sur https://github.com/settings/applications/new")
logger.info("2. Enregistrez une nouvelle application OAuth:")
logger.info("   - Nom de l'application: Simple Kaapi")
logger.info("   - URL du site: http://localhost:3000")
logger.info("   - Description: Application de gestion de café (facultatif)")
logger.info("   - URL de callback: http://localhost:3000/oauth/callback")
logger.info("3. Une fois créée, copiez le Client ID et générez un nouveau Client Secret")
logger.info("4. Ajoutez les lignes suivantes à votre fichier .env:")
logger.info("GITHUB_CLIENT_ID=<votre-client-id>")
logger.info("GITHUB_CLIENT_SECRET=<votre-client-secret>")
logger.info("5. Redémarrez votre application")

print("\nInstructions imprimées. Veuillez suivre les étapes ci-dessus pour configurer GitHub OAuth.")

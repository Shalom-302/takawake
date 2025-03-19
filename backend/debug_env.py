import os
from dotenv import load_dotenv

# Charger les variables d'environnement depuis le fichier .env
load_dotenv()

# Vérifier si les variables Facebook sont définies
facebook_id = os.getenv("FACEBOOK_CLIENT_ID")
facebook_secret = os.getenv("FACEBOOK_CLIENT_SECRET")

print(f"FACEBOOK_CLIENT_ID est {'défini' if facebook_id else 'non défini'}")
if facebook_id:
    print(f"FACEBOOK_CLIENT_ID a {len(facebook_id)} caractères")
    print(f"Premiers caractères: {facebook_id[:4]}...")

print(f"FACEBOOK_CLIENT_SECRET est {'défini' if facebook_secret else 'non défini'}")
if facebook_secret:
    print(f"FACEBOOK_CLIENT_SECRET a {len(facebook_secret)} caractères")
    print(f"Premiers caractères: {facebook_secret[:4]}...")

# Vérifiez également la variable de redirection
redirect_uri = os.getenv("FACEBOOK_WEBHOOK_OAUTH_REDIRECT_URI")
print(f"FACEBOOK_WEBHOOK_OAUTH_REDIRECT_URI est {'défini' if redirect_uri else 'non défini'}")
if redirect_uri:
    print(f"FACEBOOK_WEBHOOK_OAUTH_REDIRECT_URI: {redirect_uri}")

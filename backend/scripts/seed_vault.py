#!/usr/bin/env python3
"""Seed Vault avec les clés de chiffrement attendues par l'API.

Le compose lance Vault en mode dev (store éphémère, vidé à chaque redémarrage).
L'API, en `ENVIRONMENT=production`, exige `encryption/aes-key` et
`encryption/fernet-key` dans Vault sinon elle crashe au démarrage
(cf. CryptoService → AESGCM).

Ce script écrit ces deux secrets à partir de variables d'env. Idempotent :
relancé à chaque `up`, il réécrit les mêmes valeurs, donc les clés restent
STABLES tant que KAAPI_AES_KEY / KAAPI_FERNET_KEY ne changent pas — condition
indispensable pour rester capable de déchiffrer les données existantes.

Générer les clés une fois :
  AES    : python -c "import os,base64;print(base64.b64encode(os.urandom(32)).decode())"
  Fernet : python -c "from cryptography.fernet import Fernet;print(Fernet.generate_key().decode())"
"""
import base64
import logging
import os
import sys
import time

import hvac
from cryptography.fernet import Fernet

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
log = logging.getLogger("vault-seed")

VAULT_ADDR = os.getenv("VAULT_ADDR", "http://vault:8200")
VAULT_TOKEN = os.getenv("VAULT_TOKEN", "dev-token")
AES_KEY = os.getenv("KAAPI_AES_KEY")          # base64 de 16/24/32 octets
FERNET_KEY = os.getenv("KAAPI_FERNET_KEY")    # clé Fernet (urlsafe base64)


def _read_existing(client: hvac.Client, path: str) -> str | None:
    """Valeur déjà stockée à `path`, ou None si le secret n'existe pas."""
    try:
        response = client.secrets.kv.v2.read_secret_version(path=path)
        return response["data"]["data"]["value"]
    except hvac.exceptions.InvalidPath:
        return None
    except Exception as exc:  # noqa: BLE001
        log.warning(f"Lecture de {path} impossible : {exc}")
        return None


def main() -> None:
    if not AES_KEY:
        log.error(
            "KAAPI_AES_KEY manquant. Génère-le : "
            'python -c "import os,base64;print(base64.b64encode(os.urandom(32)).decode())"'
        )
        sys.exit(1)

    # Valider que la clé AES décode bien vers une longueur acceptée par AES-GCM.
    try:
        if len(base64.b64decode(AES_KEY)) not in (16, 24, 32):
            log.error("KAAPI_AES_KEY doit décoder vers 16, 24 ou 32 octets (AES-128/192/256)")
            sys.exit(1)
    except Exception as exc:  # noqa: BLE001
        log.error(f"KAAPI_AES_KEY invalide (base64 attendu) : {exc}")
        sys.exit(1)

    client = hvac.Client(url=VAULT_ADDR, token=VAULT_TOKEN)

    # Attendre que Vault soit prêt (le service démarre en parallèle).
    for attempt in range(30):
        try:
            if client.is_authenticated():
                break
        except Exception as exc:  # noqa: BLE001
            log.info(f"Vault pas encore prêt ({attempt + 1}/30) : {exc}")
        time.sleep(2)
    else:
        log.error(f"Vault injoignable / non authentifié après 60s sur {VAULT_ADDR}")
        sys.exit(1)

    # Fernet : sans clé fournie, on RÉUTILISE celle déjà dans Vault avant d'en
    # générer une. Plusieurs conteneurs (api, celery) exécutent ce script au
    # démarrage ; générer à l'aveugle ferait écraser la clé de l'un par l'autre,
    # rendant indéchiffrables les données chiffrées entre-temps.
    fernet_key = FERNET_KEY
    if not fernet_key:
        fernet_key = _read_existing(client, "encryption/fernet-key")
        if fernet_key:
            log.warning("KAAPI_FERNET_KEY non fourni — réutilisation de la clé déjà présente dans Vault")
        else:
            fernet_key = Fernet.generate_key().decode()
            log.warning(
                "KAAPI_FERNET_KEY non fourni et absent de Vault — clé générée à la volée. "
                "Vault étant en mode dev (store en mémoire), elle sera PERDUE au prochain "
                "redémarrage de Vault : renseigne KAAPI_FERNET_KEY pour une clé stable."
            )

    # KV v2 monté sur `secret/` en mode dev ; get_secret lit data.data.value.
    client.secrets.kv.v2.create_or_update_secret(
        path="encryption/aes-key", secret={"value": AES_KEY}
    )
    client.secrets.kv.v2.create_or_update_secret(
        path="encryption/fernet-key", secret={"value": fernet_key}
    )
    log.info("Secrets seedés : encryption/aes-key, encryption/fernet-key")


if __name__ == "__main__":
    main()

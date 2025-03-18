"""
Script pour prévisualiser les changements de migration sans les appliquer.
Ce script crée une migration temporaire et affiche les modifications qui seraient appliquées.

Usage:
    python -m app.commands.preview_migration
"""
import os
import sys
import subprocess
import uuid
import re
from pathlib import Path

from app.core.config import settings
from app.commands.init_migration import get_backend_dir, run_alembic_command


def preview_migration():
    """
    Génère une migration temporaire pour prévisualiser les changements.
    """
    # Générer un ID temporaire pour la migration
    temp_id = str(uuid.uuid4())[:8]
    temp_message = f"temp_preview_{temp_id}"
    
    try:
        # Générer une migration temporaire
        print("Génération d'une migration temporaire pour prévisualiser les changements...")
        stdout, stderr, return_code = run_alembic_command(["alembic", "revision", "--autogenerate", "-m", temp_message])
        
        if return_code != 0:
            print(f"Erreur lors de la génération de la migration: {stderr}")
            return False
        
        # Trouver le fichier de migration temporaire
        versions_dir = get_backend_dir() / "migrations" / "versions"
        temp_file = None
        
        for file in versions_dir.glob("*.py"):
            if temp_message in file.name:
                temp_file = file
                break
        
        if not temp_file:
            print("Aucun fichier de migration temporaire n'a été trouvé.")
            return False
        
        # Lire et afficher le contenu du fichier de migration
        print("\n" + "=" * 80)
        print(f"APERÇU DES CHANGEMENTS DE MIGRATION:")
        print("=" * 80)
        
        with open(temp_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
            # Extraire les fonctions upgrade() et downgrade()
            upgrade_match = re.search(r'def upgrade\(\).*?:(.+?)(?=def downgrade|\Z)', content, re.DOTALL)
            downgrade_match = re.search(r'def downgrade\(\).*?:(.+?)(?=\Z)', content, re.DOTALL)
            
            if upgrade_match:
                print("\nOPÉRATIONS DE MISE À JOUR (upgrade):")
                print("-" * 80)
                upgrade_content = upgrade_match.group(1).strip()
                if upgrade_content:
                    print(upgrade_content)
                else:
                    print("Aucune opération de mise à jour.")
            
            if downgrade_match:
                print("\nOPÉRATIONS DE RETOUR EN ARRIÈRE (downgrade):")
                print("-" * 80)
                downgrade_content = downgrade_match.group(1).strip()
                if downgrade_content:
                    print(downgrade_content)
                else:
                    print("Aucune opération de retour en arrière.")
        
        print("\n" + "=" * 80)
        print("FIN DE L'APERÇU")
        print("=" * 80)
        
        # Supprimer le fichier de migration temporaire
        print(f"\nSuppression du fichier de migration temporaire: {temp_file.name}")
        temp_file.unlink()
        
        return True
    
    except Exception as e:
        print(f"Erreur lors de la prévisualisation de la migration: {str(e)}")
        return False


if __name__ == "__main__":
    success = preview_migration()
    if not success:
        sys.exit(1)

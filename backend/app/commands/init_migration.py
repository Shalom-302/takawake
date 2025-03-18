"""
Script pour initialiser correctement les migrations Alembic en tenant compte
de tous les plugins et modèles disponibles dans l'application.

Usage:
    python -m app.commands.init_migration

Ce script va:
1. Créer une migration initial_schema qui capture tous les modèles
2. Appliquer cette migration à la base de données
"""
import os
import sys
import subprocess
import importlib
import time
from datetime import datetime
from pathlib import Path
from typing import List, Tuple

from app.core.config import settings
from app.plugins.plugin_manager import load_plugins_into_app
from app.core.db import Base, engine


def get_backend_dir() -> Path:
    """Retourne le chemin vers le répertoire backend."""
    return Path(__file__).resolve().parent.parent.parent


def run_alembic_command(command: List[str], env_vars=None) -> Tuple[str, str, int]:
    """
    Exécute une commande alembic avec les bons paramètres d'environnement.
    
    Args:
        command: La commande alembic à exécuter
        env_vars: Variables d'environnement supplémentaires
        
    Returns:
        Tuple de (stdout, stderr, return_code)
    """
    # Vérifier si nous sommes déjà dans un conteneur Docker
    in_docker = os.path.exists('/.dockerenv')
    backend_dir = get_backend_dir()
    
    # Configuration de l'environnement
    env = os.environ.copy()
    if env_vars:
        env.update(env_vars)
        
    env["PYTHONPATH"] = str(backend_dir)
    
    # Utiliser 'kaapi' comme nom de container pour la base de données
    db_url = settings.DB_URL
    if "@db:" in db_url:
        db_url = db_url.replace("@db:", "@kaapi:")
    elif "@kaapi-db:" in db_url:
        db_url = db_url.replace("@kaapi-db:", "@kaapi:")
    env["DB_URL"] = db_url
    
    # Exécution de la commande
    print(f"Exécution de: {' '.join(command)}")
    process = subprocess.Popen(
        command,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        cwd=str(backend_dir),
        env=env
    )
    
    stdout, stderr = process.communicate()
    return stdout, stderr, process.returncode


def get_latest_migration_file():
    """Récupère le chemin vers le fichier de migration le plus récent."""
    migrations_dir = get_backend_dir() / "migrations" / "versions"
    migration_files = list(migrations_dir.glob("*.py"))
    
    if not migration_files:
        return None
    
    # Trier par date de modification pour obtenir le plus récent
    latest_file = max(migration_files, key=lambda f: f.stat().st_mtime)
    return latest_file


def direct_fix_file(file_path):
    """Corrige directement le formatage du fichier en utilisant une expression régulière."""
    import re
    
    # Lire le fichier complet
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Utiliser une expression régulière pour localiser et corriger précisément le problème
    pattern = r'(# ### end Alembic commands ###)(def downgrade)'  # Groupe 1: marqueur, Groupe 2: début fonction
    
    if re.search(pattern, content):
        # Remplacer par le marqueur, suivi de 3 sauts de ligne, puis le début de la fonction
        corrected_content = re.sub(pattern, r'\1\n\n\n\2', content)
        
        # Sauvegarde du contenu corrigé
        with open(file_path, 'w') as f:
            f.write(corrected_content)
        
        print(f"Formatage corrigé avec regex dans le fichier {file_path}")
        return True
    
    # Vérifier d'autres variantes possibles du problème
    alt_pattern = r'(# ### end Alembic commands ###)([^\n])'  # Marqueur suivi directement par un caractère (sans saut de ligne)
    
    if re.search(alt_pattern, content):
        # Ajouter des sauts de ligne après le marqueur, puis le contenu trouvé
        corrected_content = re.sub(alt_pattern, r'\1\n\n\n\2', content)
        
        # Sauvegarde du contenu corrigé
        with open(file_path, 'w') as f:
            f.write(corrected_content)
        
        print(f"Formatage corrigé (variante) avec regex dans le fichier {file_path}")
        return True
    
    return False


def fix_migration_file(migration_file):
    """Corrige le fichier de migration pour échanger les fonctions upgrade et downgrade
    et corriger les problèmes de formatage potentiels. Ce correctif est spécifiquement conçu
    pour résoudre le problème où Alembic peut générer un fichier où les opérations de
    suppression sont dans la fonction upgrade et celles de création dans downgrade."""
    import re
    
    print("Début de la correction du fichier de migration...")
    
    # Correction directe des problèmes de formatage
    direct_fix_file(migration_file)
    
    # Lire le fichier entier comme une seule chaîne maintenant qu'il est corrigé
    with open(migration_file, 'r') as f:
        content = f.read()
    
    # Vérifier si le fichier contient des opérations drop_table dans upgrade()
    # et des opérations create_table dans downgrade()
    has_drop_in_upgrade = 'op.drop_table' in content and content.find('op.drop_table') < content.find('def downgrade')
    
    # Si nous détectons ce problème, alors nous devons échanger les contenus
    if has_drop_in_upgrade:
        print("Erreur détectée: La fonction upgrade() supprime des tables au lieu de les créer.")
        print("Inversion des fonctions upgrade() et downgrade()...")
        
        # Recherche des fonctions avec un pattern plus robuste
        upgrade_match = re.search(r'def upgrade\(\)[^\n]*:[\s\S]*?(?=\n\s*def downgrade\(\)|$)', content)
        downgrade_match = re.search(r'def downgrade\(\)[^\n]*:[\s\S]*?$', content)
        
        if upgrade_match and downgrade_match:
            upgrade_content = upgrade_match.group(0)
            downgrade_content = downgrade_match.group(0)
            
            # Extraire le corps de chaque fonction (tout après la déclaration et le :)
            upgrade_body = re.sub(r'^def upgrade\(\)[^:]*:', '', upgrade_content).strip()
            downgrade_body = re.sub(r'^def downgrade\(\)[^:]*:', '', downgrade_content).strip()
            
            # Échanger explicitement les corps des fonctions
            new_content = content.replace(upgrade_match.group(0), f"def upgrade() -> None:\n{downgrade_body}")
            new_content = new_content.replace(downgrade_match.group(0), f"def downgrade() -> None:\n{upgrade_body}")
            
            # Écrire le nouveau contenu corrigé dans le fichier
            with open(migration_file, 'w') as f:
                f.write(new_content)
                
            print("Correction appliquée: Les fonctions upgrade() et downgrade() ont été inversées.")
            return True
        else:
            print("Impossible de trouver correctement les fonctions upgrade() et downgrade().")
    else:
        print("Le fichier de migration semble correct (pas d'opérations drop_table détectées dans upgrade()).")
    
    # Si nous arrivons ici, soit il n'y avait pas de problème, soit nous n'avons pas pu le corriger
    # On essaie alors la méthode précédente pour assurer un formatage correct
    
    # Maintenant trouver les fonctions upgrade et downgrade
    upgrade_pattern = re.compile(r'def upgrade\(\).*?(?=def downgrade\(\)|$)', re.DOTALL)
    downgrade_pattern = re.compile(r'def downgrade\(\).*', re.DOTALL)
    
    upgrade_match = upgrade_pattern.search(content)
    downgrade_match = downgrade_pattern.search(content)
    
    if not upgrade_match:
        print("\nAvertissement: Fonction upgrade() non trouvée. Impossible de continuer.")
        return False
    
    if not downgrade_match:
        print("\nAvertissement: Fonction downgrade() non trouvée. Tentative d'ajout...")
        # Ajouter une fonction downgrade basique si elle n'existe pas
        if upgrade_match:
            content += "\n\n\ndef downgrade() -> None:\n    # ### commands auto generated by Alembic - please adjust! ###\n    pass\n    # ### end Alembic commands ###"
            with open(migration_file, 'w') as f:
                f.write(content)
            print("Fonction downgrade() ajoutée au fichier de migration.")
            return True
        return False
    
    # Si nous avons les deux fonctions mais qu'elles ont besoin de formatage
    upgrade_content = upgrade_match.group(0)
    downgrade_content = downgrade_match.group(0)
    
    # Extraire le corps de chaque fonction
    upgrade_body = re.sub(r'def upgrade\(\)[^:]*:', '', upgrade_content).strip()
    downgrade_body = re.sub(r'def downgrade\(\)[^:]*:', '', downgrade_content).strip()
    
    # Formater correctement les fonctions
    new_upgrade = "def upgrade() -> None:\n" + upgrade_body
    new_downgrade = "def downgrade() -> None:\n" + downgrade_body
    
    # Créer le nouveau contenu du fichier
    new_content = re.sub(upgrade_pattern, new_upgrade, content)
    new_content = re.sub(downgrade_pattern, new_downgrade, new_content)
    
    # Écrire le nouveau contenu dans le fichier
    with open(migration_file, 'w') as f:
        f.write(new_content)
        
    print("Format des fonctions upgrade() et downgrade() corrigé.")
    return True


def auto_fix_migration_format(content):
    """Tente de corriger les problèmes de formatage fréquents dans les fichiers de migration."""
    import re
    
    # Détection plus robuste du problème de formatage courant
    pattern_downgrade_issue = r'(# ### end Alembic commands ###)def downgrade\(\)'
    if re.search(pattern_downgrade_issue, content):
        print("Problème détecté: 'def downgrade()' est accolé aux commentaires Alembic.")
        # Correction directe avec espace ample pour éviter des problèmes
        content = content.replace(
            '# ### end Alembic commands ###def downgrade()',
            '# ### end Alembic commands ###\n\n\ndef downgrade()'
        )
        print("Correction appliquée pour le formatage de 'def downgrade()'")
    
    # Cas 1: Les autres variantes où un 'def' est accolé à la fin des commentaires
    content = re.sub(r'(# ### end .*?commands ###)def', r'\1\n\n\ndef', content)
    
    # Cas 2: Espaces ou tabs manquants pour l'indentation
    lines = content.split('\n')
    for i in range(len(lines)):
        if lines[i].lstrip().startswith('op.') and not lines[i].startswith('    '):
            lines[i] = '    ' + lines[i].lstrip()
    content = '\n'.join(lines)
    
    # Cas 3: Détecter si le fichier contient upgrade et downgrade mais sans formatage correct
    if 'def upgrade()' in content and 'def downgrade()' in content:
        upgrade_index = content.find('def upgrade()')
        downgrade_index = content.find('def downgrade()')
        
        if upgrade_index > 0 and downgrade_index > upgrade_index:
            # Le fichier contient les deux fonctions dans le bon ordre, mais peut-être mal formaté
            header = content[:upgrade_index].strip()
            between_funcs = content[upgrade_index:downgrade_index].strip()
            remainder = content[downgrade_index:].strip()
            
            # Reconstruire avec un formatage correct
            content = f"{header}\n\ndef upgrade() -> None:\n{between_funcs[len('def upgrade() -> None:'):].strip()}\n\n\ndef downgrade() -> None:\n{remainder[len('def downgrade() -> None:'):].strip()}"
    
    return content


def generate_models_script(migration_file):
    """Modifie le fichier de migration pour inclure le schéma complet des tables existantes."""
    from sqlalchemy import MetaData, Table
    from sqlalchemy.schema import CreateTable
    
    # Inspecter la base de données pour obtenir le schéma complet
    metadata = MetaData()
    metadata.reflect(bind=engine)
    
    # Générer les déclarations CreateTable pour chaque table
    create_statements = []
    for table_name in sorted(metadata.tables):
        table = metadata.tables[table_name]
        create_statement = str(CreateTable(table).compile(engine))
        # Formater pour Python
        create_statement = create_statement.replace('\n', ' ').replace("'", "\\'").replace('"', '\\"')
        create_statements.append(f"    op.execute(\"\"\"CREATE TABLE IF NOT EXISTS {table_name} ({create_statement[len(f'CREATE TABLE {table_name} ('):]}\"\"\")")  
    
    # Lire le contenu du fichier existant
    with open(migration_file, 'r') as f:
        content = f.read()
    
    # Remplacer la fonction upgrade() par une nouvelle version avec nos instructions
    upgrade_content = "def upgrade() -> None:\n    # ### commands auto generated by init_migration ###\n"
    upgrade_content += "\n".join(create_statements)
    upgrade_content += "\n    # ### end of commands ###\n"
    
    # Rechercher et remplacer la fonction upgrade() existante
    import re
    pattern = r"def upgrade\(\).*?def downgrade\(\)"
    replacement = upgrade_content + "\n\ndef downgrade()"
    new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    # Écrire le contenu modifié dans le fichier
    with open(migration_file, 'w') as f:
        f.write(new_content)


# Import global des modèles pour s'assurer qu'ils sont tous chargés
from app.models import *

def import_all_models():
    """
    S'assure que tous les modèles définis dans l'application sont chargés,
    y compris ceux définis dans les plugins.
    """
    
    # Créer une application fictive pour le chargement des plugins
    from fastapi import FastAPI
    dummy_app = FastAPI()
    # Chargement explicite des plugins pour s'assurer que leurs modèles sont importés
    load_plugins_into_app(dummy_app)
    
    # Vérification des modèles chargés
    print(f"Modèles SQLAlchemy chargés: {len(Base.metadata.tables)}")
    print("Tables détectées:")
    for table_name in sorted(Base.metadata.tables.keys()):
        print(f"  - {table_name}")


def update_db_references_in_docker():
    """
    Met à jour les références à 'db' pour utiliser 'kaapi' dans le container Docker.
    """
    # Vérifier si nous sommes dans Docker
    in_docker = os.path.exists('/.dockerenv')
    if not in_docker:
        return
        
    # Mettre à jour /etc/hosts pour pointer db vers kaapi (localhost)
    try:
        with open('/etc/hosts', 'r') as f:
            hosts_content = f.read()
            
        if 'db' not in hosts_content:
            with open('/etc/hosts', 'a') as f:
                f.write('\n127.0.0.1 db\n')
            print("✅ Ajout de 'db' dans /etc/hosts pour pointer vers localhost")
    except Exception as e:
        print(f"⚠️ Impossible de mettre à jour /etc/hosts: {str(e)}")


def init_migration():
    """
    Initialise la migration Alembic en recréant entièrement la base de données.
    
    Returns:
        bool: True si l'initialisation a réussi, False sinon
    """
    # Mettre à jour les références à la base de données
    update_db_references_in_docker()
    
    # S'assurer que tous les modèles sont importés
    import_all_models()
    
    # Étape 1: Supprimer toutes les anciennes révisions pour un départ propre
    versions_dir = get_backend_dir() / "migrations" / "versions"
    for file in versions_dir.glob("*.py"):
        if file.name != "__init__.py":
            print(f"Suppression de l'ancienne révision: {file.name}")
            file.unlink()
    
    # Approche simplifiée: vider la base, créer les tables, puis générer une migration initiale
    from sqlalchemy import text
    
    try:
        # Utiliser la connexion à la base de données
        print("\n1. Vidage complet de la base de données...")
        conn = engine.connect()
        conn = conn.execution_options(isolation_level="AUTOCOMMIT")
        
        # 1. Désactiver les contraintes de clés étrangères pendant les opérations
        conn.execute(text("SET session_replication_role = 'replica';"))
        
        # 2. Supprimer toutes les tables existantes avec CASCADE
        conn.execute(text("""
        DO $$
        DECLARE
            r RECORD;
        BEGIN
            FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = current_schema()) LOOP
                EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
            END LOOP;
        END $$;
        """))
        
        # 3. Supprimer également les séquences existantes
        conn.execute(text("""
        DO $$
        DECLARE
            r RECORD;
        BEGIN
            FOR r IN (SELECT sequencename FROM pg_sequences WHERE schemaname = current_schema()) LOOP
                EXECUTE 'DROP SEQUENCE IF EXISTS ' || quote_ident(r.sequencename) || ' CASCADE';
            END LOOP;
        END $$;
        """))
        
        # 4. Réactiver les contraintes de clés étrangères
        conn.execute(text("SET session_replication_role = 'origin';"))
        
        conn.close()
        print("Base de données complètement vidée.")
        
        # 5. Créer les tables directement avec SQLAlchemy
        print("\n2. Création des tables via SQLAlchemy...")
        Base.metadata.create_all(bind=engine)
        print("Tables créées avec succès.")
        
        # 6. Initialiser Alembic pour qu'il reconnaisse l'état actuel comme base
        print("\n3. Initialisation d'Alembic avec la version actuelle...")
        
        # 6.1 - Créer un fichier de révision initial
        stdout, stderr, return_code = run_alembic_command(["alembic", "revision", "--autogenerate", "-m", "initial schema"])
        if return_code != 0:
            print(f"Erreur lors de la génération de la révision: {stderr}")
            sys.exit(1)
        print("Génération de la migration initiale réussie.")
        
        # 6.2 - Corriger le contenu de la migration directement avec Python
        migration_file = get_latest_migration_file()
        if migration_file:
            print(f"Fichier de migration trouvé: {migration_file}")
            
            # Créons un fichier de migration complètement nouveau
            print("Création d'un fichier de migration personnalisé avec un format correct...")
            
            # Attendre que le fichier soit complètement écrit
            import time
            time.sleep(1)
            
            try:
                # Extraire les informations importantes
                # Convertir l'objet PosixPath en chaîne
                migration_file_str = str(migration_file)
                revision_id = migration_file_str.split("/")[-1].split("_")[0]
                migration_name = "initial_schema"
                timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]
                
                # Lire le contenu actuel pour extraire les parties importantes (tables créées et supprimées)
                # Nous pouvons utiliser l'objet Path directement avec open()
                with open(migration_file, 'r', encoding='utf-8') as f:
                    original_content = f.read()
                
                # Utiliser une approche plus sécurisée pour extraire les blocs upgrade/downgrade
                import re
                
                # Chercher le contenu entre def upgrade() et # ### end Alembic commands ###
                upgrade_match = re.search(r'def upgrade\(\)[^#]*?(# ### commands auto generated by Alembic.*?# ### end Alembic commands ###)', original_content, re.DOTALL)
                upgrade_body = ""
                if upgrade_match:
                    upgrade_body = upgrade_match.group(1)
                
                # Chercher le contenu entre def downgrade() et # ### end Alembic commands ###
                downgrade_match = re.search(r'def downgrade\(\)[^#]*?(# ### commands auto generated by Alembic.*?# ### end Alembic commands ###)', original_content, re.DOTALL)
                downgrade_body = ""
                if downgrade_match:
                    downgrade_body = downgrade_match.group(1)
                
                # Si nous n'avons pas trouvé les corps, utiliser des valeurs par défaut
                if not upgrade_body:
                    upgrade_body = "    # ### commands auto generated by Alembic - please adjust! ###\n    pass\n    # ### end Alembic commands ###"
                
                if not downgrade_body:
                    downgrade_body = "    # ### commands auto generated by Alembic - please adjust! ###\n    pass\n    # ### end Alembic commands ###"
                
                # Créer un nouveau contenu de fichier en évitant les f-strings multilignes
                new_content = (
                    f'"""{migration_name}\n\n'
                    f'Revision ID: {revision_id}\n'
                    f'Revises: \n'
                    f'Create Date: {timestamp}\n\n"""\n'
                    'from typing import Sequence, Union\n\n'
                    'from alembic import op\n'
                    'import sqlalchemy as sa\n\n\n'
                    '# revision identifiers, used by Alembic.\n'
                    f"revision = '{revision_id}'\n"
                    'down_revision = None\n'
                    'branch_labels = None\n'
                    'depends_on = None\n\n\n'
                    'def upgrade() -> None:\n'
                    f'{upgrade_body}\n\n\n'
                    'def downgrade() -> None:\n'
                    f'{downgrade_body}'
                )
                
                # Écrire le nouveau contenu dans le fichier
                # L'objet PosixPath fonctionne directement avec open()
                with open(migration_file, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                
                # Appliquer notre fonction fix_migration_file pour s'assurer que le format est correct
                # Cette fonction s'assure que upgrade crée les tables et downgrade les supprime
                fix_migration_file(migration_file)
                
                print("Migration réécrite avec le bon format pour les fonctions upgrade et downgrade.")
                
            except Exception as e:
                print(f"Erreur lors de la correction du fichier de migration: {str(e)}")
                return False
        else:
            print("Aucun fichier de migration trouvé.")
            return False
        
        # 6.3 - Marquer la base comme étant à jour sans tenter de créer les tables (puisqu'elles existent déjà)
        stdout, stderr, return_code = run_alembic_command(["alembic", "stamp", "head"])
        if return_code != 0:
            print(f"Erreur lors du marquage de la base comme étant à jour: {stderr}")
            return False
            
        print("Base de données marquée comme étant à jour avec les migrations Alembic.")
            
    except Exception as e:
        print(f"Erreur lors de l'initialisation de la base de données: {str(e)}")
        return False
    
    print("\n✅ Initialisation des migrations terminée")
    print("La base de données est maintenant synchronisée avec les modèles")
    return True


if __name__ == "__main__":
    success = init_migration()
    if not success:
        sys.exit(1)

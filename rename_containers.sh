#!/bin/bash
set -e

# Script pour renommer les containers Docker selon les spécifications
echo "Renommage des containers Docker..."

# 1. Arrêter les containers existants
echo "Arrêt des containers actuels..."
cd backend
docker-compose down

# 2. Modifier le fichier docker-compose.yml
echo "Modification de la configuration Docker..."

# Renommer le container de base de données de kaapi-db à kaapi
sed -i '' 's/container_name: kaapi-db/container_name: kaapi/g' docker-compose.yml 

# Mettre à jour toutes les références à la base de données dans les autres services
sed -i '' 's/DATABASE_URL=postgresql:\/\/postgres:postgres@db:5432\/kaapi/DATABASE_URL=postgresql:\/\/postgres:postgres@kaapi:5432\/kaapi/g' docker-compose.yml
sed -i '' 's/- db/- kaapi/g' docker-compose.yml

# Mettre à jour le service db (s'il y a un service nommé 'db', le renommer)
sed -i '' 's/^  db:/  kaapi:/g' docker-compose.yml

# 3. Démarrer avec la nouvelle configuration
echo "Démarrage des containers avec la nouvelle configuration..."
docker-compose up -d

echo "Renommage terminé avec succès !"
echo "Le container de base de données s'appelle maintenant 'kaapi' au lieu de 'kaapi-db'"
echo ""
echo "Vous pouvez maintenant utiliser les commandes suivantes :"
echo "  - python kaapi_cli.py db init      # Initialiser la migration"
echo "  - python kaapi_cli.py db generate  # Générer une nouvelle migration"
echo "  - python kaapi_cli.py db apply     # Appliquer les migrations"
echo "  - python kaapi_cli.py db preview   # Prévisualiser les changements"

#!/bin/bash
set -e

# Script pour renommer le container de base de données de kaapi à kaapi-db
echo "Renommage du container de base de données en kaapi-db..."

# 1. Arrêter les containers existants
echo "Arrêt des containers actuels..."
cd backend
docker-compose down

# 2. Modifier le fichier docker-compose.yml
echo "Modification de la configuration Docker..."

# Renommer le container de base de données de kaapi à kaapi-db
sed -i '' 's/container_name: kaapi/container_name: kaapi-db/g' docker-compose.yml 

# Mettre à jour toutes les références à la base de données dans les autres services
sed -i '' 's/DATABASE_URL=postgresql:\/\/postgres:postgres@kaapi:5432\/kaapi/DATABASE_URL=postgresql:\/\/postgres:postgres@kaapi-db:5432\/kaapi/g' docker-compose.yml
sed -i '' 's/- kaapi$/- kaapi-db/g' docker-compose.yml

# Mettre à jour le service kaapi (le renommer en kaapi-db)
sed -i '' 's/^  kaapi:/  kaapi-db:/g' docker-compose.yml

# S'assurer que tous les réseaux sont correctement nommés kaapi-network
echo "Correction des noms de réseaux..."
sed -i '' 's/kaapi-db-network/kaapi-network/g' docker-compose.yml

# 3. Démarrer avec la nouvelle configuration
echo "Démarrage des containers avec la nouvelle configuration..."
docker-compose up -d

echo "Renommage terminé avec succès !"
echo "Le container de base de données s'appelle maintenant 'kaapi-db' au lieu de 'kaapi'"
echo ""

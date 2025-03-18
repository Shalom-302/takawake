#!/bin/bash

# Script pour corriger les références dans les fichiers /etc/hosts des conteneurs
# Configuration des couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Mise à jour des références de base de données dans les conteneurs Docker...${NC}"

# Vérifier si Docker est en cours d'exécution
if ! docker ps >/dev/null 2>&1; then
    echo -e "${RED}⚠️ Docker n'est pas en cours d'exécution. Veuillez démarrer Docker et réessayer.${NC}"
    exit 1
fi

# Récupérer l'IP du conteneur kaapi-db
KAAPI_DB_IP=$(docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' kaapi-db)

if [ -z "$KAAPI_DB_IP" ]; then
    echo -e "${RED}⚠️ Impossible de récupérer l'adresse IP du conteneur kaapi-db.${NC}"
    exit 1
fi

echo -e "${YELLOW}Adresse IP du conteneur kaapi-db: $KAAPI_DB_IP${NC}"

# Ajouter une entrée pour 'kaapi' dans /etc/hosts de chaque conteneur
for container in $(docker ps -q); do
    CONTAINER_NAME=$(docker inspect --format='{{.Name}}' $container | sed 's/\///')
    echo -e "${BLUE}Mise à jour de /etc/hosts pour le conteneur $CONTAINER_NAME...${NC}"
    
    # Ajouter des entrées pour 'kaapi' et 'db' dans /etc/hosts
    docker exec $container bash -c "grep -q 'kaapi' /etc/hosts || echo '$KAAPI_DB_IP kaapi' >> /etc/hosts"
    docker exec $container bash -c "grep -q 'db' /etc/hosts || echo '$KAAPI_DB_IP db' >> /etc/hosts"
    
    # Afficher le contenu du fichier /etc/hosts pour vérification
    echo -e "${YELLOW}Contenu de /etc/hosts pour $CONTAINER_NAME:${NC}"
    docker exec $container cat /etc/hosts
    echo ""
done

echo -e "${GREEN}Mise à jour des références de base de données terminée.${NC}"
echo -e "${GREEN}Tous les conteneurs ont maintenant des entrées pour 'kaapi' et 'db' pointant vers le conteneur kaapi-db.${NC}"

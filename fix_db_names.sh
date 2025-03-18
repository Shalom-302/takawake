#!/bin/bash

# Script pour forcer la mise à jour des références de base de données dans le conteneur Docker
# Ce script ajoute une entrée pour 'db' dans /etc/hosts pointant vers l'adresse IP du conteneur kaapi

# Configuration des couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Mise à jour des références de base de données dans le conteneur Docker...${NC}"

# Vérifier si Docker est en cours d'exécution
if ! docker ps >/dev/null 2>&1; then
    echo -e "${RED}⚠️ Docker n'est pas en cours d'exécution. Veuillez démarrer Docker et réessayer.${NC}"
    exit 1
fi

# Récupérer l'ID du conteneur kaapi
KAAPI_CONTAINER_ID=$(docker ps | grep kaapi | grep -v grep | awk '{print $1}' | head -n 1)

if [ -z "$KAAPI_CONTAINER_ID" ]; then
    echo -e "${RED}⚠️ Aucun conteneur kaapi trouvé en cours d'exécution.${NC}"
    exit 1
fi

echo -e "${YELLOW}ID du conteneur kaapi trouvé: $KAAPI_CONTAINER_ID${NC}"

# Récupérer l'adresse IP du conteneur kaapi
KAAPI_IP=$(docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $KAAPI_CONTAINER_ID)

if [ -z "$KAAPI_IP" ]; then
    echo -e "${RED}⚠️ Impossible de récupérer l'adresse IP du conteneur kaapi.${NC}"
    exit 1
fi

echo -e "${YELLOW}Adresse IP du conteneur kaapi: $KAAPI_IP${NC}"

# Ajouter une entrée pour 'db' dans /etc/hosts de chaque conteneur
for container in $(docker ps -q); do
    echo -e "${BLUE}Mise à jour de /etc/hosts pour le conteneur $container...${NC}"
    
    # Vérifier si 'db' est déjà dans /etc/hosts
    if docker exec $container grep -q "db" /etc/hosts; then
        # Mettre à jour l'entrée existante
        docker exec $container sed -i "s/.*db/$KAAPI_IP db/g" /etc/hosts
    else
        # Ajouter une nouvelle entrée
        docker exec $container bash -c "echo '$KAAPI_IP db' >> /etc/hosts"
    fi
    
    # Vérifier le contenu de /etc/hosts
    echo -e "${YELLOW}Contenu actuel de /etc/hosts pour le conteneur $container:${NC}"
    docker exec $container cat /etc/hosts
    echo ""
done

echo -e "${GREEN}Mise à jour des références de base de données terminée avec succès.${NC}"
echo -e "${GREEN}Tous les conteneurs ont maintenant une entrée pour 'db' pointant vers le conteneur kaapi.${NC}"

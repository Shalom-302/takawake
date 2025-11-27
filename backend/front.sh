#!/bin/bash

# Script principal de l'architecture du front
# Ce script recrée tous les fichiers du frontent next 

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🚀 Création du frontent à partir de l'architecture Entropie..."
echo "📁 Répertoire du projet: $PROJECT_ROOT"
echo ""

cd "$PROJECT_ROOT"

# Créer les dossiers principaux
echo "📂 Création de la structure des dossiers..."
mkdir -p src/app
mkdir -p src/components/sections
mkdir -p src/components/ui
mkdir -p src/lib/hooks
mkdir -p src/hooks
mkdir -p src/visual-edits
mkdir -p public

# Exécuter les scripts de restauration
echo ""
echo "⚙️  Restauration des fichiers de configuration..."
bash "$SCRIPT_DIR/restore-config.sh"

echo ""
echo "📄 Restauration des fichiers de l'application..."
bash "$SCRIPT_DIR/restore-app.sh"

echo ""
echo "🧩 Restauration des composants sections..."
bash "$SCRIPT_DIR/restore-sections.sh"

echo ""
echo "🎨 Restauration des composants UI..."
bash "$SCRIPT_DIR/restore-ui.sh"

echo ""
echo "🔧 Restauration des utilitaires..."
bash "$SCRIPT_DIR/restore-lib.sh"

echo ""
echo "📦 Restauration des fichiers divers..."
bash "$SCRIPT_DIR/restore-misc.sh"

echo ""
echo "✅ Restauration terminée avec succès!"
echo ""
echo "💡 Prochaines étapes:"
echo "   1. Installez les dépendances: npm install"
echo "   2. Lancez le serveur de développement: npm run dev"
echo ""

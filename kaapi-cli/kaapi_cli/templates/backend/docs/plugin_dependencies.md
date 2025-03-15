# Gestion des Dépendances pour les Plugins Kaapi

Ce document explique comment gérer les dépendances des plugins dans Kaapi.

## Structure des Dépendances

Kaapi utilise une architecture modulaire pour la gestion des dépendances :

1. **requirements.txt principal** : Contient les dépendances de base nécessaires au fonctionnement du cœur de Kaapi.
2. **Fichiers requirements.txt spécifiques à chaque plugin** : Chaque plugin a son propre fichier `requirements.txt` dans son répertoire.

## Comment Ça Fonctionne

### Pour les Développeurs de Plugins

Si vous développez un plugin :

1. Créez un fichier `requirements.txt` dans le répertoire de votre plugin.
2. Ajoutez uniquement les dépendances spécifiques à votre plugin.
3. Spécifiez les versions minimales recommandées.
4. Ajoutez des commentaires pour expliquer pourquoi chaque dépendance est nécessaire.

Exemple :

```txt
# Plugin Advanced Internationalization
pycountry>=22.3.5  # Pour la gestion des noms de pays et codes
babel>=2.12.1      # Pour le support des formats de date/heure localisés
polib>=1.2.0       # Pour l'import/export de fichiers PO/POT
```

### Pour les Utilisateurs

Pour installer toutes les dépendances :

1. **Installation des dépendances de base** :

   ```bash
   pip install -r requirements.txt
   ```

2. **Installation des dépendances des plugins** :

   ```bash
   python install_plugin_requirements.py
   ```

3. **Installation des dépendances d'un plugin spécifique** :

   ```bash
   python install_plugin_requirements.py --plugin advanced_i18n
   ```

4. **Génération d'un fichier requirements consolidé** :

   ```bash
   python install_plugin_requirements.py --generate
   ```

   Cela créera un fichier `requirements-plugins.txt` avec toutes les dépendances des plugins.

## Résolution des Conflits

Si deux plugins requièrent des versions différentes de la même dépendance :

1. Le script `install_plugin_requirements.py` installe toujours la version la plus récente.
2. Pour résoudre manuellement un conflit, spécifiez la version exacte dans le fichier `requirements.txt` principal.

## Bonnes Pratiques

1. **Minimisez les dépendances** : N'incluez que les dépendances absolument nécessaires.
2. **Spécifiez les versions** : Utilisez `>=` pour indiquer la version minimale requise.
3. **Documentez** : Ajoutez des commentaires pour expliquer l'usage de chaque dépendance.
4. **Partagez les dépendances communes** : Si plusieurs plugins utilisent la même bibliothèque, envisagez de la déplacer vers le `requirements.txt` principal.

## Tests de Compatibilité

Avant chaque release, exécutez :

```bash
python install_plugin_requirements.py --generate
pip install -r requirements.txt -r requirements-plugins.txt
pytest
```

Cela garantit que toutes les dépendances sont compatibles et fonctionnent ensemble.

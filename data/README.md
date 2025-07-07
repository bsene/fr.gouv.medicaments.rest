# Dossier Data

Ce dossier contient les fichiers de données de la base de données publique des médicaments.

## Fichiers

- `*.txt` : Fichiers de données téléchargés depuis le site gouvernemental
- `meta.json` : Métadonnées sur les téléchargements (dates, sources)
- `meta.json.example` : Exemple de structure du fichier meta.json

## Gestion des données

1. **Téléchargement automatique** : Les fichiers sont mis à jour toutes les 24h si le serveur source est disponible
2. **Fallback** : Si le serveur est indisponible, les fichiers inclus dans le repository sont utilisés
3. **Encodage** : Tous les fichiers sont automatiquement convertis en UTF-8
4. **Métadonnées** : Le fichier `meta.json` garde trace des dates de téléchargement

## Note

Le fichier `meta.json` est ignoré par Git car il est spécifique à chaque installation.
Les fichiers `.txt` sont inclus dans le repository pour garantir le fonctionnement même si le serveur source est indisponible.
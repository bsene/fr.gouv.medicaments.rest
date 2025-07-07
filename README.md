# API REST - Base de données publique des médicaments

![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)
![Maintainer](https://img.shields.io/badge/maintainer-Mathieu%20Vedie-blue)
![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Contributions](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)

API REST publique pour exploiter les données de la base de données publique des médicaments du gouvernement français.

## 🌐 Démo en ligne

**Service hébergé à titre d'exemple :** [bdpmgf.vedielaute.fr](http://bdpmgf.vedielaute.fr)

> ⚠️ Ce service de démonstration est fourni à titre d'exemple uniquement. Pour un usage en production, nous recommandons d'héberger votre propre instance.

## Fonctionnalités

- ✅ Téléchargement automatique des données (mise à jour toutes les 24h)
- ✅ Recherche avec wildcards (* et ?)
- ✅ Pagination
- ✅ API sans clé d'authentification
- ✅ Réponses JSON
- ✅ Attribution correcte des données gouvernementales

## Endpoints disponibles

### Health Check
- `GET /api/health` - Status de l'API

### Spécialités pharmaceutiques
- `GET /api/medicaments/specialites` - Liste des spécialités
- `GET /api/medicaments/specialites/:cis` - Détail d'une spécialité avec données liées
- `GET /api/medicaments/specialites?q=doliprane*` - Recherche avec wildcard

### Autres endpoints
- `GET /api/medicaments/presentations` - Présentations
- `GET /api/medicaments/compositions` - Compositions
- `GET /api/medicaments/generiques` - Groupes génériques
- `GET /api/medicaments/ruptures` - Ruptures de stock
- `GET /api/medicaments/search?q=aspirine` - Recherche globale

### Paramètres de requête
- `q` - Terme de recherche (supporte * et ?)
- `page` - Numéro de page (défaut: 1)
- `limit` - Nombre d'éléments par page (défaut: 100, max: 1000)
- `pretty` - Formatage JSON (true/1 pour JSON indenté)

## Démarrage avec Docker

```bash
# Cloner le repo
git clone <votre-repo>
cd fr.gouv.medicaments.rest

# Lancer avec docker-compose
docker-compose up -d

# Vérifier le status
curl http://localhost:3000/api/health
```

## Développement local

```bash
npm install
npm run dev
```

## Attribution

Cette API utilise la "base de données publique des médicaments" fournie par le gouvernement français.
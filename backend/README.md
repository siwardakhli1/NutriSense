# NutriSense Backend v2

## Endpoints principaux

| Méthode | URL | Description |
|---|---|---|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion |
| POST | `/api/auth/refresh` | Renouveler l'access token |
| POST | `/api/auth/logout` | Déconnexion |
| GET | `/api/auth/export` | **Export RGPD** de toutes les données |
| DELETE | `/api/auth/account` | **Suppression RGPD** cascade |
| GET | `/api/nutrition/product/:barcode` | Produit via Open Food Facts + conseil IA |
| POST | `/api/nutrition/photo/analyze` | Analyse de repas photo |
| POST | `/api/ai/advice` | Conseil IA personnalisé (RAG + LLM) |
| GET | `/api/ai/history` | Historique conversation |
| GET | `/api/analytics/dashboard` | Dashboard complet |
| GET | `/api/analytics/daily` | Stats journalières |
| GET | `/api/analytics/weight` | Courbe poids |
| GET | `/api/fridge/items` | Contenu frigo |
| POST | `/api/fridge/items` | Ajouter item |
| GET | `/api/fridge/suggestions` | **Recettes selon frigo** |
| GET | `/api/fridge/recommendations` | Recommandations perso |
| POST | `/api/logs/nutrition` | Logger un repas |
| POST | `/api/logs/water` | Ajouter hydratation |
| POST | `/api/logs/weight` | Enregistrer pesée |
| POST | `/api/health-goals` | Définir objectif + calcul BMR |
| GET | `/api/recipes` | Liste recettes |
| GET | `/api/preferences` | Préférences user |

## Doc interactive

Après `npm run dev`, va sur `http://localhost:3000/api/docs`.

# NutriSense

**Coach nutritionnel mobile intelligent** — Application React Native + Backend Express/PostgreSQL avec IA embarquée.

NutriSense combine planification de repas, scan de produits, coaching IA et suivi nutritionnel dans une application mobile multilingue (5 langues), pensée pour aider chacun à mieux manger selon ses préférences, son budget et ses objectifs de santé.

---

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Démarrage](#démarrage)
- [Structure du projet](#structure-du-projet)
- [API](#api)
- [Sécurité](#sécurité)
- [Tests](#tests)
- [CI/CD](#cicd)
- [Multilingue](#multilingue)
- [Conformité RGPD](#conformité-rgpd)

---

## Fonctionnalités

### Planification de repas
- Génération automatique d'un plan hebdomadaire (21 repas) via un algorithme de scoring
- Anti-répétition stricte : chaque semaine, 21 recettes différentes
- Auto-régénération quand la semaine expire
- Adaptation aux régimes : végan, végétarien, halal, keto, sans gluten, sans lactose
- Liste de courses générée automatiquement à partir du plan

### Base de recettes
- 65 recettes de cuisine du monde (française, italienne, marocaine, indienne, japonaise, mexicaine, etc.)
- Recettes personnelles : création, modification, export au format JSON
- Favoris et partage via le sélecteur natif iOS/Android

### Coach IA nutritionnel
- Assistant conversationnel basé sur **Mistral AI**
- **RAG-lite** avec base de connaissances ANSES/PNNS (10 chunks vectorisés + cosine similarity)
- Sources citées à chaque réponse
- Historique conversationnel persisté
- Mode fallback (règles) si LLM indisponible

### Scanner de produits
- Scan de codes-barres via **expo-camera**
- Intégration temps réel avec l'API **Open Food Facts**
- Affichage Nutri-Score, NOVA, Éco-Score, allergènes
- **Comparateur d'alternatives** : suggère 3 produits plus sains dans la même catégorie
- Auto-log dans le journal nutritionnel

### Mode Frigo intelligent
- Saisie des ingrédients disponibles avec suggestions rapides
- Suggestion de recettes réalisables avec **matching flou** (dictionnaire de synonymes)
- Affichage des ingrédients manquants pour chaque recette

### Suivi nutritionnel
- Dashboard avec streak, adhérence, insights personnalisés
- Graphiques calories (14 jours) et poids
- Objectif santé calculé via formule **Mifflin-St Jeor** (BMR + activité)
- Suivi des macros (protéines, glucides, lipides, fibres, eau)

### Compte utilisateur
- Inscription / connexion avec JWT
- Refresh token rotation
- Réinitialisation de mot de passe par email (code à 6 chiffres, 15 min de validité)
- Changement de mot de passe depuis le profil

---

## Stack technique

### Frontend (mobile)
- **React Native 0.76** + **Expo SDK 52**
- **Expo Router** (file-based routing)
- **TypeScript 5.3** (strict mode)
- **AsyncStorage** pour la persistance locale
- **expo-camera** pour le scan de codes-barres
- **Material Top Tabs** pour la navigation à sous-onglets
- **I18nManager** pour la gestion RTL (arabe)

### Backend (API)
- **Node.js 20** + **Express 4**
- **TypeScript** avec compilation stricte
- **Prisma ORM** avec **PostgreSQL 16**
- **JWT** (jsonwebtoken) + **bcrypt** (cost 12)
- **Zod** pour la validation des schémas
- **Helmet** + **express-rate-limit** pour la sécurité
- **Swagger** (OpenAPI 3.0) auto-généré
- **Jest** + **Supertest** pour les tests

### Services externes
- **Mistral AI** (chat completions)
- **Open Food Facts API v2** (données produits)
- **Resend** (envoi d'emails transactionnels)

### DevOps
- **Docker** multi-stage (backend)
- **docker-compose** (PostgreSQL + adminer)
- **GitHub Actions** (CI/CD 4 jobs)

---

## Architecture

Architecture en couches côté backend, séparation stricte des responsabilités :

```
backend/src/
├── config/          # Configuration (database, env)
├── middlewares/     # Authentification, validation, rate limit
├── routes/          # Endpoints Express (thin controllers)
├── services/        # Logique métier
├── schemas/         # Validation Zod
├── db/              # Seeding et scripts BDD
└── utils/           # Helpers
```

Modélisation Prisma avec **13 tables** :

| Domaine | Tables |
|---|---|
| Utilisateur | `users`, `user_preferences`, `refresh_tokens`, `password_reset_tokens` |
| Recettes | `recipes`, `favorites` |
| Planification | `week_plans`, `shopping_lists` |
| Suivi | `health_goals`, `nutrition_logs`, `weight_logs` |
| IA | `ai_conversations` |
| Divers | `product_cache`, `fridge_items` |

Toutes les relations utilisent `onDelete: Cascade` pour respecter le RGPD.

---

## Installation

### Prérequis

- **Node.js** 20 ou supérieur
- **Docker Desktop** (pour PostgreSQL)
- **npm** 9+
- Un émulateur Android/iOS ou l'app **Expo Go** sur ton téléphone

### Cloner le projet

```bash
git clone https://github.com/siwardakhli1/NutriSense.git
cd NutriSense
```

---

## Configuration

### Base de données PostgreSQL

Démarrer PostgreSQL via Docker :

```bash
docker compose up -d postgres
```

### Variables d'environnement (backend)

Créer `backend/.env` à partir du template :

```bash
cd backend
cp .env.example .env
```

Contenu minimal :

```ini
NODE_ENV=development
PORT=3000

DATABASE_URL=postgresql://nutrisense:nutrisense@localhost:5432/nutrisense

JWT_SECRET=change-me-with-a-random-secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# LLM : "mistral", "openai" ou "fallback"
LLM_PROVIDER=fallback
LLM_API_KEY=
LLM_MODEL=mistral-small-latest
LLM_BASE_URL=https://api.mistral.ai/v1

# Email : "console" (dev), "resend" ou "gmail"
EMAIL_PROVIDER=console
RESEND_API_KEY=
EMAIL_FROM=onboarding@resend.dev

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
RATE_LIMIT_AI_MAX=20
```

### Migrations Prisma

```bash
cd backend
npx prisma generate
npx prisma migrate dev
```

Les migrations créent les 13 tables. Au premier démarrage, les **65 recettes** sont insérées automatiquement.

### IP du backend (frontend)

Pour un émulateur Android, dans `services/api.ts` :

```ts
const API_BASE_URL = 'http://10.0.2.2:3000/api';
```

Pour un téléphone physique en Wi-Fi, remplacer par l'IP de la machine :

```ts
const API_BASE_URL = 'http://192.168.1.20:3000/api';
```

---

## Démarrage

### Backend

```bash
cd backend
npm install
npm run dev
```

Le serveur démarre sur `http://localhost:3000`. Documentation Swagger disponible sur `http://localhost:3000/api/docs`.

### Frontend

Dans un second terminal, à la racine :

```bash
npm install
npx expo start
```

Puis :
- **`a`** pour lancer sur l'émulateur Android
- **`i`** pour lancer sur l'émulateur iOS
- Scanner le QR code avec l'app **Expo Go** pour un téléphone physique

---

## Structure du projet

```
NutriSense/
├── app/                          # Écrans Expo Router
│   ├── (auth)/                   # Login, register, forgot password
│   ├── (onboarding)/             # Onboarding en 3 étapes
│   ├── (tabs)/                   # Navigation principale
│   │   ├── index.tsx             # Plan repas hebdomadaire
│   │   ├── cuisine/              # Recettes, frigo, scanner, courses
│   │   ├── coach.tsx             # Assistant IA
│   │   ├── suivi/                # Stats et santé
│   │   └── profile.tsx           # Profil utilisateur
│   ├── recipe/[id].tsx           # Détail d'une recette
│   ├── preferences.tsx           # Édition des préférences
│   ├── favorites.tsx             # Recettes favorites
│   ├── my-recipes.tsx            # Recettes personnelles
│   ├── edit-recipe.tsx           # Création / édition de recette
│   ├── change-password.tsx       # Changement mot de passe
│   └── _layout.tsx               # Layout racine (auth guard)
├── components/                   # Composants réutilisables
├── contexts/                     # AuthContext, MealPlanContext, ThemeContext, LanguageContext
├── hooks/                        # useAppContexts, useNativeAPIs, useShare
├── i18n/                         # Traductions FR, EN, ES, IT, AR
├── services/api.ts               # Client HTTP avec refresh auto
├── types/index.ts                # Types TypeScript partagés
├── constants/Colors.ts           # Palettes clair/sombre
├── backend/                      # API Express
├── .github/workflows/            # CI GitHub Actions
├── docker-compose.yml
├── README.md
├── CHANGELOG.md
└── package.json
```

---

## API

Documentation Swagger complète auto-générée : `http://localhost:3000/api/docs`

### Endpoints principaux

| Méthode | Route | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Inscription |
| `POST` | `/api/auth/login` | Connexion |
| `POST` | `/api/auth/refresh` | Refresh du token |
| `POST` | `/api/auth/forgot-password` | Demande de reset (email) |
| `POST` | `/api/auth/reset-password` | Reset avec code |
| `POST` | `/api/auth/change-password` | Changement de mdp (authentifié) |
| `DELETE` | `/api/auth/account` | Suppression du compte (RGPD) |
| `GET` | `/api/preferences` | Récupérer les préférences |
| `PUT` | `/api/preferences` | Modifier les préférences |
| `GET` | `/api/meals/current` | Plan de la semaine en cours |
| `POST` | `/api/meals/generate` | Générer un nouveau plan |
| `GET` | `/api/recipes` | Liste des recettes |
| `GET` | `/api/recipes/mine` | Mes recettes personnelles |
| `POST` | `/api/recipes/mine` | Créer une recette |
| `GET` | `/api/recipes/favorites/list` | Liste des favoris |
| `POST` | `/api/recipes/:id/favorite` | Ajouter en favori |
| `GET` | `/api/nutrition/product/:barcode` | Analyser un produit (OFF) |
| `GET` | `/api/nutrition/product/:barcode/alternatives` | Alternatives plus saines |
| `GET` | `/api/fridge/items` | Ingrédients du frigo |
| `GET` | `/api/fridge/suggestions` | Recettes réalisables |
| `POST` | `/api/ai/advice` | Question au coach IA |
| `GET` | `/api/analytics/dashboard` | Tableau de bord nutritionnel |
| `POST` | `/api/logs/nutrition` | Logger un repas |
| `POST` | `/api/logs/weight` | Logger une pesée |
| `GET` | `/api/health-goals/latest` | Objectif santé actuel |
| `POST` | `/api/health-goals` | Définir un objectif |

---

## Sécurité

L'application couvre les principales failles OWASP Top 10 :

| Faille OWASP | Mesure |
|---|---|
| A01 – Broken Access Control | Middleware `authMiddleware` sur les routes protégées |
| A02 – Cryptographic Failures | bcrypt cost 12, JWT signé HS256 |
| A03 – Injection | Prisma ORM (requêtes paramétrisées) + validation Zod |
| A04 – Insecure Design | Architecture en couches, séparation des responsabilités |
| A05 – Security Misconfiguration | Helmet, secrets en `.env`, CORS configuré |
| A07 – Auth & Session | Rate limiting sur `/auth`, refresh token rotation |
| A08 – Data Integrity | JWT signés, refresh tokens stockés en BDD |
| A09 – Logging | Morgan + console structuré |
| A10 – SSRF | Aucun appel dynamique côté serveur |

**Rate limiting** :
- Global : 100 requêtes / 15 min
- Authentification : 5 requêtes / 15 min
- Coach IA : 20 requêtes / 15 min

---

## Tests

Exécuter les tests unitaires backend :

```bash
cd backend
npm test
```

Générer le rapport de couverture :

```bash
npm test -- --coverage
```

Le rapport HTML est disponible dans `backend/coverage/lcov-report/index.html`.

---

## CI/CD

Le fichier `.github/workflows/ci.yml` définit un pipeline avec **4 jobs parallèles** déclenchés à chaque push/pull request :

| Job | Description |
|---|---|
| **backend** | Install → Prisma generate → Migrations → Lint → Build → Tests + coverage |
| **frontend** | Install → Type-check TypeScript → Lint Expo |
| **docker** | Build de l'image Docker multi-stage (validation) |
| **security** | `npm audit` sur backend et frontend |

Un service PostgreSQL éphémère est instancié pendant les tests d'intégration.

---

## Multilingue

L'application supporte **5 langues** avec sélection en temps réel :

| Code | Langue | Sens de lecture |
|---|---|---|
| `fr` | Français | LTR |
| `en` | English | LTR |
| `es` | Español | LTR |
| `it` | Italiano | LTR |
| `ar` | العربية | **RTL** (droite à gauche) |

La détection RTL utilise l'API native `I18nManager` de React Native. L'utilisateur peut changer de langue depuis **Profil > Langue** via un modal avec drapeaux et noms natifs.

---

## Conformité RGPD

L'application respecte le RGPD dans son architecture :

- **Article 15** – Droit d'accès : endpoint `GET /api/auth/export`
- **Article 17** – Droit à l'oubli : endpoint `DELETE /api/auth/account`
- **Article 20** – Portabilité des données : export JSON complet
- **Article 32** – Sécurité du traitement : bcrypt, JWT, HTTPS-ready

Toutes les relations Prisma utilisent `onDelete: Cascade` pour garantir la suppression complète des données lorsqu'un utilisateur supprime son compte.

---

## Contribuer

Le projet suit une convention de commits inspirée de **Conventional Commits** :

```
feat: ajout d'une fonctionnalité
fix: correction d'un bug
docs: mise à jour de la documentation
refactor: refactoring sans changement fonctionnel
test: ajout de tests
chore: tâches diverses (config, deps...)
```

---

## Licence

Projet réalisé dans le cadre d'un titre RNCP 39583 – Expert en développement logiciel.

## Auteure

**Dakhli Siwar** – 2026

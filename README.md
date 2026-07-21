<div align="center">

# 🥗 NutriSense

**Application mobile de nutrition intelligente**

Application mobile multilingue de nutrition combinant planification de repas, scan de produits, coaching conversationnel et suivi nutritionnel.

</div>

---

NutriSense réunit dans une seule application la planification des repas, le suivi nutritionnel et la gestion des courses, avec des recommandations adaptées aux préférences alimentaires et aux objectifs de santé de chaque utilisateur. L'application est multilingue (5 langues, dont l'arabe en RTL) et propose un thème clair/sombre.

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
- [Compte de démonstration](#compte-de-démonstration)
- [Auteure](#auteure)

---

## Fonctionnalités

### 🗓️ Planification de repas
- Génération automatique d'un plan hebdomadaire complet : petit-déjeuner, déjeuner et dîner pour chaque jour de la semaine
- Bascule automatique vers la semaine courante lorsque la semaine change
- Validation des repas consommés et consultation des jours passés
- Liste des ingrédients à prévoir pour le jour sélectionné, avec estimation du coût
- Adaptation aux régimes : végan, végétarien, halal, keto, sans gluten, sans lactose

### 📖 Base de recettes
- 60 recettes de cuisine du monde (française, italienne, maghrébine, indienne, japonaise, mexicaine, etc.)
- Recettes personnelles : création, modification, suppression
- Calcul nutritionnel automatique à partir des ingrédients (table de référence)
- Favoris et partage via le sélecteur natif iOS/Android

### 🤖 Coach nutritionnel
- Assistant conversationnel qui répond aux questions nutritionnelles
- Base de connaissances (recherche par similarité) avec sources citées
- Historique des échanges persisté
- Mode de repli à base de règles si le service d'analyse est indisponible

### 📷 Scanner de produits
- Scan de codes-barres via `expo-camera`
- Intégration temps réel avec l'API **Open Food Facts**
- Affichage Nutri-Score, groupe NOVA, Éco-Score et allergènes
- Comparateur d'alternatives : suggestions de produits plus sains dans la même catégorie
- Enregistrement dans le journal nutritionnel

### 🧊 Mode Frigo
- Saisie des ingrédients disponibles avec suggestions rapides
- Suggestion de recettes réalisables (matching flou par dictionnaire de synonymes)
- Affichage des ingrédients manquants pour chaque recette

### 🛒 Liste de courses
- Liste générée automatiquement à partir du plan de la semaine
- Regroupement des ingrédients de tous les repas de la semaine
- Estimation du coût total des courses pour aider à mieux gérer ses dépenses

### 📊 Suivi nutritionnel
- Tableau de bord : série de jours suivis, taux d'adhérence, points de repère personnalisés
- Graphiques des calories et du poids
- Objectif santé calculé via la formule **Mifflin-St Jeor** (métabolisme de base + activité)
- Suivi des macronutriments (protéines, glucides, lipides, fibres) et de l'eau

### 👤 Compte utilisateur
- Inscription / connexion avec JWT
- Rotation des refresh tokens
- Réinitialisation du mot de passe par email (code à 6 chiffres, valide 15 min)
- Changement de mot de passe depuis le profil
- Système d'invitation / parrainage

---

## Stack technique

### Frontend (mobile)
- **React Native 0.76** + **Expo SDK 52**
- **Expo Router** (routing basé sur les fichiers)
- **TypeScript 5.3** (mode strict)
- **AsyncStorage** pour la persistance locale
- **expo-camera** pour le scan de codes-barres
- **Material Top Tabs** pour les sous-onglets
- **I18nManager** pour la gestion RTL (arabe)

### Backend (API)
- **Node.js 20** + **Express 4**
- **TypeScript** avec compilation stricte
- **Prisma ORM** avec **PostgreSQL 16**
- **JWT** (jsonwebtoken) + **bcryptjs** (cost 12)
- **Zod** pour la validation des schémas
- **Helmet** + **express-rate-limit** pour la sécurité
- **Swagger** (OpenAPI 3.0)
- **Jest** + **Supertest** pour les tests

### Services externes
- Service d'analyse nutritionnelle (chat completions)
- **Open Food Facts API v2** (données produits)
- **Resend** (emails transactionnels)

### DevOps
- **Docker** multi-stage (backend)
- **docker-compose** (PostgreSQL + Adminer)
- **GitHub Actions** (pipeline CI)
- Déploiement backend sur **Render**, base **PostgreSQL** managée

---

## Architecture

Architecture en couches côté backend, avec séparation stricte des responsabilités :

```
backend/src/
├── config/          # Configuration (database, env)
├── middlewares/     # Authentification, validation, rate limit
├── routes/          # Endpoints Express (contrôleurs légers)
├── services/        # Logique métier
├── schemas/         # Validation Zod
├── db/              # Seeding et scripts BDD
└── utils/           # Helpers
```

Modélisation Prisma avec **14 modèles** :

| Domaine | Modèles |
|---|---|
| Utilisateur | `User`, `UserPreference`, `RefreshToken`, `PasswordResetToken` |
| Recettes | `Recipe`, `Favorite` |
| Planification | `WeekPlan`, `ShoppingList` |
| Suivi | `HealthGoal`, `NutritionLog`, `WeightLog` |
| Assistant | `AiConversation` |
| Divers | `ProductCache`, `FridgeItem` |

Toutes les relations sensibles utilisent `onDelete: Cascade` pour garantir la suppression complète des données (RGPD).

---

## Installation

### Prérequis

- **Node.js** 20 ou supérieur
- **Docker Desktop** (pour PostgreSQL en local)
- **npm** 9+
- Un émulateur Android/iOS ou l'application **Expo Go** sur un téléphone

### Cloner le projet

```bash
git clone https://github.com/siwardakhli1/NutriSense.git
cd NutriSense
```

---

## Configuration

### Base de données PostgreSQL

```bash
docker compose up -d postgres
```

### Variables d'environnement (backend)

Créer un fichier `backend/.env` avec le contenu suivant :

```ini
NODE_ENV=development
PORT=3000

DATABASE_URL=postgresql://nutrisense:nutrisense@localhost:5432/nutrisense

JWT_SECRET=change-me-with-a-random-secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# Fournisseur d'analyse : "mistral", "openai" ou "fallback"
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

Les migrations créent les tables. Au premier démarrage, les **60 recettes** sont insérées automatiquement.

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
│   ├── (auth)/                   # Login, register, mot de passe oublié
│   ├── (onboarding)/             # Parcours de démarrage
│   ├── (tabs)/                   # Navigation principale
│   │   ├── index.tsx             # Plan repas hebdomadaire
│   │   ├── cuisine/              # Recettes, frigo, scanner, courses
│   │   │   ├── recipes.tsx       # Liste des recettes
│   │   │   ├── fridge.tsx        # Mode frigo
│   │   │   ├── scanner.tsx       # Scanner de codes-barres
│   │   │   └── shopping.tsx      # Liste de courses
│   │   ├── coach.tsx             # Assistant nutritionnel
│   │   ├── suivi/                # Statistiques et santé
│   │   │   ├── stats.tsx         # Graphiques nutritionnels
│   │   │   └── health.tsx        # Objectif santé et poids
│   │   └── profile.tsx           # Profil utilisateur
│   ├── recipe/[id].tsx           # Détail d'une recette
│   ├── edit-recipe.tsx           # Création / édition de recette
│   ├── my-recipes.tsx            # Recettes personnelles
│   ├── favorites.tsx             # Recettes favorites
│   ├── preferences.tsx           # Édition des préférences
│   ├── account.tsx               # Gestion du compte (RGPD)
│   ├── change-password.tsx       # Changement de mot de passe
│   ├── invite.tsx                # Invitation / parrainage
│   ├── admin.tsx                 # Espace d'administration
│   ├── admin-users.tsx           # Gestion des utilisateurs
│   ├── admin-recipes.tsx         # Gestion des recettes
│   ├── legal/                    # Mentions légales et conditions
│   ├── privacy.tsx               # Politique de confidentialité
│   └── _layout.tsx               # Layout racine (garde d'authentification)
├── components/                   # Composants réutilisables
├── contexts/                     # Auth, MealPlan, Theme, Language
├── hooks/                        # useAppContexts, useNativeAPIs, useShare
├── i18n/                         # Traductions FR, EN, ES, IT, AR
├── services/api.ts               # Client HTTP avec refresh automatique
├── types/index.ts                # Types TypeScript partagés
├── constants/Colors.ts           # Palettes clair/sombre
├── utils/                        # Fonctions utilitaires (format, nutrition)
├── backend/                      # API Express
├── .github/workflows/            # CI GitHub Actions
├── app.json                      # Configuration Expo
├── tsconfig.json                 # Configuration TypeScript
├── docker-compose.yml
├── README.md
└── package.json
```

---

## API

Documentation Swagger complète : `http://localhost:3000/api/docs`

### Endpoints principaux

| Méthode | Route | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Inscription |
| `POST` | `/api/auth/login` | Connexion |
| `POST` | `/api/auth/refresh` | Renouvellement du token |
| `POST` | `/api/auth/forgot-password` | Demande de réinitialisation (email) |
| `POST` | `/api/auth/reset-password` | Réinitialisation avec code |
| `POST` | `/api/auth/change-password` | Changement de mot de passe |
| `GET` | `/api/auth/export` | Export des données personnelles (RGPD) |
| `DELETE` | `/api/auth/account` | Suppression du compte (RGPD) |
| `GET` | `/api/auth/me` | Profil de l'utilisateur connecté |
| `GET` | `/api/meals/current` | Plan de la semaine en cours |
| `POST` | `/api/meals/generate` | Générer un nouveau plan |
| `POST` | `/api/meals/regenerate-from-today` | Régénérer à partir d'aujourd'hui |
| `GET` | `/api/recipes` | Liste des recettes |
| `POST` | `/api/recipes` | Créer une recette personnelle |
| `GET` | `/api/recipes/:id` | Détail d'une recette |
| `GET` | `/api/recipes/favorites/list` | Liste des favoris |
| `POST` | `/api/recipes/:id/favorite` | Ajouter aux favoris |
| `GET` | `/api/nutrition/product/:barcode` | Analyser un produit (Open Food Facts) |
| `GET` | `/api/fridge/items` | Ingrédients du frigo |
| `GET` | `/api/fridge/suggestions` | Recettes réalisables |
| `POST` | `/api/ai/advice` | Question au coach nutritionnel |
| `GET` | `/api/analytics/dashboard` | Tableau de bord nutritionnel |

---

## Sécurité

L'application couvre les principales catégories de l'OWASP Top 10 :

| Catégorie OWASP | Mesure |
|---|---|
| A01 – Broken Access Control | Middleware `authMiddleware` sur les routes protégées |
| A02 – Cryptographic Failures | bcryptjs (cost 12), JWT signé HS256 |
| A03 – Injection | Prisma ORM (requêtes paramétrées) + validation Zod |
| A04 – Insecure Design | Architecture en couches, séparation des responsabilités |
| A05 – Security Misconfiguration | Helmet, secrets en `.env`, CORS configuré |
| A07 – Auth & Session | Rate limiting sur `/auth`, rotation des refresh tokens |
| A08 – Data Integrity | JWT signés, refresh tokens stockés en base |
| A09 – Logging | Journalisation structurée (Morgan) |
| A10 – SSRF | Aucun appel dynamique arbitraire côté serveur |

**Rate limiting** :
- Global : 100 requêtes / 15 min
- Authentification : limite renforcée sur `/auth`
- Coach nutritionnel : 20 requêtes / 15 min

---

## Tests

Exécuter les tests backend :

```bash
cd backend
npm test
```

Générer le rapport de couverture :

```bash
npm test -- --coverage
```

Le rapport HTML est disponible dans `backend/coverage/lcov-report/index.html`.

La suite couvre à la fois des tests unitaires (fonctions pures : scoring, calculs nutritionnels, helpers) et des tests d'intégration (endpoints authentifiés, sécurité, cycle de vie des plans).

---

## CI/CD

Le projet met en œuvre une chaîne d'intégration et de déploiement continus.

### Intégration continue (CI)

Le fichier `.github/workflows/ci.yml` définit un pipeline déclenché à chaque push et pull request sur `main` :

| Job | Description |
|---|---|
| **backend** | Install → Prisma generate → Migrations → Build → Tests + couverture |
| **frontend** | Install → Vérification des types TypeScript |
| **docker** | Build de l'image Docker multi-stage (validation) |
| **security** | `npm audit` sur le backend et le frontend |

Un service PostgreSQL éphémère est instancié pendant les tests d'intégration.

### Déploiement continu (CD)

Le backend est déployé sur **Render** et la base de données sur une instance **PostgreSQL managée** (Neon). Chaque push sur `main` validé par la CI déclenche un nouveau build et une **mise en production automatique**.

L'API est accessible en production à l'adresse **https://nutrisense-2026.onrender.com** (documentation Swagger sur `/api/docs`).

#### Conteneurisation

Le backend est packagé via un **Dockerfile multi-stage** :
- Un stage *builder* installe les dépendances, génère le client Prisma et compile le TypeScript.
- Un stage *runtime* léger (`node:20-alpine`) ne conserve que les dépendances de production et le code compilé.
- Un `HEALTHCHECK` interroge l'endpoint `/health` toutes les 30 secondes.
- Les **migrations Prisma sont appliquées automatiquement au démarrage** (`prisma migrate deploy`) avant le lancement du serveur.

#### Configuration Render

| Paramètre | Valeur |
|---|---|
| Root Directory | `backend` |
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |
| Health Check Path | `/health` |

#### Variables d'environnement de production

À configurer dans le tableau de bord Render :

```ini
DATABASE_URL=postgresql://...        # fournie par la base managée
JWT_SECRET=...                       # secret aléatoire
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
NODE_ENV=production
LLM_PROVIDER=mistral
LLM_API_KEY=...
LLM_MODEL=mistral-small-latest
LLM_BASE_URL=https://api.mistral.ai/v1
```

#### Frontend

L'application mobile pointe vers l'URL de production du backend. Pour générer un binaire distribuable (APK / IPA), le projet utilise **EAS Build** :

```bash
npx eas build --platform android
```

En développement, l'application reste lancée via Expo Go (`npx expo start`), pointant soit vers un backend local, soit vers l'API de production.

---

## Multilingue

L'application prend en charge **5 langues** avec changement en temps réel :

| Code | Langue | Sens de lecture |
|---|---|---|
| `fr` | Français | LTR |
| `en` | English | LTR |
| `es` | Español | LTR |
| `it` | Italiano | LTR |
| `ar` | العربية | **RTL** (droite à gauche) |

La gestion RTL s'appuie sur l'API native `I18nManager` de React Native. Le changement de langue se fait depuis **Profil → Langue**.

---

## Conformité RGPD

- **Article 15** – Droit d'accès : `GET /api/auth/export`
- **Article 17** – Droit à l'oubli : `DELETE /api/auth/account` (avec double confirmation)
- **Article 20** – Portabilité : export JSON complet des données
- **Article 32** – Sécurité du traitement : bcryptjs, JWT, prêt pour HTTPS

Toutes les relations sensibles utilisent `onDelete: Cascade`, garantissant la suppression complète des données lors de la suppression d'un compte.

---

## Compte de démonstration

Un compte administrateur est disponible pour tester l'espace d'administration (gestion des utilisateurs, des recettes et statistiques globales) :

| Champ | Valeur |
|---|---|
| Email | `admin@gmail.com` |
| Mot de passe | `admin1234` |

L'accès à cet espace est protégé côté serveur par un middleware de vérification de rôle (`adminMiddleware`) : un utilisateur standard qui tente d'y accéder reçoit une réponse **403 Forbidden**. Le rôle est stocké en base de données et ne peut pas être modifié depuis l'application.

---

## Contribuer

Convention de commits inspirée de **Conventional Commits** :

```
feat:     ajout d'une fonctionnalité
fix:      correction d'un bug
docs:     mise à jour de la documentation
refactor: refactoring sans changement fonctionnel
test:     ajout de tests
chore:    tâches diverses (config, dépendances...)
```

---

## Licence

Projet réalisé dans le cadre du titre **RNCP 39583 – Expert en développement logiciel** (niveau 7, Bac +5).

## Auteure

**Dakhli Siwar** — 2026

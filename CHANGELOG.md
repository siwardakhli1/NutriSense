# Journal des versions

Toutes les évolutions notables de NutriSense sont consignées dans ce fichier.

Le format s'appuie sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/)
et le projet suit le [versionnage sémantique](https://semver.org/lang/fr/).

Chaque version correspond à une étiquette Git et à un état déployé de l'application.

---

## [3.1.0] — 2026-08-11

Version consacrée au maintien en condition opérationnelle : supervision, gestion
des dépendances et traitement d'une anomalie de sécurité.

### Ajouté
- Intergiciel de supervision mesurant le temps de traitement de chaque requête,
  son code de réponse et son identifiant, avec seuil d'alerte à 1000 ms
- Configuration Dependabot couvrant trois périmètres : dépendances du serveur,
  dépendances de l'application mobile et actions du pipeline d'intégration
- Gabarit de signalement d'anomalie imposant les informations nécessaires à la
  reproduction d'un défaut

### Corrigé
- Le code de réinitialisation de mot de passe est désormais produit par un
  générateur cryptographique (`randomInt`) et non plus par le générateur
  pseudo-aléatoire généraliste du langage
  — anomalie #21, correctif #22
- Notification de bienvenue conditionnée au réglage correspondant

### Sécurité
- OWASP A02 — Défaillances cryptographiques : suppression d'une source d'aléa
  prédictible dans la production d'un secret d'authentification
- Exclusion des montées de version majeure sur l'écosystème Expo et React Native,
  dont le versionnage est solidaire du SDK

---

## [3.0.0] — 2026-07-21

Version majeure de production : déploiement complet de l'application sur
infrastructure hébergée.

### Ajouté
- Déploiement du serveur sur plateforme d'hébergement, base de données managée
- Compte d'administration de démonstration
- Tests unitaires du calcul nutritionnel

### Modifié
- Refonte de l'interface du plan hebdomadaire
- L'application mobile interroge désormais l'API de production et non plus une
  instance locale

### Supprimé
- Test relatif à l'estimation budgétaire, devenu obsolète

---

## [2.8.0] — 2026-07-21

### Ajouté
- Calcul nutritionnel automatique à partir des ingrédients, à l'aide d'une table
  de référence
- Affichage des repas en accordéon dans le plan hebdomadaire
- Bascule automatique vers la semaine courante lors du changement de semaine

### Modifié
- Refonte de la charte chromatique autour de trois tons de vert

### Corrigé
- Construction de l'image sur la plateforme d'hébergement : dépendances de
  compilation et configuration TypeScript

---

## [2.7.0] — 2026-07-16

### Modifié
- Migration de la base de données vers une instance PostgreSQL managée
- Plan hebdomadaire fixé du lundi au dimanche

### Corrigé
- Stabilité du plan hebdomadaire
- Insertion des recettes de référence dans la suite de tests d'intégration

---

## [2.6.0] — 2026-07-15

### Ajouté
- Extension de la suite de tests portant la couverture à 70 %

---

## [2.5.0] — 2026-07-14

### Ajouté
- Espace d'administration complet : tableau de bord, gestion des recettes et
  liste des utilisateurs
- Parrainage à l'inscription
- Recettes gastronomiques débloquées par le parrainage
- Portions adaptatives

---

## [2.4.0] — 2026-07-12

### Ajouté
- Repas composés de plusieurs éléments
- Estimation des coûts réels
- Stabilisation du plan hebdomadaire

---

## [2.3.0] — 2026-07-11

### Ajouté
- Petit-déjeuner dans le plan hebdomadaire
- Régénération partielle du plan à partir du jour courant
- Gestion du fuseau horaire

---

## [2.2.0] — 2026-07-07

### Ajouté
- Conformité RGPD : export des données personnelles et suppression de compte
- Système d'invitation

---

## [2.1.0] — 2026-07-06

### Ajouté
- Suivi nutritionnel quotidien
- Graphiques de statistiques
- Refonte du parcours d'accueil des nouveaux utilisateurs

---

## [2.0.0] — 2026-07-05

Première version complète de l'application.

### Ajouté
- Persistance des données sur PostgreSQL
- Assistant nutritionnel conversationnel
- Scanner de produits adossé à Open Food Facts, avec comparateur d'alternatives
- Interface multilingue : français, anglais, espagnol, italien et arabe,
  avec prise en charge de l'écriture de droite à gauche
- Chaîne d'intégration continue à quatre traitements
- Conformité RGAA 4.1
- Couverture des principales catégories de l'OWASP Top 10 : politique de
  sécurité de contenu, journalisation structurée, intergiciels de sécurité
- Sondes de disponibilité `/live` et `/ready`
- Suite de 222 tests unitaires : 184 côté serveur, 38 côté application mobile

### Corrigé
- Désactivation de la limitation de débit en environnement de test, celle-ci
  empêchant l'exécution complète des suites
- Fichier de verrouillage des dépendances du serveur

---

## [1.0.0] — 2026-07-05

### Ajouté
- Version initiale de NutriSense : première application fonctionnelle complète,
  regroupant la planification de repas, la base de recettes, l'assistant
  nutritionnel, le scanner de produits, le mode frigo, le suivi nutritionnel et
  la gestion de compte

---

[3.1.0]: https://github.com/siwardakhli1/NutriSense/releases/tag/v3.1.0
[3.0.0]: https://github.com/siwardakhli1/NutriSense/releases/tag/v3.0.0
[2.8.0]: https://github.com/siwardakhli1/NutriSense/releases/tag/v2.8.0
[2.7.0]: https://github.com/siwardakhli1/NutriSense/releases/tag/v2.7.0
[2.6.0]: https://github.com/siwardakhli1/NutriSense/releases/tag/v2.6.0
[2.5.0]: https://github.com/siwardakhli1/NutriSense/releases/tag/v2.5.0
[2.4.0]: https://github.com/siwardakhli1/NutriSense/releases/tag/v2.4.0
[2.3.0]: https://github.com/siwardakhli1/NutriSense/releases/tag/v2.3.0
[2.2.0]: https://github.com/siwardakhli1/NutriSense/releases/tag/v2.2.0
[2.1.0]: https://github.com/siwardakhli1/NutriSense/releases/tag/v2.1.0
[2.0.0]: https://github.com/siwardakhli1/NutriSense/releases/tag/v2.0.0
[1.0.0]: https://github.com/siwardakhli1/NutriSense/releases/tag/v1.0.0

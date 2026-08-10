---
name: Signalement d'anomalie
about: Consigner une anomalie détectée afin de permettre sa reproduction et sa correction
title: "[BUG] "
labels: bug
assignees: ''
---

## 1. Identification

| Champ | Valeur |
|---|---|
| Date de détection | <!-- JJ/MM/AAAA --> |
| Détecté par | <!-- test manuel / test automatisé / supervision / retour utilisateur --> |
| Périmètre | <!-- application mobile / API / base de données / pipeline CI --> |
| Criticité | <!-- bloquante / majeure / mineure / cosmétique --> |

**Criticité — barème**
- *Bloquante* : empêche l'utilisation d'une fonctionnalité essentielle, sans contournement
- *Majeure* : dégrade fortement l'usage, contournement possible
- *Mineure* : gêne ponctuelle, sans effet sur le parcours
- *Cosmétique* : défaut d'affichage sans conséquence fonctionnelle

## 2. Environnement

| Champ | Valeur |
|---|---|
| Plateforme | <!-- Android / iOS / API --> |
| Terminal ou émulateur | <!-- ex. émulateur Pixel 9 Pro, Android 14 --> |
| Version de l'application | <!-- ex. 3.0.0 --> |
| Environnement serveur | <!-- local / production --> |

## 3. Étapes de reproduction

<!-- Numérotées, sans ambiguïté, exécutables par un tiers -->

1.
2.
3.

**Fréquence de reproduction :** <!-- systématique / intermittente (préciser la proportion) -->

## 4. Comportement attendu

<!-- Ce qui devrait se produire -->

## 5. Comportement observé

<!-- Ce qui se produit réellement -->

## 6. Éléments de contexte

<!-- Journaux, identifiant de requête (X-Request-ID), code HTTP, capture d'écran, message d'erreur -->

## 7. Analyse

<!-- À compléter après investigation -->

**Cause racine :**

**Fichiers concernés :**

## 8. Préconisation de correction

<!-- Correctif envisagé, alternatives écartées et motif -->

## 9. Vérification

- [ ] Le comportement attendu est obtenu en suivant les étapes de reproduction
- [ ] Aucune régression : la suite de tests s'exécute intégralement
- [ ] Le cas est couvert par un test, ou son absence de couverture est justifiée

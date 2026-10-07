# API YouTube : synchroniser les vidéos des ambassadeurs

L'application peut récupérer automatiquement les dernières vidéos des chaînes YouTube des ambassadeurs (API YouTube Data v3).

## 1. Créer une clé API (gratuit)
1. Aller sur https://console.cloud.google.com et créer un projet (ex. « Chasse Peche 360 »).
2. **API et services → Bibliothèque** → chercher **YouTube Data API v3** → **Activer**.
3. **API et services → Identifiants → Créer des identifiants → Clé API**.
4. Cliquer sur la clé pour la **restreindre** (indispensable : la clé est visible dans le navigateur) :
   - *Restrictions relatives aux applications* → **Sites web** → ajouter `https://enguerranddelaferte-tech.github.io/*`
   - *Restrictions relatives aux API* → **Limiter la clé** → **YouTube Data API v3**

## 2. L'utiliser dans l'application
1. Ouvrir le site hébergé (https), se connecter en administrateur (`admin@demo.fr`).
2. Menu **Ambassadeurs** → panneau **Synchronisation YouTube**.
3. Coller la clé → **Tester la clé** → **Tout synchroniser**.

La clé est enregistrée **uniquement dans le navigateur de l'administrateur** (jamais dans le code ni sur GitHub). Ne la commitez pas.

## Fonctionnement et quota
- Pour chaque ambassadeur ayant un identifiant de chaîne (`UC…`) ou un `@handle`, l'appli lit la liste « mises en ligne » de la chaîne (10 dernières vidéos) puis leurs durées.
- Coût : environ 2 à 3 unités par chaîne ; le quota gratuit est de 10 000 unités par jour.
- Les vidéos ajoutées à la main sont conservées ; les doublons sont écartés. Les ambassadeurs fictifs (démo) sont ignorés.
- Fonctionne sur la version hébergée en https. L'aperçu Claude bloque l'accès à YouTube.

## Limite actuelle
Les données de l'appli restent dans le navigateur (pas de serveur partagé) : la synchronisation est donc faite par appareil. Avec un vrai serveur, la clé serait placée côté serveur (variable d'environnement) et la synchronisation planifiée (ex. toutes les 6 h).

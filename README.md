# Chasse & Pêche 360°

Application web de démonstration pour chasseurs et pêcheurs : fil d'actualité, carte du territoire, calculateur d'angle de 30° (chasse), sorties avec suivi en direct et historique, amis, messagerie, réglementation, console administrateur.

**Version démo** : les données restent dans le navigateur (faux serveur local). Comptes de démonstration : mot de passe `demo360`. Il faut un vrai serveur pour partager des données entre utilisateurs.

## Utiliser l'application
Ouvrir `index.html` via une adresse **https** (par exemple GitHub Pages : Settings → Pages → branche `main`, dossier `/ (root)`). Le GPS, la caméra, les niveaux d'eau (Hub'Eau), l'installation sur l'écran d'accueil et le cache hors ligne exigent https. Les cartes IGN sont actives par défaut ; ajouter `?cartes=demo` revient au fond de démonstration.

## Code source
Tout est dans `source/` :
- `v1.html` : version 1 de l'application (base).
- `v2.css` : styles de la version 2/3.
- `js_*.js` : modules ajoutés (sorties, historique, amis, suivi en direct, messagerie, administration, questions-réponses, outils territoire) et leur faux serveur (`*_server.js`).
- `patches.py` + `build.py` : assemblent `v1.html`, le CSS et les modules.

Reconstruire : `cd source && python3 build.py` (génère `source/v2.html` et met à jour `index.html`).

## Limites connues
- Cartes, GPS, caméra et suivi en direct n'ont été testés que dans un aperçu simulé ; à vérifier sur un téléphone avec la version hébergée.
- Le suivi en direct et les amis ne fonctionnent qu'au sein d'un même navigateur tant qu'il n'y a pas de serveur.

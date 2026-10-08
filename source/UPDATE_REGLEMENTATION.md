# Réglementation par département

- Données : `source/reg_dept/<CODE>.json` (un fichier par département, format décrit dans `source/reg_dept_prompt.txt`).
- `python3 reg_dept_build.py` génère `js_regdept.js` (embarqué par `patches.py`, bloc 29), puis `python3 build.py`.
- Règles nationales : `reg_chasse.json` / `reg_peche.json` (bloc 28).
- Seules les valeurs lues dans un document officiel de la bonne saison sont « Source officielle » ; le reste est « À vérifier ».
- Lacunes connues (8 oct. 2026) : pêche locale renseignée pour 83 départements ; 13 restent sans données (02 18 19 23 28 2A 2B 41 47 90 92 93 94). Les sites des préfectures/fédérations bloquent souvent WebFetch (robots.txt) ; beaucoup de valeurs sont « À vérifier » (arrêté d'une année antérieure, copie non officielle ou page non datée). Les ~40 arrêtés de chasse 2026-2027 manquants n'ont pas été repris.

# Réglementation par département

- Données : `source/reg_dept/<CODE>.json` (un fichier par département, format décrit dans `source/reg_dept_prompt.txt`).
- `python3 reg_dept_build.py` génère `js_regdept.js` (embarqué par `patches.py`, bloc 29), puis `python3 build.py`.
- Règles nationales : `reg_chasse.json` / `reg_peche.json` (bloc 28).
- Seules les valeurs lues dans un document officiel de la bonne saison sont « Source officielle » ; le reste est « À vérifier ».
- Lacunes connues (7 oct. 2026) : la pêche locale n'est renseignée que pour 8 départements (16, 53, 67, 70, 74, 77, 82 + infos 71) ; ~40 départements n'ont pas d'arrêté de chasse 2026-2027 lu. À reprendre quand la recherche web est de nouveau disponible, en priorité la pêche.

# Réglementation par département

- Données : `source/reg_dept/<CODE>.json` (un fichier par département, format décrit dans `source/reg_dept_prompt.txt`).
- `python3 reg_dept_build.py` génère `js_regdept.js` (embarqué par `patches.py`, bloc 29), puis `python3 build.py`.
- Règles nationales : `reg_chasse.json` / `reg_peche.json` (bloc 28).
- Seules les valeurs lues dans un document officiel de la bonne saison sont « Source officielle » ; le reste est « À vérifier ».
- Lacunes connues (8 oct. 2026) : pêche locale renseignée pour 53 départements ; 43 restent sans données (02 04 07 10 11 18 19 23 27 28 29 2A 2B 30 31 32 33 34 35 36 37 38 40 41 42 43 45 47 64 65 66 79 80 83 85 86 87 88 89 90 92 93 94). Les sites des préfectures/fédérations bloquent souvent WebFetch (robots.txt) et le quota de WebSearch s'est épuisé : beaucoup de valeurs sont « À vérifier » (arrêté d'une année antérieure ou page non datée). Les ~40 arrêtés de chasse 2026-2027 manquants n'ont pas été repris. À poursuivre quand le quota de recherche est rétabli.

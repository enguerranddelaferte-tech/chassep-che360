# Mise à jour mensuelle de la liste des conducteurs de chien de sang

Source officielle : https://www.unucr.fr/conducteurs (PDF « Liste officielle des conducteurs agréés », triée par DPT ;
Corse sous le code 20). Lien du PDF :
https://firebasestorage.googleapis.com/v0/b/unucr-521d9.appspot.com/o/public%2Fconducteurs%2Fliste-des-conducteurs-agrees.pdf?alt=media

1. Lire le PDF avec WebFetch, département par département (01–95, 20, + « autres »), DEUX lectures par département,
   prompt : « Recopie MOT POUR MOT … toutes les lignes du département XX (DPT, NOM-PRENOM, C POST., VILLE, TEL 1, TEL 2) ».
   (Le shell ne peut pas télécharger le PDF : proxy 403.) Tout ce qui n'est pas identique sur 2 lectures est exclu.
2. Écrire `source/sang_raw/XX.json` : {"dpt","reads","count","unconfirmed":[],"rows":[{"name","cp","ville","tel1","tel2"}]}
   Téléphones normalisés « 06 12 34 56 78 » (10 chiffres), sinon exclus.
3. `cd source && python3 sang_update.py JJ/MM/AAAA` (date de la liste officielle) → régénère `../sang-data.json` et `js_sang_data.js`.
4. Comparer à la version précédente (git diff) : une personne absente de la liste officielle est retirée ; ne rien supprimer
   si la lecture a échoué (garder l'ancienne liste).
5. `python3 build.py`, tester la page `#/chien-de-sang`, commit, push, republier l'artifact.

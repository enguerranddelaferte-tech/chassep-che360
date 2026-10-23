# Service de modération YOLOv8 — Chasse & Pêche 360°

Petit service indépendant, hébergé sur son propre serveur, qui analyse chaque photo publiée dans le fil
avec **YOLOv8n-cls** (Ultralytics). Si une espèce protégée ou une tenue légère est probable, la publication
est masquée et l'équipe est prévenue ; elle valide ou refuse depuis Admin › Signalements.

```
Appli ──publie──▶ Supabase ──webhook (id de la publication)──▶ Service YOLOv8 (ce dossier)
                     ▲                                              │ relit la photo (clé service)
                     └──────────── apply_server_vision(résultat) ◀──┘ analyse, renvoie le résultat
```

- La publication n'attend jamais le service : si le serveur est arrêté, l'appli continue de fonctionner,
  et un balayage toutes les 5 minutes rattrape les photos des 2 derniers jours dès son retour.
- Seules les images hébergées sur le projet Supabase (ou intégrées à la publication) sont téléchargées.
- Les photos ne sont pas conservées : seul le résultat (« Cervidé 98 % », « Loup 70 % »…) est enregistré.
- L'état du service s'affiche dans l'encart **Lancement** du tableau de bord admin.

## Installer sur un serveur (environ 15 minutes)

Il faut un petit serveur Linux avec Docker (1 vCPU et 1 Go de mémoire suffisent ; par exemple un VPS
chez OVHcloud, Scaleway ou Hetzner, quelques euros par mois) et un nom de domaine pointant vers lui
(par exemple `moderation.chassepeche360.fr`).

1. Copier ce dossier sur le serveur :
   ```sh
   git clone https://github.com/enguerranddelaferte-tech/chassep-che360.git
   cd chassep-che360/moderation-service
   ```
2. Créer le fichier de réglages :
   ```sh
   cp .env.example .env
   openssl rand -hex 32        # copier le résultat dans MODERATION_SECRET
   nano .env                   # remplir DOMAIN, SUPABASE_SERVICE_ROLE_KEY, MODERATION_SECRET
   ```
   La clé `service_role` se trouve dans Supabase › Project Settings › API keys. Elle donne tous les droits :
   elle ne doit exister que dans ce fichier `.env`, jamais dans l'appli ni sur GitHub.
3. Démarrer :
   ```sh
   docker compose up -d --build
   curl https://moderation.chassepeche360.fr/health
   ```
   Le modèle est téléchargé depuis les publications officielles d'Ultralytics et converti pendant la construction.
4. Brancher la base : dans Supabase › SQL Editor, avec l'adresse et le même secret que dans `.env` :
   ```sql
   insert into private.settings(key, value) values
     ('moderation_url', 'https://moderation.chassepeche360.fr'),
     ('moderation_secret', 'LE_MEME_SECRET_QUE_DANS_.env')
   on conflict (key) do update set value = excluded.value;
   ```
5. Vérifier : publier une photo avec un compte de test, puis regarder l'encart Lancement de l'admin
   (« Service de modération YOLOv8 : en marche ») ou les journaux : `docker compose logs -f moderation`.

## Tester l'analyse à la main

```sh
curl -s -X POST https://moderation.chassepeche360.fr/analyze \
  -H "Authorization: Bearer $MODERATION_SECRET" \
  -d "{\"image_base64\":\"$(base64 -w0 photo.jpg)\"}"
```

## Adapter les règles ou le modèle

- `rules.py` : liste des catégories ImageNet surveillées (espèces protégées en France, tenues légères)
  et seuils. Un simple redémarrage suffit : `docker compose up -d --build`.
- `MODEL_PATH` : un modèle YOLOv8 de classification affiné sur la faune française (exporté en ONNX)
  peut remplacer le modèle d'origine ; `LABELS_PATH` indique alors ses libellés.

## Licence

YOLOv8 et ses poids sont publiés par Ultralytics sous licence **AGPL-3.0**. Pour un usage commercial,
il faut soit publier le code de ce service (et de ce qui l'utilise) sous une licence compatible,
soit souscrire une licence Ultralytics Enterprise. Les scripts de `convert/` (lecture du fichier `.pt`
sans PyTorch et écriture du fichier ONNX) ont été écrits pour ce projet.

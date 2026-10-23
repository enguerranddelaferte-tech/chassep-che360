# Service de modération des photos — Chasse & Pêche 360°

Petit service indépendant, hébergé sur son propre serveur, qui analyse chaque photo publiée dans le fil avec
**CLIP** (implémentation OpenCLIP, poids LAION ViT-B/32, **licence MIT** : usage commercial autorisé sans
publier le code de l'appli). Si une espèce protégée, une image choquante, de la nudité ou un geste dangereux
est probable, la publication est masquée et l'équipe est prévenue ; elle valide ou refuse depuis Admin › Signalements.

CLIP compare la photo à des descriptions écrites en phrases (`rules.py`). Il n'y a aucun entraînement à faire :
pour surveiller une nouvelle espèce, il suffit d'ajouter une phrase.

```
Appli ──publie──▶ Supabase ──webhook (id de la publication)──▶ Service CLIP (ce dossier)
                     ▲                                              │ relit la photo (clé service)
                     └──────────── apply_server_vision(résultat) ◀──┘ analyse, renvoie le résultat
```

- La publication n'attend jamais le service : si le serveur est arrêté, l'appli continue de fonctionner,
  et un balayage toutes les 5 minutes rattrape les photos des 2 derniers jours dès son retour.
- Seules les images hébergées sur le projet Supabase (ou intégrées à la publication) sont téléchargées.
- Les photos ne sont pas conservées : seul le résultat (« Cervidé 92 % », « Loup 70 % »…) est enregistré.
- Le service ne bloque rien seul : il masque en attendant une décision humaine. Une photo de chasse
  normale (gibier abattu, chien, chasseur) est reconnue comme telle et n'est pas signalée.
- L'état du service s'affiche dans l'encart **Lancement** du tableau de bord admin.

## Installer sur un serveur (environ 20 minutes)

Il faut un petit serveur Linux avec Docker — **2 Go de mémoire** au minimum (1 ou 2 vCPU suffisent ;
par exemple un VPS chez OVHcloud, Scaleway ou Hetzner, environ 5 à 8 € par mois) — et un nom de domaine
pointant vers lui (par exemple `moderation.chassepeche360.fr`).

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
3. Démarrer (la première construction télécharge PyTorch et le modèle, environ 1 Go, compter 5 à 10 minutes) :
   ```sh
   docker compose up -d --build
   curl https://moderation.chassepeche360.fr/health
   ```
4. Brancher la base : dans Supabase › SQL Editor, avec l'adresse et le même secret que dans `.env` :
   ```sql
   insert into private.settings(key, value) values
     ('moderation_url', 'https://moderation.chassepeche360.fr'),
     ('moderation_secret', 'LE_MEME_SECRET_QUE_DANS_.env')
   on conflict (key) do update set value = excluded.value;
   ```
5. Vérifier : publier une photo avec un compte de test, puis regarder l'encart Lancement de l'admin
   (« Service de modération des photos : en marche ») ou les journaux : `docker compose logs -f moderation`.

## Tester l'analyse à la main

```sh
curl -s -X POST https://moderation.chassepeche360.fr/analyze \
  -H "Authorization: Bearer $MODERATION_SECRET" \
  -d "{\"image_base64\":\"$(base64 -w0 photo.jpg)\"}"
```

Avant l'ouverture, faites passer une vingtaine de vraies photos (chasse, pêche, gibier, chiens, paysages)
et ajustez les seuils de `rules.py` si des photos normales sont signalées.

## Adapter

- `rules.py` : catégories surveillées, descriptions et seuils. Redémarrer ensuite : `docker compose up -d --build`.
- Modèle plus précis (plus lent, 3 Go de mémoire) : dans `docker-compose.yml`, passer les arguments de construction
  `CLIP_MODEL=ViT-B-16` et `CLIP_PRETRAINED=laion2b_s34b_b88k`.

## Licences

- OpenCLIP (code) : MIT. Poids LAION ViT-B/32 (`laion2b_s34b_b79k`) : MIT.
- PyTorch : BSD-3-Clause. Pillow : MIT-CMU.
- Les fiches des modèles CLIP recommandent de tester le modèle sur ses propres données avant tout usage réel :
  c'est pour cela que le service ne fait que signaler, et que la décision reste humaine.

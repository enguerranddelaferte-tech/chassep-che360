# Modèle d'analyse des photos

`yolov8n-cls.bin` et `yolov8n-cls.json` contiennent le modèle **YOLOv8n-cls** d'Ultralytics
(classification ImageNet, 1 000 catégories), converti pour le moteur JavaScript de l'appli
(`source/v3/yoloeng3.js`) : normalisation fusionnée dans les convolutions, poids quantifiés en int8 par canal.

- Modèle d'origine : https://github.com/ultralytics/assets/releases/download/v8.2.0/yolov8n-cls.pt
- Scripts de conversion : `tools/yolov8/`
- Licence du modèle : **AGPL-3.0** (Ultralytics). Une utilisation commerciale sans publier le code
  de l'application sous une licence compatible demande une licence Ultralytics Enterprise.

L'analyse tourne sur l'appareil de l'utilisateur, dans un Web Worker. La photo n'est envoyée nulle part
pour être analysée ; seuls les éléments repérés accompagnent la publication.

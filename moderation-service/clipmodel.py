"""Modèle de vision : CLIP (OpenCLIP, licence MIT), utilisé en « zéro exemple ».

Au démarrage, les descriptions de rules.py sont encodées une fois ; ensuite chaque photo est comparée
à toutes les descriptions. Aucun entraînement n'est nécessaire : ajouter une espèce = ajouter une phrase.
"""
import io, os

import torch
import open_clip
from PIL import Image

from rules import PROMPTS

MODEL = os.environ.get("CLIP_MODEL", "ViT-B-32")
PRETRAINED = os.environ.get("CLIP_PRETRAINED", "laion2b_s34b_b79k")
NAME = f"clip-{MODEL}-{PRETRAINED}"

torch.set_num_threads(max(1, int(os.environ.get("TORCH_THREADS", "2"))))
_model, _, _preprocess = open_clip.create_model_and_transforms(MODEL, pretrained=PRETRAINED)
_model.eval()
_tokenizer = open_clip.get_tokenizer(MODEL)
with torch.no_grad():
    _text = _model.encode_text(_tokenizer(PROMPTS))
    _text = _text / _text.norm(dim=-1, keepdim=True)
_scale = float(_model.logit_scale.exp().item()) if hasattr(_model, "logit_scale") else 100.0


def probabilities(img_bytes: bytes):
    """Probabilité de chaque description de PROMPTS pour cette photo (liste de floats, somme = 1)."""
    img = Image.open(io.BytesIO(img_bytes))
    img.draft("RGB", (448, 448))  # décodage JPEG plus rapide sur les grandes photos
    x = _preprocess(img.convert("RGB")).unsqueeze(0)
    with torch.no_grad():
        f = _model.encode_image(x)
        f = f / f.norm(dim=-1, keepdim=True)
        probs = (_scale * f @ _text.T).softmax(dim=-1)[0]
    return probs.tolist()

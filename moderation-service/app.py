"""Service de modération YOLOv8 de Chasse & Pêche 360°.

Tourne sur un serveur séparé de l'appli (VPS, conteneur Docker). Rôle :
  1. recevoir de la base Supabase l'identifiant de chaque nouvelle publication avec photo (/webhook) ;
  2. relire la publication avec la clé « service », analyser la photo avec YOLOv8n-cls ;
  3. renvoyer le résultat à la base (fonction apply_server_vision), qui masque la publication
     et prévient l'équipe si une espèce protégée ou une tenue légère est probable.
Un balayage régulier rattrape les publications manquées (service arrêté, réseau coupé).

Dépendances : numpy, pillow, onnxruntime. Aucune autre bibliothèque.
"""
import base64, hmac, io, json, logging, os, queue, threading, time, urllib.parse, urllib.request
from datetime import datetime, timedelta, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import numpy as np
import onnxruntime as ort
from PIL import Image

from rules import evaluate

SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
SECRET = os.environ.get("MODERATION_SECRET", "")
PORT = int(os.environ.get("PORT", "8080"))
SWEEP_MINUTES = float(os.environ.get("SWEEP_MINUTES", "5"))
MODEL_PATH = os.environ.get("MODEL_PATH", os.path.join(os.path.dirname(__file__), "model", "yolov8n-cls.onnx"))
LABELS_PATH = os.environ.get("LABELS_PATH", os.path.join(os.path.dirname(__file__), "labels_en.json"))
MAX_IMAGE_BYTES = 12 * 1024 * 1024

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("moderation")

SESSION = ort.InferenceSession(MODEL_PATH, providers=["CPUExecutionProvider"])
INPUT = SESSION.get_inputs()[0].name
SIZE = SESSION.get_inputs()[0].shape[-1] if isinstance(SESSION.get_inputs()[0].shape[-1], int) else 224
LABELS = json.load(open(LABELS_PATH))
MODEL_NAME = os.path.basename(MODEL_PATH).rsplit(".", 1)[0]

jobs: "queue.Queue[str]" = queue.Queue(maxsize=5000)
state = {"started": time.time(), "analysed": 0, "flagged": 0, "errors": 0, "last": None, "last_error": None}


# ---------- analyse ----------
def preprocess(img: Image.Image) -> np.ndarray:
    """Comme à l'entraînement : petit côté à 224 px, recadrage central, RVB entre 0 et 1."""
    img = img.convert("RGB")
    w, h = img.size
    s = SIZE / min(w, h)
    img = img.resize((max(SIZE, round(w * s)), max(SIZE, round(h * s))), Image.BILINEAR)
    w, h = img.size
    l, t = (w - SIZE) // 2, (h - SIZE) // 2
    img = img.crop((l, t, l + SIZE, t + SIZE))
    return (np.asarray(img, np.float32) / 255.0).transpose(2, 0, 1)[None]


def classify(img_bytes: bytes) -> dict:
    img = Image.open(io.BytesIO(img_bytes))
    img.draft("RGB", (SIZE * 2, SIZE * 2))  # décodage JPEG plus rapide sur les grandes photos
    probs = SESSION.run(None, {INPUT: preprocess(img)})[0][0]
    res = evaluate(probs)
    res.update(model=MODEL_NAME, at=datetime.now(timezone.utc).isoformat(timespec="seconds"),
               top=[[LABELS[i], round(float(probs[i]), 3)] for i in np.argsort(-probs)[:3]])
    return res


# ---------- Supabase ----------
def sb(method: str, path: str, body=None, timeout=20):
    req = urllib.request.Request(SUPABASE_URL + path, method=method,
                                 data=json.dumps(body).encode() if body is not None else None,
                                 headers={"apikey": SERVICE_KEY, "Authorization": "Bearer " + SERVICE_KEY,
                                          "Content-Type": "application/json", "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        raw = r.read()
        return json.loads(raw) if raw else None


def load_image(photo: str) -> bytes | None:
    if photo.startswith("data:image/"):
        return base64.b64decode(photo.split(",", 1)[1])
    # Contre les détournements : seules les images hébergées sur le projet Supabase sont téléchargées
    if photo.startswith(SUPABASE_URL + "/storage/"):
        if photo.split("?")[0].lower().endswith((".mp4", ".mov", ".m4v", ".webm")):
            return None
        req = urllib.request.Request(photo, headers={"apikey": SERVICE_KEY, "Authorization": "Bearer " + SERVICE_KEY})
        with urllib.request.urlopen(req, timeout=30) as r:
            data = r.read(MAX_IMAGE_BYTES + 1)
            if len(data) > MAX_IMAGE_BYTES or not r.headers.get("Content-Type", "").startswith("image/"):
                return None
            return data
    return None


def process(post_id: str):
    rows = sb("GET", "/rest/v1/posts?select=id,data&deleted_at=is.null&id=eq." + urllib.parse.quote(post_id))
    if not rows:
        return
    data = rows[0].get("data") or {}
    if "vision_server" in data:
        return
    photo = str(data.get("photo") or "")
    img = load_image(photo) if photo else None
    if img is None:
        result = {"model": MODEL_NAME, "at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
                  "skipped": ("vidéo" if photo.split("?")[0].lower().endswith((".mp4", ".mov", ".m4v", ".webm")) or photo.startswith("offline-video:")
                              else "source non prise en charge") if photo else "aucune photo", "flag": None, "found": []}
    else:
        result = classify(img)
    out = sb("POST", "/rest/v1/rpc/apply_server_vision", {"p_id": post_id, "p_result": result})
    state["analysed"] += 1
    state["last"] = result.get("at")
    if result.get("flag"):
        state["flagged"] += 1
    log.info("publication %s : %s %s", post_id, result.get("flag") or "ok",
             ", ".join(f"{f['label']} {f['p']}" for f in result.get("found", [])) or result.get("skipped", ""))
    return out


def worker():
    while True:
        pid = jobs.get()
        for attempt in range(3):
            try:
                process(pid)
                break
            except Exception as e:  # réseau, image illisible…
                state["errors"] += 1
                state["last_error"] = f"{pid}: {e}"
                log.warning("publication %s, essai %d : %s", pid, attempt + 1, e)
                time.sleep(2 * (attempt + 1))
        jobs.task_done()


def sweeper():
    """Rattrape les publications des 2 derniers jours qui n'ont pas encore été analysées."""
    while True:
        try:
            since = (datetime.now(timezone.utc) - timedelta(days=2)).isoformat(timespec="seconds")
            rows = sb("GET", "/rest/v1/posts?select=id&deleted_at=is.null&data->>photo=not.is.null"
                             "&data->vision_server=is.null&created_at=gt." + urllib.parse.quote(since) + "&limit=200") or []
            for r in rows:
                try:
                    jobs.put_nowait(r["id"])
                except queue.Full:
                    break
            if rows:
                log.info("balayage : %d publication(s) en retard", len(rows))
        except Exception as e:
            log.warning("balayage impossible : %s", e)
        time.sleep(SWEEP_MINUTES * 60)


# ---------- HTTP ----------
class Handler(BaseHTTPRequestHandler):
    server_version = "cp360-moderation/1.0"

    def _send(self, code, body):
        raw = json.dumps(body, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def _authorized(self):
        got = self.headers.get("Authorization", "")
        return bool(SECRET) and hmac.compare_digest(got.encode(), ("Bearer " + SECRET).encode())

    def _body(self, limit):
        n = int(self.headers.get("Content-Length") or 0)
        if n > limit:
            raise ValueError("trop gros")
        return json.loads(self.rfile.read(n) or b"{}")

    def do_GET(self):
        if self.path.split("?")[0] == "/health":
            return self._send(200, {"ok": True, "model": MODEL_NAME, "queue": jobs.qsize(),
                                    "uptime_s": int(time.time() - state["started"]),
                                    **{k: state[k] for k in ("analysed", "flagged", "errors", "last")}})
        self._send(404, {"error": "introuvable"})

    def do_POST(self):
        path = self.path.split("?")[0]
        if not self._authorized():
            return self._send(401, {"error": "non autorisé"})
        try:
            if path == "/webhook":
                pid = str(self._body(10_000).get("post_id") or "")[:80]
                if not pid:
                    return self._send(400, {"error": "post_id manquant"})
                jobs.put_nowait(pid)
                return self._send(202, {"queued": pid})
            if path == "/analyze":  # test manuel : {"image_base64": "..."}
                b = self._body(MAX_IMAGE_BYTES * 2)
                return self._send(200, classify(base64.b64decode(b["image_base64"])))
        except queue.Full:
            return self._send(503, {"error": "file pleine"})
        except Exception as e:
            return self._send(400, {"error": str(e)[:200]})
        self._send(404, {"error": "introuvable"})

    def log_message(self, fmt, *args):
        pass


def main():
    if not (SUPABASE_URL and SERVICE_KEY and SECRET):
        raise SystemExit("Variables manquantes : SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, MODERATION_SECRET")
    for _ in range(int(os.environ.get("WORKERS", "2"))):
        threading.Thread(target=worker, daemon=True).start()
    if SWEEP_MINUTES > 0:
        threading.Thread(target=sweeper, daemon=True).start()
    log.info("modèle %s chargé, écoute sur le port %d", MODEL_NAME, PORT)
    ThreadingHTTPServer(("0.0.0.0", PORT), Handler).serve_forever()


if __name__ == "__main__":
    main()

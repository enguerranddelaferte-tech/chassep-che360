"""Service de modération des photos de Chasse & Pêche 360°.

Tourne sur un serveur séparé de l'appli (VPS, conteneur Docker). Rôle :
  1. recevoir de la base Supabase l'identifiant de chaque nouvelle publication avec photo (/webhook) ;
  2. relire la publication avec la clé « service », analyser la photo avec CLIP (OpenCLIP, licence MIT) ;
  3. renvoyer le résultat à la base (fonction apply_server_vision), qui masque la publication
     et prévient l'équipe si une espèce protégée, une image choquante, de la nudité ou un geste dangereux est probable.
Un balayage régulier rattrape les publications manquées (service arrêté, réseau coupé).
"""
import base64, hmac, json, logging, os, queue, threading, time, urllib.parse, urllib.request
from datetime import datetime, timedelta, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from rules import evaluate, PROMPTS

SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
SECRET = os.environ.get("MODERATION_SECRET", "")
PORT = int(os.environ.get("PORT", "8080"))
SWEEP_MINUTES = float(os.environ.get("SWEEP_MINUTES", "5"))
MAX_IMAGE_BYTES = 12 * 1024 * 1024

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("moderation")

if os.environ.get("BACKEND") == "stub":  # tests sans le modèle : probabilités imposées par STUB_PROMPT
    MODEL_NAME = "stub"
    def probabilities(_img):
        want = os.environ.get("STUB_PROMPT", "")
        hits = [i for i, t in enumerate(PROMPTS) if want and want in t] or [len(PROMPTS) - 1]
        return [(0.9 / len(hits) if i in hits else 0.1 / (len(PROMPTS) - len(hits))) for i in range(len(PROMPTS))]
else:
    from clipmodel import probabilities, NAME as MODEL_NAME

jobs: "queue.Queue[str]" = queue.Queue(maxsize=5000)
state = {"started": time.time(), "analysed": 0, "flagged": 0, "errors": 0, "last": None, "last_error": None}
_lock = threading.Lock()  # une analyse à la fois : le modèle occupe déjà les processeurs


# ---------- analyse ----------
def classify(img_bytes: bytes) -> dict:
    with _lock:
        probs = probabilities(img_bytes)
    res = evaluate(probs)
    res.update(model=MODEL_NAME, at=datetime.now(timezone.utc).isoformat(timespec="seconds"))
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
    server_version = "cp360-moderation/2.0"

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
    log.info("modèle %s chargé (%d descriptions), écoute sur le port %d", MODEL_NAME, len(PROMPTS), PORT)
    ThreadingHTTPServer(("0.0.0.0", PORT), Handler).serve_forever()


if __name__ == "__main__":
    main()

# Service de modération des photos — Chasse & Pêche 360° (CLIP via OpenCLIP, licence MIT)
FROM python:3.12-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 HF_HOME=/app/hf
# PyTorch en version processeur seul (pas de carte graphique nécessaire)
RUN pip install --no-cache-dir torch==2.4.1 torchvision==0.19.1 --index-url https://download.pytorch.org/whl/cpu
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Téléchargement des poids pendant la construction, pour un démarrage immédiat et hors ligne
ARG CLIP_MODEL=ViT-B-32
ARG CLIP_PRETRAINED=laion2b_s34b_b79k
ENV CLIP_MODEL=${CLIP_MODEL} CLIP_PRETRAINED=${CLIP_PRETRAINED}
RUN python -c "import open_clip,os;open_clip.create_model_and_transforms(os.environ['CLIP_MODEL'],pretrained=os.environ['CLIP_PRETRAINED'])"
COPY rules.py clipmodel.py app.py ./
RUN useradd -r -u 10001 svc && chown -R svc /app
USER svc
ENV HF_HUB_OFFLINE=1
EXPOSE 8080
HEALTHCHECK --interval=60s --timeout=5s --start-period=60s CMD python -c "import urllib.request;urllib.request.urlopen('http://127.0.0.1:8080/health',timeout=4)"
CMD ["python", "app.py"]

# Service de modération YOLOv8 — Chasse & Pêche 360°
FROM python:3.12-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Modèle : téléchargé depuis les publications officielles d'Ultralytics puis converti en ONNX (float32), sans PyTorch
COPY convert/ convert/
ADD https://github.com/ultralytics/assets/releases/download/v8.2.0/yolov8n-cls.pt /tmp/yolov8n-cls.pt
RUN mkdir -p model && Q=0 python convert/build_onnx.py /tmp/yolov8n-cls.pt model/yolov8n-cls.onnx && rm /tmp/yolov8n-cls.pt
COPY labels_en.json rules.py app.py ./
RUN useradd -r -u 10001 svc && chown -R svc /app
USER svc
EXPOSE 8080
HEALTHCHECK --interval=60s --timeout=5s CMD python -c "import urllib.request;urllib.request.urlopen('http://127.0.0.1:8080/health',timeout=4)"
CMD ["python", "app.py"]

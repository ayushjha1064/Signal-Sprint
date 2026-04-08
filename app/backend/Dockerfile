FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt /tmp/backend-requirements.txt
COPY piro_model/requirements.txt /tmp/model-requirements.txt

RUN pip install --no-cache-dir -r /tmp/backend-requirements.txt -r /tmp/model-requirements.txt

COPY backend /app/backend
COPY piro_model /app/piro_model

WORKDIR /app/backend

ENV PYTHONPATH=/app/piro_model:/app/backend

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

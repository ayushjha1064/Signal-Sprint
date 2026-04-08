# DMC Dustbin Monitor

Full-stack hackathon app that keeps your ML model unchanged and adds:

- FastAPI backend for image upload and inference
- React/Vite mobile-style frontend using your provided UI
- Docker and local run setup for deployment

## Project Layout

- `app/piro_model`: your provided model bundle, copied as-is
- `app/backend`: API wrapper around the provided `Piro` predictor
- `app/frontend`: integrated UI

## Model Bundle

The deployed app now uses the provided Piro bundle directly:

- `app/piro_model/model.pkl`
- `app/piro_model/predict.py`

If you move these files, update `app/backend/.env` from `app/backend/.env.example`.
For Docker, the compose file already remaps these paths to `/app/piro_model/...` inside the container.

## Local Run

1. Create backend env file:

```bash
cp app/backend/.env.example app/backend/.env
```

2. Install backend dependencies:

```bash
cd app/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt -r ../piro_model/requirements.txt
```

3. Start backend:

```bash
PYTHONPATH=../piro_model:. uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

4. Install frontend dependencies:

```bash
cd app/frontend
npm install
```

5. Start frontend:

```bash
npm run dev
```

Frontend runs at `http://localhost:5173` and uses the backend at `http://localhost:8000`.

## Docker Deployment

1. Create `app/backend/.env`
2. Make sure model artifacts are present
3. Run:

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

## API

- `GET /api/health`: backend/model readiness
- `POST /api/predict`: upload an image as `file`

# Running MindMitra locally

Follow these steps to run the components of MindMitra.

## 1. Frontend
`ash
cd frontend
npm install
npm run dev
`

## 2. Backend
Create a .env file in the ackend/ directory using .env.example as a template.
`ash
cd backend
npm install
npm run dev
`

## 3. ML Service (FastAPI)
`ash
cd ml_service
pip install -r requirements.txt
uvicorn app:app --reload
`

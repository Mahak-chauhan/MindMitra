# MindMitra Architecture

MindMitra is built as a MERN web application with a separate Python ML inference service.

## Components
1. **Frontend (React)**: Handles UI, dashboards, chart visualization, and forms. Communicates only with the Node backend.
2. **Backend (Node/Express)**: Handles business logic, MongoDB reads/writes, validation, and securely communicates with the FastAPI service for predictions.
3. **ML Service (FastAPI)**: Evaluates incoming validated features using saved Scikit/XGBoost models, generates SHAP explanations, and returns insights.
4. **Database (MongoDB Atlas)**: Stores user check-ins, diaries, and activity history.

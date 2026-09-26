# MindMitra ML Pipeline Documentation

## 1. Overview
MindMitra uses a synthetic "100K Sleep Health & Daily Performance Dataset" to train predictive models for personal wellbeing and fatigue monitoring. 
**Disclaimer:** This dataset is strictly synthetic and DOES NOT represent a clinically validated medical cohort. The predictions generated are for wellness tracking and do not constitute medical advice, nor do they represent real users.

## 2. Dataset Processing
- **Source**: `sleep_health_dataset.csv`
- **Cleaning (`clean_data.py`)**: Handles median imputation for numeric features and drops duplicates.
- **Feature Engineering (`feature_engineering.py`)**: One-hot encodes nominal categoricals, calculates derived ratios (like `activity_work_ratio`).

## 3. Methodological Stance & Target Variables
For MindMitra, `felt_rested` (a raw 1-100 score) is used as a proxy target representing the user's rested/fatigue-related state. The application uses this proxy in a morning check-in scenario, but the source dataset itself does not establish a timestamp or chronological measurement order. Therefore, model results from this dataset are interpreted as associations rather than evidence of temporal causation or real-world forecasting.

1. **Primary Target (`felt_rested`)**: Modeled as a continuous regression target (1-100).
2. **Secondary Target (`cognitive_performance_score`)**: Modeled as a continuous regression target (1-100).

## 4. Feature Exclusions & Leakage Prevention
To prevent methodological leakage and align with our app's workflow constraints:
- When predicting `felt_rested`, `cognitive_performance_score` is explicitly EXCLUDED.
- `sleep_disorder_risk` is treated as an available baseline feature reflecting an underlying trait association, rather than a chronological precursor.

## 5. Modeling Strategy (Phase 2)
- **Algorithms**: Random Forest (Baseline) and XGBoost (Candidate).
- **Environment**: A dedicated project-local Python 3.11 virtual environment (`ml_env`) is used to ensure reproducible dependency resolution.
- **Evaluation**: Evaluated using Mean Absolute Error (MAE), Root Mean Squared Error (RMSE), and R² Score.
- **Model Serialization**: Final models and scalers are exported via `joblib` into `ml/models/`.

## 6. Model Diagnostics & Performance Audit
An audit of the near-perfect test-set performance (R² > 0.998) was conducted to investigate target leakage and artificial simplicity.
- **Train vs. Test**: The training metrics (e.g., R² = 0.9999) and test metrics (e.g., R² = 0.9996) are nearly identical. 
- **Cause of High Performance**: The dataset is synthetic. Feature importance reveals that the models perfectly reverse-engineered the mathematical generation formulas rather than learning complex real-world behaviors.
  - `felt_rested` is almost entirely predicted by `sleep_duration` (~70%) and `stress_level` (~25%).
  - `cognitive_performance_score` is almost entirely predicted by `felt_rested` (~73%), `physical_activity_minutes` (~11%), and `alcohol_consumption_drinks` (~15%).
- **Leakage Status**: No accidental target leakage was found in the engineered features (`total_screen_time_hours`, `activity_work_ratio`). The high performance stems purely from the synthetic dataset being too "easy" (Category C), not from methodological data leakage. We evaluate these models purely as structural placeholders for the MERN application architecture.

## 7. SHAP Explainability
A TreeExplainer (`shap.TreeExplainer`) is utilized to extract global and local feature contributions from the XGBoost models. 
- **Consistency**: Explanations are strictly bound to the transformed feature set produced by the scikit-learn `ColumnTransformer`. Feature names match exactly to their one-hot encoded or scaled equivalents.
- **Explainability API**: The `MindMitraExplainer` wrapper exposes clean, frontend-ready JSON structures detailing:
  - Base expected value
  - Specific feature contributions (ranked by magnitude)
  - Direction of impact ("positive" or "negative")
- **Methodological Disclaimer**: Contributions represent mathematical relationships within the synthetic XGBoost model structure, NOT real-world causal influence.

## 8. FastAPI Inference Service (Phase 4)
The models and SHAP explainer are wrapped into a robust FastAPI backend located in `ml_service/`.
- **Architecture**: Operates as a purely internal microservice. React strictly communicates with the Node.js Express server, which acts as the API gateway to FastAPI.
- **Endpoints**:
  - `GET /health`: Model artifact loading verification.
  - `POST /predict`: Pydantic-validated endpoint returning full predictions, base expected values, and ranked SHAP contributions for the requested target.
- **Features**: Safely handles nullables (e.g. missing `work_hours_per_day`) via imputation pipelines. Dynamically engineers ratio features before piping requests to the exact saved artifacts used during training.

## 9. Full-Stack Integration (Phase 5 & 6)
- **Node Gateway**: The Express backend (`backend/services/mlService.js`) communicates with FastAPI.
- **Frontend Flow**: React calls `POST /api/predictions`, the Node backend forwards the request to FastAPI, captures the 68-feature SHAP list, and returns it to the browser.
- **UI Presentation**: The React `CheckIn` page displays the top 4 contributing factors natively using a non-medical, explainable UI design, while preserving the full SHAP structure in memory for debugging.
## 10. Check-In Integration & Personal Baseline (Phase M4-2)
- **Check-In Flow**: The Node backend intercepts a daily check-in, populates known user inputs (e.g., sleepDuration, stressLevel, 
ightScreenTimeMinutes, physicalActivityMinutes), and injects temporary default values for features belonging to unimplemented modules (e.g., wearables).
- **Personal Baseline**: This is an **application-level statistical comparison**, NOT a clinical assessment or part of the ML training. The backend requires a minimum history of 7 check-ins. It calculates simple rolling averages (e.g., sleep, stress) and returns qualitative text (e.g., "below your usual range") alongside the ML prediction.
- **Independence**: The ML service (FastAPI) and Model Artifacts (XGBoost) remain entirely decoupled from the Personal Baseline logic. The ML predicts objective elt_rested proxies based on static synthetic datasets, while the Baseline compares the user to their own historical inputs.
## 11. Digital Wellbeing Integration (Phase M4-3)
- **Check-In Integration**: The Node backend dynamically queries the DigitalWellbeing collection for the authenticated user's most recent self-reported screen time data.
- **Fallback Behavior**: If a user has never submitted a Digital Wellbeing entry, checkinController.js safely falls back to temporary system averages (e.g., 4.0 total screen time hours, 30 mins night screen time) to fulfill the XGBoost input schema, ensuring predictions still process without throwing 500 errors.
- **SHAP Explanation**: SHAP continues to neutrally report the *mathematical* contribution of screen time to the score. The UI displays it as "Night Screen Time contributed to this model prediction", avoiding any causal claims like "Screen time caused your score".

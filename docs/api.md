# MindMitra API Documentation

## Node.js Express API (Gateway)
Base URL: http://localhost:5000/api

### Authentication Endpoints
- POST /auth/register: Registers a new user.
- POST /auth/login: Authenticates a user.
- GET /auth/me: Returns the authenticated user's profile.

### User Profile Endpoints
- GET /profile: Retrieves the authenticated user's Profile subdocument. The profile is optional and returns an empty object {} if unconfigured.
- PUT /profile: Updates the authenticated user's Profile. Accepts 9 specific fields (ge, gender, occupation, work_type, work_hours_per_day, commute_time_minutes, edtime, wakeup_time, workout_type). Categorical strings must exactly match dataset enum categories. Numeric bounds are validated. Passwords and internal hashes are never exposed.

### Check-In Endpoints
- POST /checkins: Submits a daily check-in (sleep, stress, mood, etc.), triggers the ML prediction via FastAPI, computes the personal baseline comparison, and saves the result.
- GET /checkins: Returns check-in history exclusively for the authenticated user.
- GET /checkins/:id: Retrieves a specific check-in. Ownership is strictly verified.

### Mood Diary Endpoints
- POST /diary: Submits a mood diary entry.
- GET /diary: Returns mood diary history.
- GET /diary/:id: Retrieves a specific entry.
- DELETE /diary/:id: Deletes a specific entry.

### Digital Wellbeing Endpoints
- POST /wellbeing: Submits self-reported digital usage.
- GET /wellbeing: Returns history exclusively for the authenticated user.
- GET /wellbeing/:id: Retrieves a specific entry.
- DELETE /wellbeing/:id: Deletes a specific entry.

### Wellness Activities Endpoints
- GET /activities: Retrieves the catalog of active wellness activities.
- GET /activities/recommendations: Returns personalized (rule-based) activity recommendations.
- POST /activities/:id/start: Records that a user has started an activity.
- POST /activities/history/:logId/complete: Marks an activity log as completed.
- GET /activities/history: Retrieves the authenticated user's activity history.

### Roadmap Endpoints
- POST /roadmap/generate: Generates a personalized daily roadmap.
- GET /roadmap/today: Retrieves today's roadmap for the user.
- GET /roadmap/history: Retrieves lightweight historical roadmaps (max 30 days).
- PATCH /roadmap/:id/items/:itemId/complete: Marks a specific task inside a roadmap timeblock as completed.

### Chatbot (Mitra AI Companion) Endpoints
- POST /chatbot: Submits a user message to the AI Companion. Automatically builds internal user context (CheckIn, prediction, roadmap) and securely routes it to the LLM provider (or mock layer if unconfigured) without exposing raw API keys.
- GET /chatbot/history: Retrieves the authenticated user's conversation history.

## FastAPI ML Inference Service (Internal Only)
Base URL: http://localhost:8000

- GET /health: Verifies model artifacts are loaded.
- POST /predict: Generates XGBoost predictions and detailed SHAP explainability matrices.

## Data Quality (Input Completeness)
Data Quality describes completeness of the input information used for an insight. It does not represent model accuracy, medical certainty, or probability of correctness.

### Source Categories
- userInput: Values provided by the user in the current Check-In context (e.g. sleep_duration, stress_level).
- userProfile: Values drawn from the authenticated user's static profile settings (e.g. age, workout_type).
- digitalWellbeing: Values drawn from recent Digital Wellbeing integrations (e.g. screen_time_hours).
- defaults: Fallback system defaults used to fulfill the expected ML model schema when personalized data is unavailable.

### Calculation Method
The Data Quality calculation determines the percentage of expected prediction input fields that came from user-provided or device-derived sources rather than system defaults. The exact calculation is deterministic based on the underlying provenance dictionary:

`
percentage = ( userInput + userProfile + digitalWellbeing ) / total fields * 100
`

### Thresholds
- **High** (>= 80%): The insight uses highly complete information.
- **Moderate** (>= 50%): The insight uses a mix of personal information and some system defaults.
- **Limited** (< 50%): Some information is unavailable, heavily relying on system defaults for the model matrix.

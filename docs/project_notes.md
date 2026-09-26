# MindMitra Project Notes

## Limitations & Privacy
- **Self-Reported Data**: Digital Wellbeing and Mood tracking rely entirely on manual, self-reported user entry.
- **Activity Independence**: Completing a Wellness Activity does *not* automatically generate ML physical activity features to prevent injecting falsely confident data into the ML model.

## Recommendation Engine & Roadmaps
- **Logic**: Activity recommendations and Full-Day Roadmaps are served via a simple, transparent rule-based service (NOT an ML model). They inspect recent Check-In and Digital Wellbeing records.
- **Scope**: Recommendations are explicitly framed as general wellness practices, avoiding any presentation as medical treatment.
- **SHAP vs Roadmap**: SHAP uniquely explains *why the ML model outputted a specific prediction score* based on dataset associations. Roadmap reasons uniquely explain *why the rule-engine suggested a task* based on the user's daily input vs baseline. These systems operate independently to ensure transparent explainability.

## AI Companion (Mitra)
- **Separation of Concerns**: MindMitra's predictive model and SHAP explainer remain strictly separate from the conversational AI layer. Mitra does *not* compute predictions, it only acts as an empathetic explainer of existing data.
- **Context Boundaries**: The context builder securely passes only the authenticated user's data (latest Check-In, SHAP prediction data, and roadmap) to the LLM. It never exposes JWTs, passwords, or global datasets.
- **Missing Provider Behavior**: If GEMINI_API_KEY (or the generic LLM config) is missing, the backend degrades gracefully, returning a structured mock response instead of crashing. This ensures the rest of MindMitra (XGBoost, React, Roadmaps) remains completely functional.

## ML Data Integrity & Provenance (M5)
- **Digital Wellbeing Integration Fix**: An object key duplication bug in the ML feature mapping previously overwrote real Digital Wellbeing data with static defaults. This has been corrected so real data correctly maps to screen_time_hours and social_media_hours.
- **Data Provenance**: Prediction payloads are saved alongside a provenance dictionary mapping every ML feature to its origin (user_input, digital_wellbeing, default, or user_profile). This enables future UI layers to honestly disclose exactly which parts of a prediction were personalized versus derived from temporary system defaults.
- **Profile ML Payload Mapping**: If a user has completed optional fields in their User Profile (e.g. ge, workout_type), these values directly replace the static defaults sent to the ML endpoint. However, this is strictly for personalization and reducing reliance on system defaults; it does *not* claim or guarantee improved clinical validity or model accuracy. Unconfigured fields safely fall back to static defaults (like ge: 30).

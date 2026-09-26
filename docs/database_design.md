# MindMitra Database Design

## MongoDB (Mongoose)

### 1. User
Stores basic user identity for authentication and authorization.

### 2. CheckIn
Records the user's daily self-reported state and metrics.

### 3. MoodDiary
Records specific emotion/mood logging occurrences throughout the day.

### 4. DigitalWellbeing
Records self-reported digital behavior.

### 5. WellnessActivity
Catalog of available activities (e.g., Breathing, Meditation).

### 6. UserActivity
Records a user's engagement with an activity.

### 7. Roadmap
A personalized, daily four-block planner generated via transparent rules.
- user (ObjectId, ref: User, required)
- date (Date, required, unique per user)
- summaryText (String, required)
- morning, fternoon, evening, 
ight (Arrays of RoadmapItemSchema containing title, description, reason, duration, activityId, isCompleted).

### 8. Prediction
Stores generated ML predictions and SHAP explainability factors linked to a specific CheckIn.

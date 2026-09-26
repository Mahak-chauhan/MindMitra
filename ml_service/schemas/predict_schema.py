from pydantic import BaseModel, Field
from typing import Optional, List

class PredictionRequest(BaseModel):
    target: str = Field(default="felt_rested", description="Target model: 'felt_rested' or 'cognitive_performance_score'")
    age: int
    sleep_duration: float
    sleep_quality_score: int
    physical_activity_minutes: int
    steps_per_day: int
    stress_level: int
    screen_time_hours: float
    night_screen_time_minutes: int
    social_media_hours: float
    caffeine_intake_mg: int
    alcohol_consumption_drinks: int
    diet_quality: int
    work_hours_per_day: Optional[float] = None
    commute_time_minutes: int
    heart_rate_resting: int
    heart_rate_variability: Optional[int] = None
    blood_pressure_systolic: int
    blood_pressure_diastolic: int
    bmi: float
    gender: str
    country: str
    occupation: str
    bedtime: str
    wakeup_time: str
    sleep_disorder_risk: str
    workout_type: str
    work_type: str
    smoking_status: str
    medication_usage: str
    felt_rested: Optional[float] = None

class FeatureContribution(BaseModel):
    feature: str
    transformed_value: float
    contribution: float
    direction: str

class PredictionResponse(BaseModel):
    target: str
    prediction: float
    base_value: float
    model_version: str
    ranked_contributions: List[FeatureContribution]
    message: str

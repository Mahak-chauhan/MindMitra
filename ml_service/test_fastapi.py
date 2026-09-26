from fastapi.testclient import TestClient
import json
import sys
import os

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.append(ROOT_DIR)

from ml_service.app import app

def run_tests():
    with TestClient(app) as client:
        print("Testing /health")
        response = client.get("/health")
        print(response.status_code, response.json())
        
        valid_payload = {
            "target": "felt_rested",
            "age": 30,
            "sleep_duration": 7.5,
            "sleep_quality_score": 8,
            "physical_activity_minutes": 45,
            "steps_per_day": 8000,
            "stress_level": 4,
            "screen_time_hours": 3.0,
            "night_screen_time_minutes": 30,
            "social_media_hours": 1.0,
            "caffeine_intake_mg": 100,
            "alcohol_consumption_drinks": 0,
            "diet_quality": 8,
            "work_hours_per_day": 8.0,
            "commute_time_minutes": 30,
            "heart_rate_resting": 65,
            "heart_rate_variability": 50,
            "blood_pressure_systolic": 120,
            "blood_pressure_diastolic": 80,
            "bmi": 22.5,
            "gender": "Male",
            "country": "USA",
            "occupation": "Software Engineer",
            "bedtime": "23:00",
            "wakeup_time": "07:00",
            "sleep_disorder_risk": "Low",
            "workout_type": "Cardio",
            "work_type": "Remote",
            "smoking_status": "Never",
            "medication_usage": "missing"
        }

        print("\nTesting valid prediction (Target 1: felt_rested)")
        response = client.post("/predict", json=valid_payload)
        print(response.status_code, list(response.json().keys()) if response.status_code == 200 else response.json())
        if response.status_code == 200:
            print("Prediction:", response.json().get('prediction'))
            print("Contributions count:", len(response.json().get('ranked_contributions', [])))
            print("Top Contribution:", response.json().get('ranked_contributions')[0])

        print("\nTesting valid prediction (Target 2: cognitive_performance_score)")
        payload_t2 = valid_payload.copy()
        payload_t2["target"] = "cognitive_performance_score"
        payload_t2["felt_rested"] = 80.0
        response = client.post("/predict", json=payload_t2)
        print(response.status_code, list(response.json().keys()) if response.status_code == 200 else response.json())
        
        print("\nTesting missing target 2 requirement (no felt_rested)")
        invalid_payload_3 = valid_payload.copy()
        invalid_payload_3["target"] = "cognitive_performance_score"
        response = client.post("/predict", json=invalid_payload_3)
        print(response.status_code, response.json())

if __name__ == '__main__':
    run_tests()

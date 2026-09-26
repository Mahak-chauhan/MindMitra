import pandas as pd
import numpy as np
import json
import os

np.random.seed(42)
n = 100000

data = {
    'user_id': np.arange(1, n+1),
    'age': np.random.randint(18, 80, n),
    'gender': np.random.choice(['Male', 'Female', 'Non-binary'], n, p=[0.48, 0.48, 0.04]),
    'country': np.random.choice(['USA', 'UK', 'Canada', 'Australia', 'India', 'Germany'], n),
    'occupation': np.random.choice(['Software Engineer', 'Teacher', 'Doctor', 'Nurse', 'Student', 'Unemployed', 'Sales', 'Manager'], n),
    'sleep_duration': np.random.normal(7.0, 1.5, n).clip(3, 12),
    'sleep_quality_score': np.random.randint(1, 11, n),
    'bedtime': np.random.choice(['21:00', '22:00', '23:00', '00:00', '01:00', '02:00'], n),
    'wakeup_time': np.random.choice(['05:00', '06:00', '07:00', '08:00', '09:00', '10:00'], n),
    'sleep_disorder_risk': np.random.choice(['Low', 'Medium', 'High'], n, p=[0.7, 0.2, 0.1]),
    'physical_activity_minutes': np.random.normal(45, 30, n).clip(0, 300),
    'workout_type': np.random.choice(['None', 'Cardio', 'Strength', 'Yoga', 'Mixed'], n),
    'steps_per_day': np.random.normal(7000, 3000, n).clip(500, 25000),
    'stress_level': np.random.randint(1, 11, n),
    'screen_time_hours': np.random.normal(5, 2.5, n).clip(0, 16),
    'night_screen_time_minutes': np.random.normal(45, 30, n).clip(0, 240),
    'social_media_hours': np.random.normal(2, 1.5, n).clip(0, 10),
    'caffeine_intake_mg': np.random.normal(150, 100, n).clip(0, 800),
    'alcohol_consumption_drinks': np.random.choice([0, 1, 2, 3, 4, 5], n, p=[0.5, 0.2, 0.15, 0.08, 0.05, 0.02]),
    'diet_quality': np.random.randint(1, 11, n),
    'work_hours_per_day': np.random.normal(8, 2, n).clip(0, 14),
    'work_type': np.random.choice(['Remote', 'Hybrid', 'On-site'], n),
    'commute_time_minutes': np.random.normal(30, 20, n).clip(0, 120),
    'heart_rate_resting': np.random.normal(70, 10, n).clip(45, 110),
    'heart_rate_variability': np.random.normal(50, 20, n).clip(15, 120),
    'blood_pressure_systolic': np.random.normal(120, 15, n).clip(90, 180),
    'blood_pressure_diastolic': np.random.normal(80, 10, n).clip(60, 120),
    'bmi': np.random.normal(25, 5, n).clip(15, 45),
    'smoking_status': np.random.choice(['Never', 'Former', 'Current'], n, p=[0.7, 0.2, 0.1]),
    'medication_usage': np.random.choice(['None', 'Sleep', 'Anxiety', 'Other'], n, p=[0.8, 0.05, 0.05, 0.1]),
}

base_rested = 50 + (data['sleep_duration'] - 7) * 10 - (data['stress_level'] - 5) * 3 - (data['night_screen_time_minutes'] / 10)
data['felt_rested'] = base_rested.clip(1, 100).astype(int)

base_cog = 40 + (data['felt_rested'] * 0.4) + (data['physical_activity_minutes'] / 10) - (data['alcohol_consumption_drinks'] * 2)
data['cognitive_performance_score'] = base_cog.clip(1, 100).astype(int)

missing_mask = np.random.rand(n) < 0.02
data['work_hours_per_day'] = np.where(missing_mask, np.nan, data['work_hours_per_day'])
missing_mask = np.random.rand(n) < 0.01
data['heart_rate_variability'] = np.where(missing_mask, np.nan, data['heart_rate_variability'])

df = pd.DataFrame(data)

out_dir = r'D:\Users\hp\Projects\MindMitra\ml\data'
os.makedirs(out_dir, exist_ok=True)
df.to_csv(os.path.join(out_dir, 'sleep_health_dataset.csv'), index=False)

print(f"Generated synthetic dataset with {df.shape[0]} rows and {df.shape[1]} columns.")

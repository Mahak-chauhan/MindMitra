import pandas as pd
import json

df = pd.read_csv(r'D:\Users\hp\Projects\MindMitra\ml\data\sleep_health_dataset.csv')
result = {
    'gender': df['gender'].dropna().unique().tolist(),
    'occupation': df['occupation'].dropna().unique().tolist(),
    'work_type': df['work_type'].dropna().unique().tolist(),
    'workout_type': df['workout_type'].dropna().unique().tolist(),
    'bedtime': df['bedtime'].dropna().unique().tolist(),
    'wakeup_time': df['wakeup_time'].dropna().unique().tolist(),
    'country': df['country'].dropna().unique().tolist()
}
print(json.dumps(result, indent=2))

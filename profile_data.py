import pandas as pd
import json
import os

df = pd.read_csv(r'D:\Users\hp\Projects\MindMitra\ml\data\sleep_health_dataset.csv')

profile = {
    'rows': int(df.shape[0]),
    'columns': int(df.shape[1]),
    'column_names': df.columns.tolist(),
    'data_types': {k: str(v) for k, v in df.dtypes.items()},
    'missing_values': df.isnull().sum().to_dict(),
    'duplicate_records': int(df.duplicated().sum()),
    'unique_ids': int(df['user_id'].nunique()),
    'categorical_variables': df.select_dtypes(include=['object']).columns.tolist(),
    'numerical_variables': df.select_dtypes(exclude=['object']).columns.tolist(),
    'target_variables': ['felt_rested', 'cognitive_performance_score'],
    'class_distributions': {
        'sleep_disorder_risk': df['sleep_disorder_risk'].value_counts().to_dict(),
        'gender': df['gender'].value_counts().to_dict()
    },
    'descriptive_statistics': df.describe().to_dict()
}

out_dir = r'D:\Users\hp\Projects\MindMitra\ml\reports'
os.makedirs(out_dir, exist_ok=True)
with open(os.path.join(out_dir, 'data_profile.json'), 'w') as f:
    json.dump(profile, f, indent=4)

print('Profiling complete.')

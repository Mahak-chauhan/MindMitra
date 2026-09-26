import os
import sys
import pandas as pd

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if ROOT_DIR not in sys.path:
    sys.path.append(ROOT_DIR)

from ml.explainability.shap_explainer import MindMitraExplainer

class MLService:
    def __init__(self):
        self.models_dir = os.path.join(ROOT_DIR, "ml", "models")
        self.explainer = None
        self.loaded = False

    def load_models(self):
        try:
            self.explainer = MindMitraExplainer(self.models_dir)
            self.loaded = True
        except Exception as e:
            print(f"Error loading models: {e}")
            self.loaded = False

    def predict(self, raw_data_dict: dict):
        if not self.loaded:
            raise RuntimeError("Models not loaded.")
            
        target = raw_data_dict.get('target', 'felt_rested')
        if target not in ['felt_rested', 'cognitive_performance_score']:
            raise ValueError(f"Unknown target: {target}")
            
        df = pd.DataFrame([raw_data_dict])
        
        # Engineering applied before preprocessor
        df['total_screen_time_hours'] = df['screen_time_hours'] + (df['night_screen_time_minutes'] / 60.0)
        work_hours_for_ratio = df['work_hours_per_day'].fillna(8.0) 
        df['activity_work_ratio'] = df['physical_activity_minutes'] / (work_hours_for_ratio * 60 + 1)
        
        if target == 'cognitive_performance_score':
            if 'felt_rested' not in df.columns or df['felt_rested'].isnull().all():
                raise ValueError("Target 'cognitive_performance_score' requires 'felt_rested' feature.")
        
        explanation = self.explainer.explain_local(df, target=target)[0]
        return explanation

ml_service_instance = MLService()

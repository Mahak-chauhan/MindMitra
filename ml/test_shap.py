import os
import json
import pandas as pd
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml.explainability.shap_explainer import MindMitraExplainer

def run_tests():
    models_dir = r"D:\Users\hp\Projects\MindMitra\ml\models"
    explainer = MindMitraExplainer(models_dir)
    
    # Load dataset
    df = pd.read_csv(r"D:\Users\hp\Projects\MindMitra\ml\data\sleep_health_dataset.csv")
    df = df.drop_duplicates().dropna(subset=['felt_rested', 'cognitive_performance_score'])
    
    # Engineering
    df['total_screen_time_hours'] = df['screen_time_hours'] + (df['night_screen_time_minutes'] / 60.0)
    df['activity_work_ratio'] = df['physical_activity_minutes'] / (df['work_hours_per_day'] * 60 + 1)
    df = df.drop(columns=['user_id'])
    
    # Target 1 preparation (needs dropping cognitive_performance_score)
    df_t1 = df.drop(columns=['felt_rested', 'cognitive_performance_score'])
    df_t2 = df.drop(columns=['cognitive_performance_score'])
    
    # Take 5 random samples for local explanations
    sample_t1 = df_t1.sample(5, random_state=42)
    sample_t2 = df_t2.sample(5, random_state=42)
    
    local_1 = explainer.explain_local(sample_t1, target='felt_rested')
    local_2 = explainer.explain_local(sample_t2, target='cognitive_performance_score')
    
    # Take 1000 samples for global explanations
    bg_t1 = df_t1.sample(1000, random_state=42)
    bg_t2 = df_t2.sample(1000, random_state=42)
    
    global_1 = explainer.explain_global(bg_t1, target='felt_rested')
    global_2 = explainer.explain_global(bg_t2, target='cognitive_performance_score')
    
    report = {
        "local_explanations_target1": local_1,
        "local_explanations_target2": local_2,
        "global_explanations_target1": global_1,
        "global_explanations_target2": global_2
    }
    
    with open(r"D:\Users\hp\Projects\MindMitra\ml\reports\shap_test_report.json", "w") as f:
        json.dump(report, f, indent=4)
        
    print("SHAP test completed successfully.")

if __name__ == '__main__':
    run_tests()

import json
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
import sys
import os
import traceback

try:
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from ml.evaluation.metrics import evaluate_regression

    def run_diagnostics():
        df = pd.read_csv(r"D:\Users\hp\Projects\MindMitra\ml\data\sleep_health_dataset.csv")
        df = df.drop_duplicates()
        df = df.dropna(subset=['felt_rested', 'cognitive_performance_score'])
        
        # Engineering
        df['total_screen_time_hours'] = df['screen_time_hours'] + (df['night_screen_time_minutes'] / 60.0)
        df['activity_work_ratio'] = df['physical_activity_minutes'] / (df['work_hours_per_day'] * 60 + 1)
        df = df.drop(columns=['user_id'])
        
        # Numeric correlation
        numeric_cols = df.select_dtypes(include=['int64', 'float64']).columns
        corr_matrix = df[numeric_cols].corr()
        corr_felt_rested = {k: float(v) for k, v in corr_matrix['felt_rested'].sort_values(ascending=False).to_dict().items()}
        corr_cog_perf = {k: float(v) for k, v in corr_matrix['cognitive_performance_score'].sort_values(ascending=False).to_dict().items()}
        
        # Load Models and extract importances & train metrics
        models_dir = r"D:\Users\hp\Projects\MindMitra\ml\models"
        
        diagnostics = {
            "correlations": {
                "felt_rested": corr_felt_rested,
                "cognitive_performance_score": corr_cog_perf
            },
            "train_vs_test_metrics": {},
            "feature_importances": {}
        }
        
        # Target 1
        X1 = df.drop(columns=['felt_rested', 'cognitive_performance_score'])
        y1 = df['felt_rested']
        X1_train, X1_test, y1_train, y1_test = train_test_split(X1, y1, test_size=0.2, random_state=42)
        
        preprocessor_1 = joblib.load(os.path.join(models_dir, "preprocessor_felt_rested.joblib"))
        rf1 = joblib.load(os.path.join(models_dir, "rf_felt_rested.joblib"))
        xgb1 = joblib.load(os.path.join(models_dir, "xgboost_felt_rested.joblib"))
        features_1 = joblib.load(os.path.join(models_dir, "features_felt_rested.joblib"))
        
        X1_train_proc = preprocessor_1.transform(X1_train)
        X1_test_proc = preprocessor_1.transform(X1_test)
        
        rf1_train_preds = rf1.predict(X1_train_proc)
        rf1_test_preds = rf1.predict(X1_test_proc)
        xgb1_train_preds = xgb1.predict(X1_train_proc)
        xgb1_test_preds = xgb1.predict(X1_test_proc)
        
        diagnostics['train_vs_test_metrics']['felt_rested'] = {
            "RandomForest": {
                "train": evaluate_regression(y1_train, rf1_train_preds),
                "test": evaluate_regression(y1_test, rf1_test_preds)
            },
            "XGBoost": {
                "train": evaluate_regression(y1_train, xgb1_train_preds),
                "test": evaluate_regression(y1_test, xgb1_test_preds)
            }
        }
        
        # Sort and take top 15
        rf1_imp_sorted = sorted(zip(features_1, rf1.feature_importances_), key=lambda x: x[1], reverse=True)[:15]
        rf1_imp = {k: float(v) for k, v in rf1_imp_sorted}
        
        xgb1_imp_sorted = sorted(zip(features_1, xgb1.feature_importances_), key=lambda x: x[1], reverse=True)[:15]
        xgb1_imp = {k: float(v) for k, v in xgb1_imp_sorted}
        
        diagnostics['feature_importances']['felt_rested'] = {
            "RandomForest": rf1_imp,
            "XGBoost": xgb1_imp
        }
        
        # Target 2
        X2 = df.drop(columns=['cognitive_performance_score'])
        y2 = df['cognitive_performance_score']
        X2_train, X2_test, y2_train, y2_test = train_test_split(X2, y2, test_size=0.2, random_state=42)
        
        preprocessor_2 = joblib.load(os.path.join(models_dir, "preprocessor_cognitive.joblib"))
        rf2 = joblib.load(os.path.join(models_dir, "rf_cognitive.joblib"))
        xgb2 = joblib.load(os.path.join(models_dir, "xgboost_cognitive.joblib"))
        features_2 = joblib.load(os.path.join(models_dir, "features_cognitive.joblib"))
        
        X2_train_proc = preprocessor_2.transform(X2_train)
        X2_test_proc = preprocessor_2.transform(X2_test)
        
        diagnostics['train_vs_test_metrics']['cognitive_performance_score'] = {
            "RandomForest": {
                "train": evaluate_regression(y2_train, rf2.predict(X2_train_proc)),
                "test": evaluate_regression(y2_test, rf2.predict(X2_test_proc))
            },
            "XGBoost": {
                "train": evaluate_regression(y2_train, xgb2.predict(X2_train_proc)),
                "test": evaluate_regression(y2_test, xgb2.predict(X2_test_proc))
            }
        }
        
        rf2_imp_sorted = sorted(zip(features_2, rf2.feature_importances_), key=lambda x: x[1], reverse=True)[:15]
        rf2_imp = {k: float(v) for k, v in rf2_imp_sorted}
        
        xgb2_imp_sorted = sorted(zip(features_2, xgb2.feature_importances_), key=lambda x: x[1], reverse=True)[:15]
        xgb2_imp = {k: float(v) for k, v in xgb2_imp_sorted}
        
        diagnostics['feature_importances']['cognitive_performance_score'] = {
            "RandomForest": rf2_imp,
            "XGBoost": xgb2_imp
        }
        
        os.makedirs(r"D:\Users\hp\Projects\MindMitra\ml\reports", exist_ok=True)
        with open(r"D:\Users\hp\Projects\MindMitra\ml\reports\model_diagnostics.json", "w") as f:
            json.dump(diagnostics, f, indent=4)
            
        print("Diagnostics completed successfully.")

    run_diagnostics()
except Exception as e:
    print("ERROR OCCURRED:")
    traceback.print_exc()

import os
import json
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor

import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ml.evaluation.metrics import evaluate_regression

def train_and_evaluate():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(base_dir, "data", "sleep_health_dataset.csv")
    models_dir = os.path.join(base_dir, "models")
    reports_dir = os.path.join(base_dir, "reports")
    
    df = pd.read_csv(data_path)
    
    # 1. Basic row-wise cleaning
    df = df.drop_duplicates()
    df = df.dropna(subset=['felt_rested', 'cognitive_performance_score'])
    
    # 2. Row-wise Engineering (No population stats used)
    df['total_screen_time_hours'] = df['screen_time_hours'] + (df['night_screen_time_minutes'] / 60.0)
    df['activity_work_ratio'] = df['physical_activity_minutes'] / (df['work_hours_per_day'] * 60 + 1)
    
    # Drop identifier
    df = df.drop(columns=['user_id'])
    
    numeric_features = ['age', 'sleep_duration', 'sleep_quality_score', 'physical_activity_minutes', 
                        'steps_per_day', 'stress_level', 'screen_time_hours', 'night_screen_time_minutes', 
                        'social_media_hours', 'caffeine_intake_mg', 'alcohol_consumption_drinks', 
                        'diet_quality', 'work_hours_per_day', 'commute_time_minutes', 'heart_rate_resting', 
                        'heart_rate_variability', 'blood_pressure_systolic', 'blood_pressure_diastolic', 
                        'bmi', 'total_screen_time_hours', 'activity_work_ratio']
    
    categorical_features = ['gender', 'country', 'occupation', 'bedtime', 'wakeup_time', 
                            'sleep_disorder_risk', 'workout_type', 'work_type', 'smoking_status', 'medication_usage']

    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median'))
    ])
    
    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
        ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])
    
    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(reports_dir, exist_ok=True)

    metrics_report = {'felt_rested_model': {}, 'cognitive_performance_model': {}}

    # ==========================================
    # TARGET 1: felt_rested
    # ==========================================
    target_1 = 'felt_rested'
    X1 = df.drop(columns=[target_1, 'cognitive_performance_score'])
    y1 = df[target_1]

    X1_train, X1_test, y1_train, y1_test = train_test_split(X1, y1, test_size=0.2, random_state=42)
    
    preprocessor_1 = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features)
        ])

    X1_train_proc = preprocessor_1.fit_transform(X1_train)
    X1_test_proc = preprocessor_1.transform(X1_test)
    
    ohe_cols = preprocessor_1.named_transformers_['cat'].named_steps['onehot'].get_feature_names_out(categorical_features)
    feature_names_1 = numeric_features + list(ohe_cols)
    
    rf1 = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
    rf1.fit(X1_train_proc, y1_train)
    metrics_report['felt_rested_model']['RandomForest'] = evaluate_regression(y1_test, rf1.predict(X1_test_proc))

    xgb1 = XGBRegressor(n_estimators=100, random_state=42, n_jobs=-1)
    xgb1.fit(X1_train_proc, y1_train)
    metrics_report['felt_rested_model']['XGBoost'] = evaluate_regression(y1_test, xgb1.predict(X1_test_proc))

    joblib.dump(preprocessor_1, os.path.join(models_dir, "preprocessor_felt_rested.joblib"))
    joblib.dump(xgb1, os.path.join(models_dir, "xgboost_felt_rested.joblib"))
    joblib.dump(rf1, os.path.join(models_dir, "rf_felt_rested.joblib"))
    joblib.dump(feature_names_1, os.path.join(models_dir, "features_felt_rested.joblib"))

    # ==========================================
    # TARGET 2: cognitive_performance_score
    # ==========================================
    target_2 = 'cognitive_performance_score'
    X2 = df.drop(columns=[target_2])
    y2 = df[target_2]

    X2_train, X2_test, y2_train, y2_test = train_test_split(X2, y2, test_size=0.2, random_state=42)
    
    num_feat_2 = numeric_features + ['felt_rested']
    preprocessor_2 = ColumnTransformer(
        transformers=[
            ('num', Pipeline(steps=[('imputer', SimpleImputer(strategy='median'))]), num_feat_2),
            ('cat', categorical_transformer, categorical_features)
        ])

    X2_train_proc = preprocessor_2.fit_transform(X2_train)
    X2_test_proc = preprocessor_2.transform(X2_test)
    
    ohe_cols_2 = preprocessor_2.named_transformers_['cat'].named_steps['onehot'].get_feature_names_out(categorical_features)
    feature_names_2 = num_feat_2 + list(ohe_cols_2)

    rf2 = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
    rf2.fit(X2_train_proc, y2_train)
    metrics_report['cognitive_performance_model']['RandomForest'] = evaluate_regression(y2_test, rf2.predict(X2_test_proc))

    xgb2 = XGBRegressor(n_estimators=100, random_state=42, n_jobs=-1)
    xgb2.fit(X2_train_proc, y2_train)
    metrics_report['cognitive_performance_model']['XGBoost'] = evaluate_regression(y2_test, xgb2.predict(X2_test_proc))

    joblib.dump(preprocessor_2, os.path.join(models_dir, "preprocessor_cognitive.joblib"))
    joblib.dump(xgb2, os.path.join(models_dir, "xgboost_cognitive.joblib"))
    joblib.dump(rf2, os.path.join(models_dir, "rf_cognitive.joblib"))
    joblib.dump(feature_names_2, os.path.join(models_dir, "features_cognitive.joblib"))

    # Save meta information
    meta = {
        "samples_train": len(X1_train),
        "samples_test": len(X1_test),
        "feature_count_target1": len(feature_names_1),
        "feature_count_target2": len(feature_names_2),
        "feature_names_target1": feature_names_1,
        "feature_names_target2": feature_names_2
    }
    with open(os.path.join(reports_dir, "meta.json"), "w") as f:
        json.dump(meta, f, indent=4)
        
    with open(os.path.join(reports_dir, "metrics.json"), "w") as f:
        json.dump(metrics_report, f, indent=4)
        
    print("Training without data leakage completed.")
train_and_evaluate()

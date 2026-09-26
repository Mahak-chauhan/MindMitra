import os
import joblib
import pandas as pd
import numpy as np
import shap

class MindMitraExplainer:
    def __init__(self, models_dir):
        self.models_dir = models_dir
        
        # Load models and preprocessing for Target 1
        self.prep_1 = joblib.load(os.path.join(models_dir, 'preprocessor_felt_rested.joblib'))
        self.model_1 = joblib.load(os.path.join(models_dir, 'xgboost_felt_rested.joblib'))
        self.feat_1 = joblib.load(os.path.join(models_dir, 'features_felt_rested.joblib'))
        self.explainer_1 = shap.TreeExplainer(self.model_1)

        # Load models and preprocessing for Target 2
        self.prep_2 = joblib.load(os.path.join(models_dir, 'preprocessor_cognitive.joblib'))
        self.model_2 = joblib.load(os.path.join(models_dir, 'xgboost_cognitive.joblib'))
        self.feat_2 = joblib.load(os.path.join(models_dir, 'features_cognitive.joblib'))
        self.explainer_2 = shap.TreeExplainer(self.model_2)

    def explain_local(self, X_raw: pd.DataFrame, target='felt_rested'):
        """
        Generates local SHAP explanations for individual predictions.
        Data is formatted cleanly for frontend consumption without exposing internal model objects.
        """
        if target == 'felt_rested':
            preprocessor, explainer, model, feature_names = self.prep_1, self.explainer_1, self.model_1, self.feat_1
        else:
            preprocessor, explainer, model, feature_names = self.prep_2, self.explainer_2, self.model_2, self.feat_2

        # Apply same transformations used during training
        X_proc = preprocessor.transform(X_raw)
        
        # Generate SHAP values
        shap_values = explainer.shap_values(X_proc)

        explanations = []
        for i in range(X_proc.shape[0]):
            sample_shap = shap_values[i]
            base_value = explainer.expected_value
            if isinstance(base_value, np.ndarray):
                base_value = base_value[0]
            
            contributions = []
            for j, feat_name in enumerate(feature_names):
                contribution = float(sample_shap[j])
                direction = "positive" if contribution > 0 else "negative"
                contributions.append({
                    "feature": feat_name,
                    "transformed_value": float(X_proc[i, j]),
                    "contribution": contribution,
                    "direction": direction
                })
            
            # Rank contributions by absolute magnitude
            contributions.sort(key=lambda x: abs(x['contribution']), reverse=True)
            
            explanations.append({
                "target": target,
                "base_value": float(base_value),
                "prediction": float(base_value + sum(sample_shap)),
                "ranked_contributions": contributions
            })
        
        return explanations

    def explain_global(self, X_raw: pd.DataFrame, target='felt_rested'):
        """
        Generates global feature importance based on mean absolute SHAP values.
        """
        if target == 'felt_rested':
            preprocessor, explainer, feature_names = self.prep_1, self.explainer_1, self.feat_1
        else:
            preprocessor, explainer, feature_names = self.prep_2, self.explainer_2, self.feat_2

        X_proc = preprocessor.transform(X_raw)
        shap_values = explainer.shap_values(X_proc)

        # Calculate Mean Absolute SHAP across all samples
        mean_abs_shap = np.abs(shap_values).mean(axis=0)
        
        global_imp = []
        for j, feat_name in enumerate(feature_names):
            if mean_abs_shap[j] > 0.01:
                global_imp.append({
                    "feature": feat_name,
                    "mean_abs_contribution": float(mean_abs_shap[j])
                })
        
        global_imp.sort(key=lambda x: x['mean_abs_contribution'], reverse=True)
        return global_imp

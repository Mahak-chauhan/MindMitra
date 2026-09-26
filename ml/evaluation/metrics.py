from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix,
    mean_absolute_error, mean_squared_error, r2_score
)
import numpy as np

def evaluate_classification(y_true, y_pred, y_prob=None):
    """Evaluates classification models."""
    metrics = {
        'accuracy': accuracy_score(y_true, y_pred),
        'precision': precision_score(y_true, y_pred, average='weighted'),
        'recall': recall_score(y_true, y_pred, average='weighted'),
        'f1_score': f1_score(y_true, y_pred, average='weighted')
    }
    
    if y_prob is not None:
        try:
            # Handle multi-class ROC AUC
            if len(np.unique(y_true)) > 2:
                metrics['roc_auc'] = roc_auc_score(y_true, y_prob, multi_class='ovr')
            else:
                metrics['roc_auc'] = roc_auc_score(y_true, y_prob[:, 1])
        except Exception as e:
            metrics['roc_auc'] = None
            
    metrics['confusion_matrix'] = confusion_matrix(y_true, y_pred).tolist()
    return metrics

def evaluate_regression(y_true, y_pred):
    """Evaluates regression models."""
    return {
        'mae': mean_absolute_error(y_true, y_pred),
        'rmse': np.sqrt(mean_squared_error(y_true, y_pred)),
        'r2': r2_score(y_true, y_pred)
    }

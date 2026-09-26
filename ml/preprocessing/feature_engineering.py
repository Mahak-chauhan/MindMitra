import pandas as pd
import numpy as np

def encode_categorical(df: pd.DataFrame) -> pd.DataFrame:
    """Encodes categorical variables using One-Hot Encoding or Ordinal Encoding."""
    df_engineered = df.copy()
    
    # Identify categoricals
    cat_cols = df_engineered.select_dtypes(include=['object']).columns.tolist()
    
    # We will use one-hot encoding for nominal categories (e.g. country, occupation)
    df_engineered = pd.get_dummies(df_engineered, columns=cat_cols, drop_first=True)
    
    return df_engineered

def create_lifestyle_features(df: pd.DataFrame) -> pd.DataFrame:
    """Creates combined lifestyle and wellness features."""
    df_engineered = df.copy()
    
    # Total screen time
    if 'screen_time_hours' in df_engineered.columns and 'night_screen_time_minutes' in df_engineered.columns:
        df_engineered['total_screen_time_hours'] = df_engineered['screen_time_hours'] + (df_engineered['night_screen_time_minutes'] / 60.0)
        
    # Activity to sedentary ratio proxy
    if 'physical_activity_minutes' in df_engineered.columns and 'work_hours_per_day' in df_engineered.columns:
        # Avoid division by zero
        df_engineered['activity_work_ratio'] = df_engineered['physical_activity_minutes'] / (df_engineered['work_hours_per_day'] * 60 + 1)
        
    return df_engineered

def engineering_pipeline(df: pd.DataFrame) -> pd.DataFrame:
    """Executes the full feature engineering pipeline."""
    df = create_lifestyle_features(df)
    df = encode_categorical(df)
    
    # Drop irrelevant features for prediction like user_id
    if 'user_id' in df.columns:
        df = df.drop(columns=['user_id'])
        
    return df

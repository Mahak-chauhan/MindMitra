import pandas as pd
import numpy as np
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def load_data(filepath: str) -> pd.DataFrame:
    """Loads the dataset from the given filepath."""
    logger.info(f"Loading data from {filepath}...")
    return pd.read_csv(filepath)

def handle_missing_values(df: pd.DataFrame) -> pd.DataFrame:
    """Imputes or drops missing values based on feature significance."""
    df_clean = df.copy()
    
    # Example: Impute numerical columns with median
    if 'work_hours_per_day' in df_clean.columns:
        median_work = df_clean['work_hours_per_day'].median()
        df_clean['work_hours_per_day'] = df_clean['work_hours_per_day'].fillna(median_work)
        
    if 'heart_rate_variability' in df_clean.columns:
        median_hrv = df_clean['heart_rate_variability'].median()
        df_clean['heart_rate_variability'] = df_clean['heart_rate_variability'].fillna(median_hrv)
        
    # Drop rows where target variables are missing (if any)
    targets = ['felt_rested', 'cognitive_performance_score']
    for t in targets:
        if t in df_clean.columns:
            df_clean = df_clean.dropna(subset=[t])
            
    logger.info("Missing values handled.")
    return df_clean

def remove_duplicates(df: pd.DataFrame) -> pd.DataFrame:
    """Removes duplicate rows if any exist."""
    initial_shape = df.shape
    df = df.drop_duplicates()
    if df.shape != initial_shape:
        logger.info(f"Dropped {initial_shape[0] - df.shape[0]} duplicate rows.")
    return df

def clean_pipeline(filepath: str) -> pd.DataFrame:
    """Full data cleaning pipeline execution."""
    df = load_data(filepath)
    df = remove_duplicates(df)
    df = handle_missing_values(df)
    return df

if __name__ == "__main__":
    df_clean = clean_pipeline("../data/sleep_health_dataset.csv")
    print(f"Cleaned dataset shape: {df_clean.shape}")

"""
Geo-Spatial & Regional Payments Analytics Engine
TransOrg AgentIQ Datathon - Track 1 (FinTech & BFSI)

Aggregates state and city level UPI telemetry across India:
  - State-level transaction volume, dispute ratios, and failure rates.
  - City-level risk density and regional KYC completion rates.
  - Geo-spatial risk profiling for RBI / NPCI regional monitoring.
"""

from typing import Any, Dict, List, Tuple
import numpy as np
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go


# Indian State Coordinates Mapping for Geo-Visualizations
INDIAN_STATE_COORDS = {
    'Maharashtra': (19.7515, 75.7139),
    'Delhi': (28.7041, 77.1025),
    'Karnataka': (15.3173, 75.7139),
    'Tamil Nadu': (11.1271, 78.6569),
    'West Bengal': (22.9868, 87.8550),
    'Gujarat': (22.2587, 71.1924),
    'Telangana': (18.1124, 79.0193),
    'Uttar Pradesh': (26.8467, 80.9462),
    'Rajasthan': (27.0238, 74.2179),
    'Kerala': (10.8505, 76.2711),
    'Madhya Pradesh': (22.9734, 78.6569),
    'Punjab': (31.1471, 75.3412),
    'Haryana': (29.0588, 76.0856),
    'Bihar': (25.0961, 85.3131),
    'Odisha': (20.9517, 85.0985),
    'Andhra Pradesh': (15.9129, 79.7400)
}


def compute_state_telemetry(df_tx: pd.DataFrame, df_kyc: pd.DataFrame, df_cb: pd.DataFrame) -> pd.DataFrame:
    """
    Computes state-level payments volume, dispute rates, and KYC completion rates.
    """
    # Merge transactions with customer states
    tx_cust = df_tx.merge(df_kyc[['user_id', 'state_clean', 'city_clean', 'kyc_status_clean']], on='user_id', how='left')
    
    state_tx = tx_cust.groupby('state_clean').agg(
        tx_count=('txn_id', 'count'),
        total_volume=('amount_clean', 'sum'),
        avg_amount=('amount_clean', 'mean'),
        failed_count=('status_clean', lambda s: (s == 'FAILED').sum())
    ).reset_index()
    
    # State chargebacks
    cb_cust = df_cb.merge(df_kyc[['user_id', 'state_clean']], on='user_id', how='left')
    state_cb = cb_cust.groupby('state_clean').agg(
        cb_count=('complaint_id', 'count'),
        disputed_amount=('disputed_amount_clean', 'sum')
    ).reset_index()
    
    # State KYC
    state_kyc = df_kyc.groupby('state_clean').agg(
        total_users=('user_id', 'count'),
        verified_users=('kyc_status_clean', lambda s: (s == 'VERIFIED').sum())
    ).reset_index()
    
    merged = state_tx.merge(state_cb, on='state_clean', how='left').merge(state_kyc, on='state_clean', how='left').fillna(0)
    
    merged['failure_rate_pct'] = np.where(merged['tx_count'] > 0, (merged['failed_count'] / merged['tx_count']) * 100, 0.0)
    merged['cb_ratio_pct'] = np.where(merged['tx_count'] > 0, (merged['cb_count'] / merged['tx_count']) * 100, 0.0)
    merged['kyc_completion_pct'] = np.where(merged['total_users'] > 0, (merged['verified_users'] / merged['total_users']) * 100, 0.0)
    
    # Add coordinates
    latitudes = []
    longitudes = []
    for s in merged['state_clean']:
        coords = INDIAN_STATE_COORDS.get(s, (20.5937, 78.9629)) # Default India centroid
        latitudes.append(coords[0])
        longitudes.append(coords[1])
        
    merged['lat'] = latitudes
    merged['lon'] = longitudes
    
    return merged.sort_values(by='total_volume', ascending=False)


def compute_city_telemetry(df_tx: pd.DataFrame, df_kyc: pd.DataFrame, df_cb: pd.DataFrame) -> pd.DataFrame:
    """
    Computes top city level risk rankings.
    """
    tx_cust = df_tx.merge(df_kyc[['user_id', 'city_clean', 'state_clean']], on='user_id', how='left')
    
    city_tx = tx_cust.groupby(['city_clean', 'state_clean']).agg(
        tx_count=('txn_id', 'count'),
        total_volume=('amount_clean', 'sum'),
        failed_count=('status_clean', lambda s: (s == 'FAILED').sum())
    ).reset_index()
    
    cb_cust = df_cb.merge(df_kyc[['user_id', 'city_clean']], on='user_id', how='left')
    city_cb = cb_cust.groupby('city_clean').agg(
        cb_count=('complaint_id', 'count'),
        disputed_amount=('disputed_amount_clean', 'sum')
    ).reset_index()
    
    merged = city_tx.merge(city_cb, on='city_clean', how='left').fillna(0)
    merged['cb_ratio_pct'] = np.where(merged['tx_count'] > 0, (merged['cb_count'] / merged['tx_count']) * 100, 0.0)
    merged['failure_rate_pct'] = np.where(merged['tx_count'] > 0, (merged['failed_count'] / merged['tx_count']) * 100, 0.0)
    
    return merged.sort_values(by='total_volume', ascending=False)

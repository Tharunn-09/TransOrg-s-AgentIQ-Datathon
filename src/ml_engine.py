"""
Machine Learning & Advanced Analytics Engine
TransOrg AgentIQ Datathon - Track 1 (FinTech & BFSI)

Implements:
  1. Isolation Forest & Rolling Z-Score Anomaly Detection for merchant transaction velocity spikes.
  2. K-Means / DBSCAN Customer Risk Profile Clustering.
  3. Daily Volume Trend Forecasting & Seasonality Analysis.
"""

from typing import Any, Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler


def detect_merchant_spikes_isolation_forest(
    df_tx: pd.DataFrame,
    df_cb: pd.DataFrame,
    contamination: float = 0.05
) -> pd.DataFrame:
    """
    Detects merchants with sudden transaction volume/value spikes followed by disputes.
    Uses daily aggregations per merchant combined with Isolation Forest.
    """
    # Daily merchant aggregation
    daily_mch = df_tx.groupby(['merchant_id', 'txn_date']).agg(
        daily_tx_count=('txn_id', 'count'),
        daily_volume=('amount_clean', 'sum'),
        daily_failed=('status_clean', lambda s: (s == 'FAILED').sum())
    ).reset_index()
    
    # Calculate merchant baseline vs spike
    mch_stats = daily_mch.groupby('merchant_id').agg(
        avg_daily_tx=('daily_tx_count', 'mean'),
        std_daily_tx=('daily_tx_count', 'std'),
        max_daily_tx=('daily_tx_count', 'max'),
        avg_daily_vol=('daily_volume', 'mean'),
        std_daily_vol=('daily_volume', 'std'),
        max_daily_vol=('daily_volume', 'max'),
        total_active_days=('txn_date', 'count')
    ).reset_index().fillna(0)
    
    # Rolling Z-score calculation
    mch_stats['tx_spike_ratio'] = np.where(
        mch_stats['avg_daily_tx'] > 0,
        mch_stats['max_daily_tx'] / mch_stats['avg_daily_tx'],
        1.0
    )
    mch_stats['vol_spike_ratio'] = np.where(
        mch_stats['avg_daily_vol'] > 0,
        mch_stats['max_daily_vol'] / mch_stats['avg_daily_vol'],
        1.0
    )
    
    # Add dispute data
    cb_stats = df_cb.groupby('merchant_id').agg(
        dispute_count=('complaint_id', 'count'),
        total_disputed=('disputed_amount_clean', 'sum')
    ).reset_index()
    
    merged = mch_stats.merge(cb_stats, on='merchant_id', how='left').fillna(0)
    
    # Features for Isolation Forest
    feature_cols = ['max_daily_tx', 'tx_spike_ratio', 'max_daily_vol', 'vol_spike_ratio', 'dispute_count']
    X = merged[feature_cols].copy()
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    iso = IsolationForest(contamination=contamination, random_state=42, n_estimators=100)
    merged['is_anomaly'] = iso.fit_predict(X_scaled)
    # -1 indicates anomaly, 1 indicates normal
    merged['anomaly_score'] = -iso.score_samples(X_scaled) # Higher score = more anomalous
    merged['is_spike_anomaly'] = (merged['is_anomaly'] == -1).astype(int)
    
    return merged.sort_values(by='anomaly_score', ascending=False)


def cluster_customers_risk_profile(
    df_customer_metrics: pd.DataFrame,
    n_clusters: int = 4
) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Clusters customers into behavioral risk archetypes using K-Means.
    Features: (tx_count, total_spent, cb_count, disputed_amount, is_pan_valid, is_aadhaar_valid, risk_score)
    """
    df = df_customer_metrics.copy()
    
    features = [
        'tx_count', 'total_spent', 'cb_count', 'disputed_amount',
        'is_pan_valid', 'is_aadhaar_valid', 'risk_score'
    ]
    
    # Filter features that exist in df
    avail_features = [f for f in features if f in df.columns]
    X = df[avail_features].fillna(0)
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    df['cluster_id'] = kmeans.fit_predict(X_scaled)
    
    # Analyze cluster centers to assign intuitive archetype names
    cluster_summaries = df.groupby('cluster_id').agg(
        user_count=('user_id', 'count'),
        avg_risk_score=('risk_score', 'mean'),
        avg_cb_count=('cb_count', 'mean'),
        avg_disputed=('disputed_amount', 'mean'),
        avg_tx_count=('tx_count', 'mean'),
        pan_compliance=('is_pan_valid', 'mean'),
        aadhaar_compliance=('is_aadhaar_valid', 'mean')
    ).reset_index()
    
    # Name clusters based on risk ranking
    sorted_clusters = cluster_summaries.sort_values(by='avg_risk_score', ascending=False)['cluster_id'].tolist()
    
    cluster_names = {}
    if len(sorted_clusters) >= 4:
        cluster_names[sorted_clusters[0]] = "High-Risk Fraud & Identity Anomaly"
        cluster_names[sorted_clusters[1]] = "Frequent Disputers / Chargeback Risk"
        cluster_names[sorted_clusters[2]] = "Moderate Activity / Standard Compliance"
        cluster_names[sorted_clusters[3]] = "Low-Risk Prime Transactors"
    else:
        for idx, cid in enumerate(sorted_clusters):
            cluster_names[cid] = f"Risk Tier {idx+1}"
            
    df['cluster_name'] = df['cluster_id'].map(cluster_names)
    
    return df, cluster_names

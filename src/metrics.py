"""
Business Metrics & Fraud Risk Calculation Engine
TransOrg AgentIQ Datathon - Track 1 (FinTech & BFSI)

Implements exact mathematical formulas for all expected business metrics,
dispute ratios, risk scores, and data-quality compliance checks.
Optimized with vectorized pandas operations for lightning-fast execution.
"""

from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd


def compute_executive_kpis(df_tx: pd.DataFrame, df_kyc: pd.DataFrame, df_merchants: pd.DataFrame, df_cb: pd.DataFrame) -> Dict[str, Any]:
    """
    Computes top-level executive metrics.
    """
    total_txns = len(df_tx)
    total_amount = float(df_tx['amount_clean'].sum())
    avg_txn_value = float(df_tx['amount_clean'].mean()) if total_txns > 0 else 0.0
    
    success_count = int((df_tx['status_clean'] == 'SUCCESS').sum())
    failed_count = int((df_tx['status_clean'] == 'FAILED').sum())
    pending_count = int((df_tx['status_clean'] == 'PENDING').sum())
    
    success_rate = (success_count / total_txns * 100) if total_txns > 0 else 0.0
    failed_rate = (failed_count / total_txns * 100) if total_txns > 0 else 0.0
    pending_rate = (pending_count / total_txns * 100) if total_txns > 0 else 0.0
    
    total_cb_count = len(df_cb)
    total_disputed_amount = float(df_cb['disputed_amount_clean'].sum())
    
    # Chargeback to transaction ratio = (Total disputes / Total transactions) * 100
    cb_to_txn_ratio = (total_cb_count / total_txns * 100) if total_txns > 0 else 0.0
    cb_to_volume_ratio = (total_disputed_amount / total_amount * 100) if total_amount > 0 else 0.0
    
    # KYC KPIs
    total_users = len(df_kyc)
    verified_users = int((df_kyc['kyc_status_clean'] == 'VERIFIED').sum())
    rejected_users = int((df_kyc['kyc_status_clean'] == 'REJECTED').sum())
    pending_users = int((df_kyc['kyc_status_clean'] == 'PENDING').sum())
    
    kyc_completion_rate = (verified_users / total_users * 100) if total_users > 0 else 0.0
    kyc_rejection_rate = (rejected_users / total_users * 100) if total_users > 0 else 0.0
    
    # Dispute Delays
    valid_delays = df_cb[df_cb['reporting_delay_days'] >= 0]['reporting_delay_days']
    avg_reporting_delay = float(valid_delays.mean()) if not valid_delays.empty else 0.0
    long_delay_count = int((df_cb['is_long_delay'] == 1).sum())
    
    # Missing UTR
    invalid_utr_txns = int((df_tx['is_utr_valid'] == 0).sum())
    invalid_utr_rate = (invalid_utr_txns / total_txns * 100) if total_txns > 0 else 0.0
    
    return {
        'total_transactions': total_txns,
        'total_amount': round(total_amount, 2),
        'avg_transaction_value': round(avg_txn_value, 2),
        'success_rate': round(success_rate, 2),
        'failed_rate': round(failed_rate, 2),
        'pending_rate': round(pending_rate, 2),
        'chargeback_count': total_cb_count,
        'disputed_amount': round(total_disputed_amount, 2),
        'chargeback_to_txn_ratio': round(cb_to_txn_ratio, 2),
        'chargeback_to_volume_ratio': round(cb_to_volume_ratio, 2),
        'total_users': total_users,
        'kyc_completion_rate': round(kyc_completion_rate, 2),
        'kyc_rejection_rate': round(kyc_rejection_rate, 2),
        'avg_reporting_delay_days': round(avg_reporting_delay, 2),
        'long_delay_count': long_delay_count,
        'invalid_utr_txns': invalid_utr_txns,
        'invalid_utr_rate': round(invalid_utr_rate, 2)
    }


def compute_merchant_risk_scores(df_merchants: pd.DataFrame, df_tx: pd.DataFrame, df_cb: pd.DataFrame) -> pd.DataFrame:
    """
    Computes a multi-dimensional risk score for each merchant (0 to 100).
    Formula:
      - 35% Chargeback-to-Transaction Ratio (normalized)
      - 25% Disputed Amount Ratio (normalized)
      - 20% Missing Settlement Account / Inactive Flag
      - 20% Volume / Ticket Size Discrepancy
    """
    # Vectorized flags
    tx_temp = df_tx[['merchant_id', 'txn_id', 'amount_clean', 'status_clean']].copy()
    tx_temp['is_failed'] = (tx_temp['status_clean'] == 'FAILED').astype(int)
    
    tx_grp = tx_temp.groupby('merchant_id').agg(
        tx_count=('txn_id', 'count'),
        total_volume=('amount_clean', 'sum'),
        avg_amount=('amount_clean', 'mean'),
        failed_txns=('is_failed', 'sum')
    ).reset_index()
    
    cb_temp = df_cb[['merchant_id', 'complaint_id', 'disputed_amount_clean', 'reason_code_clean', 'severity_clean']].copy()
    cb_temp['is_fraud'] = (cb_temp['reason_code_clean'] == 'FRAUD_ATO').astype(int)
    cb_temp['is_critical'] = (cb_temp['severity_clean'] == 'CRITICAL').astype(int)
    
    cb_grp = cb_temp.groupby('merchant_id').agg(
        cb_count=('complaint_id', 'count'),
        disputed_volume=('disputed_amount_clean', 'sum'),
        fraud_cb_count=('is_fraud', 'sum'),
        critical_cb_count=('is_critical', 'sum')
    ).reset_index()
    
    # Merge with merchant master
    merged = df_merchants.merge(tx_grp, on='merchant_id', how='left').merge(cb_grp, on='merchant_id', how='left')
    merged['tx_count'] = merged['tx_count'].fillna(0)
    merged['total_volume'] = merged['total_volume'].fillna(0.0)
    merged['avg_amount'] = merged['avg_amount'].fillna(0.0)
    merged['cb_count'] = merged['cb_count'].fillna(0)
    merged['disputed_volume'] = merged['disputed_volume'].fillna(0.0)
    merged['fraud_cb_count'] = merged['fraud_cb_count'].fillna(0)
    merged['critical_cb_count'] = merged['critical_cb_count'].fillna(0)
    
    # Calculate ratios
    merged['cb_ratio_pct'] = np.where(merged['tx_count'] > 0, (merged['cb_count'] / merged['tx_count']) * 100, 0.0)
    merged['dispute_vol_ratio_pct'] = np.where(merged['total_volume'] > 0, (merged['disputed_volume'] / merged['total_volume']) * 100, 0.0)
    
    # Ticket size discrepancy: actual avg vs declared ticket size
    ticket_diff_pct = np.where(
        merged['declared_avg_ticket_size_clean'] > 0,
        np.abs(merged['avg_amount'] - merged['declared_avg_ticket_size_clean']) / merged['declared_avg_ticket_size_clean'],
        0.5
    )
    
    # Normalizations for scoring (0 to 100)
    norm_cb_ratio = np.clip(merged['cb_ratio_pct'] / 50.0, 0, 1) * 35.0
    norm_vol_ratio = np.clip(merged['dispute_vol_ratio_pct'] / 50.0, 0, 1) * 25.0
    settlement_penalty = (1 - merged['has_settlement_account']) * 15.0 + (merged['merchant_status_clean'] == 'INACTIVE').astype(int) * 5.0
    ticket_penalty = np.clip(ticket_diff_pct, 0, 2.0) / 2.0 * 10.0 + (merged['fraud_cb_count'] > 0).astype(int) * 10.0
    
    merged['risk_score'] = np.round(norm_cb_ratio + norm_vol_ratio + settlement_penalty + ticket_penalty, 1)
    merged['risk_score'] = np.clip(merged['risk_score'], 0, 100)
    
    merged['risk_level'] = pd.cut(
        merged['risk_score'],
        bins=[-1, 30, 60, 80, 100],
        labels=['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
    )
    
    return merged.sort_values(by='risk_score', ascending=False)


def compute_customer_risk_scores(df_kyc: pd.DataFrame, df_tx: pd.DataFrame, df_cb: pd.DataFrame) -> pd.DataFrame:
    """
    Computes risk score for customers (0 to 100).
    Formula:
      - 35% Dispute Frequency & Disputed Amount
      - 25% Invalid PAN / Missing Aadhaar Compliance Flags
      - 25% KYC Status (REJECTED/PENDING) & Declared Risk Segment
      - 15% Failure & Velocity Anomalies
    """
    tx_temp = df_tx[['user_id', 'txn_id', 'amount_clean', 'status_clean', 'is_utr_valid']].copy()
    tx_temp['is_failed'] = (tx_temp['status_clean'] == 'FAILED').astype(int)
    tx_temp['is_missing_utr'] = (tx_temp['is_utr_valid'] == 0).astype(int)
    
    tx_grp = tx_temp.groupby('user_id').agg(
        tx_count=('txn_id', 'count'),
        total_spent=('amount_clean', 'sum'),
        failed_txns=('is_failed', 'sum'),
        missing_utr_txns=('is_missing_utr', 'sum')
    ).reset_index()
    
    cb_temp = df_cb[['user_id', 'complaint_id', 'disputed_amount_clean', 'reason_code_clean', 'severity_clean']].copy()
    cb_temp['is_fraud'] = (cb_temp['reason_code_clean'] == 'FRAUD_ATO').astype(int)
    cb_temp['is_critical'] = (cb_temp['severity_clean'] == 'CRITICAL').astype(int)
    
    cb_grp = cb_temp.groupby('user_id').agg(
        cb_count=('complaint_id', 'count'),
        disputed_amount=('disputed_amount_clean', 'sum'),
        fraud_disputes=('is_fraud', 'sum'),
        critical_disputes=('is_critical', 'sum')
    ).reset_index()
    
    merged = df_kyc.merge(tx_grp, on='user_id', how='left').merge(cb_grp, on='user_id', how='left')
    merged['tx_count'] = merged['tx_count'].fillna(0)
    merged['total_spent'] = merged['total_spent'].fillna(0.0)
    merged['failed_txns'] = merged['failed_txns'].fillna(0)
    merged['missing_utr_txns'] = merged['missing_utr_txns'].fillna(0)
    merged['cb_count'] = merged['cb_count'].fillna(0)
    merged['disputed_amount'] = merged['disputed_amount'].fillna(0.0)
    merged['fraud_disputes'] = merged['fraud_disputes'].fillna(0)
    merged['critical_disputes'] = merged['critical_disputes'].fillna(0)
    
    # Dispute penalty
    dispute_pts = np.clip(merged['cb_count'] * 15.0, 0, 35.0)
    
    # Identity compliance penalty
    id_pts = (1 - merged['is_pan_valid']) * 15.0 + (1 - merged['is_aadhaar_valid']) * 10.0
    
    # KYC status & segment penalty
    kyc_penalties = {'VERIFIED': 0.0, 'PENDING': 10.0, 'REJECTED': 20.0}
    kyc_pts = merged['kyc_status_clean'].map(kyc_penalties).fillna(10.0)
    risk_seg_pts = merged['risk_segment_clean'].map({'LOW': 0.0, 'MEDIUM': 3.0, 'HIGH': 5.0, 'UNKNOWN': 2.0}).fillna(2.0)
    
    # Behavioral penalty
    behav_pts = np.clip(merged['missing_utr_txns'] * 5.0, 0, 15.0)
    
    merged['risk_score'] = np.round(dispute_pts + id_pts + kyc_pts + risk_seg_pts + behav_pts, 1)
    merged['risk_score'] = np.clip(merged['risk_score'], 0, 100)
    
    merged['risk_level'] = pd.cut(
        merged['risk_score'],
        bins=[-1, 30, 60, 80, 100],
        labels=['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
    )
    
    return merged.sort_values(by='risk_score', ascending=False)

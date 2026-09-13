"""
Database & Analytics Layer (SQLite)
TransOrg AgentIQ Datathon - Track 1 (FinTech & BFSI)

Creates relational database schemas, indexes, foreign key relationships,
and optimized analytical SQL views for reporting, KPIs, and fraud detection.
"""

import os
import sqlite3
from typing import Dict, Optional, Tuple
import pandas as pd


DB_PATH = "upi_fraud_analytics.db"


def get_db_connection(db_path: str = DB_PATH) -> sqlite3.Connection:
    """Returns an optimized SQLite connection with foreign keys enabled."""
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.execute("PRAGMA journal_mode = WAL;")
    return conn


def init_database(
    df_tx: pd.DataFrame,
    df_kyc: pd.DataFrame,
    df_merchants: pd.DataFrame,
    df_chargebacks: pd.DataFrame,
    db_path: str = DB_PATH
) -> sqlite3.Connection:
    """
    Initializes SQLite tables, loads cleaned DataFrames, and builds analytical views.
    """
    if os.path.exists(db_path):
        try:
            os.remove(db_path)
        except Exception:
            pass

    conn = get_db_connection(db_path)
    cur = conn.cursor()

    # 1. Create Core Tables
    cur.execute("""
    CREATE TABLE IF NOT EXISTS customers (
        user_id TEXT PRIMARY KEY,
        full_name TEXT,
        pan_clean TEXT,
        is_pan_valid INTEGER,
        aadhaar_clean TEXT,
        is_aadhaar_valid INTEGER,
        dob_clean TEXT,
        age INTEGER,
        city_clean TEXT,
        state_clean TEXT,
        monthly_income_clean REAL,
        is_income_valid INTEGER,
        occupation TEXT,
        signup_timestamp_iso TEXT,
        kyc_status_clean TEXT,
        risk_segment_clean TEXT
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS merchants (
        merchant_id TEXT PRIMARY KEY,
        merchant_name_clean TEXT,
        mcc_clean TEXT,
        merchant_category_clean TEXT,
        business_type TEXT,
        city TEXT,
        state TEXT,
        onboarding_date_clean TEXT,
        settlement_account_clean TEXT,
        has_settlement_account INTEGER,
        merchant_status_clean TEXT,
        declared_avg_ticket_size_clean REAL,
        is_declared_ticket_valid INTEGER
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS transactions (
        txn_id TEXT PRIMARY KEY,
        timestamp_iso TEXT,
        txn_date TEXT,
        txn_hour INTEGER,
        txn_day_of_week TEXT,
        user_id TEXT,
        merchant_id TEXT,
        amount_clean REAL,
        is_amount_valid INTEGER,
        utr TEXT,
        is_utr_valid INTEGER,
        mcc_clean TEXT,
        status_clean TEXT,
        is_duplicate INTEGER
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS chargebacks (
        complaint_id TEXT PRIMARY KEY,
        txn_id TEXT,
        user_id TEXT,
        merchant_id TEXT,
        transaction_timestamp_iso TEXT,
        reported_timestamp_iso TEXT,
        bank_response_timestamp_iso TEXT,
        disputed_amount_clean REAL,
        is_disputed_amount_valid INTEGER,
        reason_code_clean TEXT,
        complaint_text TEXT,
        resolution_status_clean TEXT,
        severity_clean TEXT,
        channel TEXT,
        reporting_delay_days REAL,
        is_impossible_delay INTEGER,
        is_long_delay INTEGER,
        delay_explanation TEXT
    );
    """)

    # 2. Insert Data
    # Prepare subsets matching schema columns
    cust_cols = [
        'user_id', 'full_name', 'pan_clean', 'is_pan_valid', 'aadhaar_clean',
        'is_aadhaar_valid', 'dob_clean', 'age', 'city_clean', 'state_clean',
        'monthly_income_clean', 'is_income_valid', 'occupation',
        'signup_timestamp_iso', 'kyc_status_clean', 'risk_segment_clean'
    ]
    df_kyc[cust_cols].to_sql('customers', conn, if_exists='append', index=False)

    mch_cols = [
        'merchant_id', 'merchant_name_clean', 'mcc_clean', 'merchant_category_clean',
        'business_type', 'city', 'state', 'onboarding_date_clean',
        'settlement_account_clean', 'has_settlement_account', 'merchant_status_clean',
        'declared_avg_ticket_size_clean', 'is_declared_ticket_valid'
    ]
    df_merchants[mch_cols].to_sql('merchants', conn, if_exists='append', index=False)

    tx_cols = [
        'txn_id', 'timestamp_iso', 'txn_date', 'txn_hour', 'txn_day_of_week',
        'user_id', 'merchant_id', 'amount_clean', 'is_amount_valid', 'utr',
        'is_utr_valid', 'mcc_clean', 'status_clean', 'is_duplicate'
    ]
    df_tx[tx_cols].to_sql('transactions', conn, if_exists='append', index=False)

    cb_cols = [
        'complaint_id', 'txn_id', 'user_id', 'merchant_id',
        'transaction_timestamp_iso', 'reported_timestamp_iso', 'bank_response_timestamp_iso',
        'disputed_amount_clean', 'is_disputed_amount_valid', 'reason_code_clean',
        'complaint_text', 'resolution_status_clean', 'severity_clean', 'channel',
        'reporting_delay_days', 'is_impossible_delay', 'is_long_delay', 'delay_explanation'
    ]
    df_chargebacks[cb_cols].to_sql('chargebacks', conn, if_exists='append', index=False)

    # 3. Create High-Performance Indexes
    cur.execute("CREATE INDEX IF NOT EXISTS idx_tx_user ON transactions(user_id);")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_tx_merchant ON transactions(merchant_id);")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_tx_date ON transactions(txn_date);")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_tx_status ON transactions(status_clean);")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_cb_txn ON chargebacks(txn_id);")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_cb_user ON chargebacks(user_id);")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_cb_merchant ON chargebacks(merchant_id);")

    # 4. Create Analytical SQL Views

    # Enriched Transactions View
    cur.execute("""
    CREATE VIEW IF NOT EXISTS v_transactions_enriched AS
    SELECT 
        t.txn_id,
        t.timestamp_iso,
        t.txn_date,
        t.txn_hour,
        t.txn_day_of_week,
        t.user_id,
        t.merchant_id,
        t.amount_clean AS amount,
        t.status_clean AS status,
        t.is_utr_valid,
        m.merchant_name_clean AS merchant_name,
        COALESCE(m.merchant_category_clean, 'Other Services') AS merchant_category,
        m.merchant_status_clean AS merchant_status,
        m.declared_avg_ticket_size_clean AS declared_avg_ticket_size,
        c.full_name AS customer_name,
        c.city_clean AS customer_city,
        c.state_clean AS customer_state,
        c.kyc_status_clean AS customer_kyc_status,
        c.risk_segment_clean AS customer_risk_segment,
        c.is_pan_valid,
        c.is_aadhaar_valid,
        cb.complaint_id,
        cb.disputed_amount_clean AS disputed_amount,
        cb.reason_code_clean AS dispute_reason,
        cb.severity_clean AS dispute_severity,
        cb.resolution_status_clean AS dispute_resolution,
        cb.reporting_delay_days,
        cb.is_long_delay,
        CASE WHEN cb.complaint_id IS NOT NULL THEN 1 ELSE 0 END AS has_chargeback
    FROM transactions t
    LEFT JOIN merchants m ON t.merchant_id = m.merchant_id
    LEFT JOIN customers c ON t.user_id = c.user_id
    LEFT JOIN chargebacks cb ON t.txn_id = cb.txn_id;
    """)

    # Merchant Performance & Risk View
    cur.execute("""
    CREATE VIEW IF NOT EXISTS v_merchant_metrics AS
    SELECT 
        m.merchant_id,
        m.merchant_name_clean AS merchant_name,
        m.merchant_category_clean AS category,
        m.merchant_status_clean AS status,
        m.has_settlement_account,
        m.declared_avg_ticket_size_clean AS declared_ticket_size,
        COUNT(t.txn_id) AS total_txns,
        SUM(CASE WHEN t.status_clean = 'SUCCESS' THEN 1 ELSE 0 END) AS success_txns,
        SUM(CASE WHEN t.status_clean = 'FAILED' THEN 1 ELSE 0 END) AS failed_txns,
        ROUND(COALESCE(SUM(t.amount_clean), 0), 2) AS total_volume,
        ROUND(COALESCE(AVG(t.amount_clean), 0), 2) AS avg_ticket_size,
        COUNT(DISTINCT cb.complaint_id) AS total_chargebacks,
        ROUND(COALESCE(SUM(cb.disputed_amount_clean), 0), 2) AS total_disputed_amount,
        ROUND(
            CAST(COUNT(DISTINCT cb.complaint_id) AS REAL) / 
            NULLIF(COUNT(t.txn_id), 0) * 100, 
            2
        ) AS chargeback_ratio_pct,
        ROUND(
            COALESCE(SUM(cb.disputed_amount_clean), 0) / 
            NULLIF(SUM(t.amount_clean), 0) * 100, 
            2
        ) AS disputed_volume_ratio_pct
    FROM merchants m
    LEFT JOIN transactions t ON m.merchant_id = t.merchant_id
    LEFT JOIN chargebacks cb ON m.merchant_id = cb.merchant_id
    GROUP BY m.merchant_id;
    """)

    # Customer Performance & Risk View
    cur.execute("""
    CREATE VIEW IF NOT EXISTS v_customer_metrics AS
    SELECT 
        c.user_id,
        c.full_name,
        c.kyc_status_clean AS kyc_status,
        c.risk_segment_clean AS risk_segment,
        c.is_pan_valid,
        c.is_aadhaar_valid,
        c.monthly_income_clean AS monthly_income,
        c.city_clean AS city,
        COUNT(t.txn_id) AS total_txns,
        ROUND(COALESCE(SUM(t.amount_clean), 0), 2) AS total_spent,
        ROUND(COALESCE(AVG(t.amount_clean), 0), 2) AS avg_spent,
        COUNT(DISTINCT cb.complaint_id) AS total_chargebacks,
        ROUND(COALESCE(SUM(cb.disputed_amount_clean), 0), 2) AS total_disputed_amount,
        ROUND(
            CAST(COUNT(DISTINCT cb.complaint_id) AS REAL) / 
            NULLIF(COUNT(t.txn_id), 0) * 100, 
            2
        ) AS dispute_ratio_pct
    FROM customers c
    LEFT JOIN transactions t ON c.user_id = t.user_id
    LEFT JOIN chargebacks cb ON c.user_id = cb.user_id
    GROUP BY c.user_id;
    """)

    # Category Performance View
    cur.execute("""
    CREATE VIEW IF NOT EXISTS v_category_performance AS
    SELECT 
        COALESCE(m.merchant_category_clean, 'Other Services') AS category,
        COUNT(t.txn_id) AS total_txns,
        ROUND(COALESCE(SUM(t.amount_clean), 0), 2) AS total_amount,
        ROUND(COALESCE(AVG(t.amount_clean), 0), 2) AS avg_ticket_size,
        COUNT(DISTINCT cb.complaint_id) AS total_chargebacks,
        ROUND(COALESCE(SUM(cb.disputed_amount_clean), 0), 2) AS total_disputed_amount,
        ROUND(
            CAST(COUNT(DISTINCT cb.complaint_id) AS REAL) / 
            NULLIF(COUNT(t.txn_id), 0) * 100, 
            2
        ) AS chargeback_to_txn_ratio_pct,
        ROUND(
            COALESCE(SUM(cb.disputed_amount_clean), 0) / 
            NULLIF(SUM(t.amount_clean), 0) * 100, 
            2
        ) AS disputed_to_volume_ratio_pct
    FROM transactions t
    LEFT JOIN merchants m ON t.merchant_id = m.merchant_id
    LEFT JOIN chargebacks cb ON t.txn_id = cb.txn_id
    GROUP BY COALESCE(m.merchant_category_clean, 'Other Services');
    """)

    # Daily Trend View
    cur.execute("""
    CREATE VIEW IF NOT EXISTS v_daily_trends AS
    SELECT 
        t.txn_date,
        COUNT(t.txn_id) AS total_txns,
        ROUND(COALESCE(SUM(t.amount_clean), 0), 2) AS total_amount,
        SUM(CASE WHEN t.status_clean = 'SUCCESS' THEN 1 ELSE 0 END) AS success_txns,
        SUM(CASE WHEN t.status_clean = 'FAILED' THEN 1 ELSE 0 END) AS failed_txns,
        SUM(CASE WHEN t.status_clean = 'PENDING' THEN 1 ELSE 0 END) AS pending_txns,
        ROUND(
            CAST(SUM(CASE WHEN t.status_clean = 'FAILED' THEN 1 ELSE 0 END) AS REAL) / 
            NULLIF(COUNT(t.txn_id), 0) * 100, 
            2
        ) AS failure_rate_pct,
        COUNT(DISTINCT cb.complaint_id) AS chargeback_count,
        ROUND(COALESCE(SUM(cb.disputed_amount_clean), 0), 2) AS disputed_amount
    FROM transactions t
    LEFT JOIN chargebacks cb ON t.txn_id = cb.txn_id
    WHERE t.txn_date IS NOT NULL
    GROUP BY t.txn_date
    ORDER BY t.txn_date ASC;
    """)

    # State & Regional Performance View
    cur.execute("""
    CREATE VIEW IF NOT EXISTS v_state_metrics AS
    SELECT 
        COALESCE(c.state_clean, 'Unknown') AS state,
        COUNT(t.txn_id) AS total_txns,
        ROUND(COALESCE(SUM(t.amount_clean), 0), 2) AS total_volume,
        ROUND(COALESCE(AVG(t.amount_clean), 0), 2) AS avg_ticket_size,
        SUM(CASE WHEN t.status_clean = 'FAILED' THEN 1 ELSE 0 END) AS failed_txns,
        ROUND(
            CAST(SUM(CASE WHEN t.status_clean = 'FAILED' THEN 1 ELSE 0 END) AS REAL) / 
            NULLIF(COUNT(t.txn_id), 0) * 100, 
            2
        ) AS failure_rate_pct,
        COUNT(DISTINCT cb.complaint_id) AS chargeback_count,
        ROUND(
            CAST(COUNT(DISTINCT cb.complaint_id) AS REAL) / 
            NULLIF(COUNT(t.txn_id), 0) * 100, 
            2
        ) AS chargeback_ratio_pct
    FROM customers c
    JOIN transactions t ON c.user_id = t.user_id
    LEFT JOIN chargebacks cb ON t.txn_id = cb.txn_id
    GROUP BY COALESCE(c.state_clean, 'Unknown')
    ORDER BY total_volume DESC;
    """)

    conn.commit()
    return conn

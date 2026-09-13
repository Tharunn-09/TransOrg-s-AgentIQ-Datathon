"""
End-to-End Data Pipeline & Database Ingestion Runner
TransOrg AgentIQ Datathon - Track 1 (FinTech & BFSI)

Executes data cleaning, canonical normalization, schema creation,
and metrics pre-computation with full audit logging for Gate 1 & 2 evaluation.
"""

import json
import os
import sys
import time
import pandas as pd

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

from src.cleaner import clean_chargebacks, clean_kyc, clean_merchants, clean_transactions
from src.database import get_db_connection, init_database
from src.metrics import compute_customer_risk_scores, compute_executive_kpis, compute_merchant_risk_scores
from src.normalizers import normalize_mcc, normalize_merchant_id, normalize_user_id


def run_pipeline():
    start_time = time.time()
    print("=" * 80)
    print("🚀 STARTING TRANSORG AGENTIQ DATA RESCUE & ETL PIPELINE (TRACK 1)")
    print("=" * 80)

    # 1. Verification of Canonical Normalizer on Diverse ID Variations
    print("\n[STEP 1/5] Testing Canonical ID Normalization Engine...")
    sample_users = ["USR45826", "usr97580", "USR 45454", "USR-54113", "usr_12345", "45454", 87810, "  USR  19283 "]
    sample_merchants = ["mch2849", "MCH4314", "3835", "MCH-1986", "mch_9999", 7045, " MCH 5031 "]
    
    print("  User ID Normalizations (Before -> After):")
    for u in sample_users:
        print(f"    • Raw: {repr(u):<20} -> Canonical: {normalize_user_id(u)}")
        
    print("\n  Merchant ID Normalizations (Before -> After):")
    for m in sample_merchants:
        print(f"    • Raw: {repr(m):<20} -> Canonical: {normalize_merchant_id(m)}")

    # 2. Loading Raw Files
    print("\n[STEP 2/5] Loading Raw Files...")
    raw_tx_path = "track1_upi_transactions.csv"
    raw_kyc_path = "track1_kyc_records.csv"
    raw_mch_path = "track1_merchants_master.csv"
    raw_cb_path = "track1_chargebacks.json"

    df_tx_raw = pd.read_csv(raw_tx_path)
    df_kyc_raw = pd.read_csv(raw_kyc_path)
    df_mch_raw = pd.read_csv(raw_mch_path)
    with open(raw_cb_path, "r", encoding="utf-8") as f:
        cb_raw_data = json.load(f)

    print(f"  ✓ Transactions Raw Rows : {len(df_tx_raw):,}")
    print(f"  ✓ KYC Records Raw Rows  : {len(df_kyc_raw):,}")
    print(f"  ✓ Merchants Raw Rows    : {len(df_mch_raw):,}")
    print(f"  ✓ Chargebacks Raw Rows  : {len(cb_raw_data):,}")

    # 3. Cleaning & Standardizing Datasets
    print("\n[STEP 3/5] Cleaning & Standardizing (Non-Lossy Strategy)...")
    
    df_tx, tx_stats = clean_transactions(df_tx_raw)
    print(f"  ✓ Transactions Cleaned: {len(df_tx):,} rows | Currency Formats Fixed: {tx_stats['currency_formats_fixed']:,} | Epoch Timestamps Converted: {tx_stats['epoch_timestamps_fixed']:,}")
    print(f"    - Status: {tx_stats['status_distribution']} | Success Rate: {tx_stats['success_rate']}%")

    df_kyc, kyc_stats = clean_kyc(df_kyc_raw)
    print(f"  ✓ KYC Records Cleaned : {len(df_kyc):,} unique users | Invalid PANs Flagged: {kyc_stats['invalid_pan_count']:,} | Invalid Aadhaar Flagged: {kyc_stats['invalid_aadhaar_count']:,}")
    print(f"    - Completion Rate   : {kyc_stats['kyc_completion_rate']}% | Rejection Rate: {kyc_stats['kyc_rejection_rate']}%")

    df_mch, mch_stats = clean_merchants(df_mch_raw)
    print(f"  ✓ Merchants Cleaned   : {len(df_mch):,} unique merchants | Missing Settlement Accounts: {mch_stats['missing_settlement_account_count']:,}")
    print(f"    - Active Merchants  : {mch_stats['active_merchant_count']:,} | Inactive/Suspended: {mch_stats['inactive_merchant_count']:,}")

    df_cb, cb_stats = clean_chargebacks(cb_raw_data)
    print(f"  ✓ Chargebacks Cleaned : {len(df_cb):,} disputes | Disputed Volume: ₹{cb_stats['disputed_amount_total']:,.2f}")
    print(f"    - Avg Report Delay  : {cb_stats['average_reporting_delay_days']} days | Long Delays (>7d): {cb_stats['long_delay_disputes_count']:,}")

    # 4. Ingesting into SQLite Database
    print("\n[STEP 4/5] Initializing SQLite Relational Database & SQL Views...")
    db_path = "upi_fraud_analytics.db"
    conn = init_database(df_tx, df_kyc, df_mch, df_cb, db_path=db_path)
    
    # Check table row counts in DB
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM transactions;")
    db_tx_cnt = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM customers;")
    db_cust_cnt = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM merchants;")
    db_mch_cnt = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM chargebacks;")
    db_cb_cnt = cur.fetchone()[0]

    print(f"  ✓ SQLite Database Created: '{db_path}'")
    print(f"    - Table 'transactions' : {db_tx_cnt:,} rows")
    print(f"    - Table 'customers'    : {db_cust_cnt:,} rows")
    print(f"    - Table 'merchants'    : {db_mch_cnt:,} rows")
    print(f"    - Table 'chargebacks'  : {db_cb_cnt:,} rows")

    # 5. Pre-computing Core KPIs & Risk Scores
    print("\n[STEP 5/5] Computing Portfolio KPIs and Entity Risk Models...")
    kpis = compute_executive_kpis(df_tx, df_kyc, df_mch, df_cb)
    df_mch_risk = compute_merchant_risk_scores(df_mch, df_tx, df_cb)
    df_cust_risk = compute_customer_risk_scores(df_kyc, df_tx, df_cb)

    print("\n" + "=" * 80)
    print("📊 EXECUTIVE PORTFOLIO SUMMARY (DATA RESCUE COMPLETE)")
    print("=" * 80)
    print(f"• Total Processed Volume       : ₹{kpis['total_amount']:,.2f}")
    print(f"• Total Transactions           : {kpis['total_transactions']:,}")
    print(f"• Average Transaction Value    : ₹{kpis['avg_transaction_value']:,.2f}")
    print(f"• Payment Success Rate         : {kpis['success_rate']}%")
    print(f"• Payment Failure Rate         : {kpis['failed_rate']}%")
    print(f"• Total Chargebacks Filed      : {kpis['chargeback_count']:,} (₹{kpis['disputed_amount']:,.2f})")
    print(f"• Chargeback-to-Txn Ratio      : {kpis['chargeback_to_txn_ratio']}%")
    print(f"• KYC Verification Rate        : {kpis['kyc_completion_rate']}%")
    print(f"• Avg Dispute Reporting Delay  : {kpis['avg_reporting_delay_days']} days")
    print(f"• Missing/Invalid UTRs         : {kpis['invalid_utr_txns']:,} ({kpis['invalid_utr_rate']}%)")
    print(f"• High-Risk Merchants (Score>60): {(df_mch_risk['risk_score'] > 60).sum():,}")
    print(f"• High-Risk Users (Score>60)   : {(df_cust_risk['risk_score'] > 60).sum():,}")
    print("=" * 80)
    print(f"✅ Pipeline finished successfully in {time.time() - start_time:.2f} seconds.")
    print("=" * 80)


if __name__ == "__main__":
    run_pipeline()

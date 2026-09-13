"""
Data Cleaning & Rescue Engine
TransOrg AgentIQ Datathon - Track 1 (FinTech & BFSI)

Implements rigorous, non-destructive data cleaning across:
  1. track1_upi_transactions.csv
  2. track1_kyc_records.csv
  3. track1_merchants_master.csv
  4. track1_chargebacks.json

All raw data anomalies are parsed, standardized, and flagged with risk signals.
Detailed before/after metrics and audit statistics are tracked for Gate 1 & Gate 2.
"""

import json
import re
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
from dateutil import parser as date_parser

from src.normalizers import normalize_mcc, normalize_merchant_id, normalize_user_id


class DataCleaningAudit:
    """Tracks cleaning metrics, row counts, anomaly counts, and before/after stats."""
    def __init__(self):
        self.stats = {}

    def record(self, dataset_name: str, metrics: Dict[str, Any]):
        self.stats[dataset_name] = metrics

    def get_summary(self) -> Dict[str, Any]:
        return self.stats


audit_tracker = DataCleaningAudit()


def parse_flexible_timestamp(val: Any) -> Optional[datetime]:
    """
    Parses a wide variety of timestamp representations:
      - Unix epoch integers/floats (e.g. 1770063471)
      - Standard ISO: 2026-01-15 00:11:30
      - Indian/UK format: 25/02/2026 00:53:02
      - US format with 12hr AM/PM: 03-10-2026 09:27:31 PM
      - Date only: 2026/01/28, 09-23-2025, 14-Jan-2023
    """
    if val is None or pd.isna(val):
        return None
    
    s = str(val).strip()
    if not s or s.lower() in ("nan", "none", "null", ""):
        return None
        
    # Check if purely digits (Unix epoch)
    if re.match(r"^\d{9,13}$", s):
        try:
            epoch_num = int(s)
            # If in milliseconds (13 digits), convert to seconds
            if len(s) > 10:
                epoch_num = epoch_num / 1000.0
            return datetime.fromtimestamp(epoch_num)
        except Exception:
            pass

    # Try dateutil parser with dayfirst=False then dayfirst=True fallback
    try:
        # Check if format has DD/MM/YYYY pattern
        if re.search(r"^\d{1,2}/\d{1,2}/\d{4}", s) or re.search(r"^\d{1,2}-\d{1,2}-\d{4}", s):
            # If day > 12 it's definitely dayfirst
            parts = re.split(r"[/ \-:]", s)
            if parts and int(parts[0]) > 12:
                return date_parser.parse(s, dayfirst=True)
        return date_parser.parse(s)
    except Exception:
        try:
            return date_parser.parse(s, dayfirst=True)
        except Exception:
            return None


def clean_currency_amount(val: Any) -> Tuple[Optional[float], bool]:
    """
    Strips currency symbols (Rs., ₹, INR), commas, and whitespace.
    Returns: (cleaned_float_value, is_valid)
    """
    if val is None or pd.isna(val):
        return None, False
        
    s = str(val).strip()
    if not s or s.lower() in ("nan", "none", "null", ""):
        return None, False
        
    # Strip currency words and symbols
    s_clean = re.sub(r"(?i)(rs\.?|inr|₹|,|\$)", "", s).strip()
    
    # Check for multiplier shorthand like '27.3k'
    multiplier = 1.0
    if s_clean.lower().endswith("k"):
        multiplier = 1000.0
        s_clean = s_clean[:-1].strip()
    elif s_clean.lower().endswith("m"):
        multiplier = 1000000.0
        s_clean = s_clean[:-1].strip()
        
    try:
        num = float(s_clean) * multiplier
        if num < 0:
            # Negative amount flagged as invalid ticket / anomaly
            return num, False
        return num, True
    except Exception:
        return None, False


# ==========================================
# 1. TRANSACTIONS CLEANING
# ==========================================

def clean_transactions(df_raw: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Cleans track1_upi_transactions.csv
    Columns: txn_id, timestamp, user_id, merchant_id, amount, utr, mcc, status
    """
    df = df_raw.copy()
    raw_count = len(df)
    
    # 1. Canonical IDs
    df['user_id_raw'] = df['user_id']
    df['merchant_id_raw'] = df['merchant_id']
    df['user_id'] = df['user_id'].apply(normalize_user_id)
    df['merchant_id'] = df['merchant_id'].apply(normalize_merchant_id)
    
    # 2. Amount cleaning
    amount_cleaned = []
    amount_valid = []
    for a in df['amount']:
        val, valid = clean_currency_amount(a)
        amount_cleaned.append(val if val is not None else 0.0)
        amount_valid.append(1 if (valid and val is not None and val > 0) else 0)
    df['amount_clean'] = amount_cleaned
    df['is_amount_valid'] = amount_valid
    
    # 3. Timestamps
    parsed_dates = [parse_flexible_timestamp(t) for t in df['timestamp']]
    df['timestamp_dt'] = parsed_dates
    df['timestamp_iso'] = [d.strftime("%Y-%m-%d %H:%M:%S") if d else None for d in parsed_dates]
    df['txn_date'] = [d.strftime("%Y-%m-%d") if d else None for d in parsed_dates]
    df['txn_hour'] = [d.hour if d else None for d in parsed_dates]
    df['txn_day_of_week'] = [d.strftime("%A") if d else None for d in parsed_dates]
    
    # 4. Status mapping
    status_map = {
        'SUCCESS': 'SUCCESS', 'SUCCESSFUL': 'SUCCESS', 'TXN_SUCCESS': 'SUCCESS',
        'COMPLETED': 'SUCCESS', 'S': 'SUCCESS',
        'FAILED': 'FAILED', 'FAIL': 'FAILED', 'TXN_FAILED': 'FAILED',
        'DECLINED': 'FAILED', 'F': 'FAILED',
        'PENDING': 'PENDING', 'PROCESSING': 'PENDING', 'INITIATED': 'PENDING'
    }
    df['status_raw'] = df['status']
    df['status_clean'] = df['status'].astype(str).str.strip().str.upper().map(status_map).fillna('FAILED')
    
    # 5. MCC normalization
    df['mcc_clean'] = df['mcc'].apply(normalize_mcc)
    
    # 6. UTR validation
    def validate_utr(u: Any) -> int:
        if u is None or pd.isna(u):
            return 0
        s = str(u).strip()
        if not s or s.lower() in ("nan", "none", "null", ""):
            return 0
        if " " in s or len(s) < 10:
            return 0
        return 1
        
    df['is_utr_valid'] = df['utr'].apply(validate_utr)
    
    # 7. Duplicates detection & resolution (per organizer notes: remove duplicate txns to prevent revenue inflation)
    dup_count = int(df.duplicated(subset=['txn_id'], keep='first').sum())
    df['is_duplicate'] = df.duplicated(subset=['txn_id'], keep=False).astype(int)
    df = df.drop_duplicates(subset=['txn_id'], keep='first').copy()
    
    stats = {
        'raw_rows': raw_count,
        'cleaned_rows': len(df),
        'duplicates_removed': dup_count,
        'currency_formats_fixed': (df['amount'].astype(str).str.contains(r"[₹RsINR,]", regex=True)).sum(),
        'epoch_timestamps_fixed': (df['timestamp'].astype(str).str.match(r"^\d{9,13}$")).sum(),
        'invalid_utr_count': (df['is_utr_valid'] == 0).sum(),
        'status_distribution': df['status_clean'].value_counts().to_dict(),
        'success_rate': round((df['status_clean'] == 'SUCCESS').mean() * 100, 2),
        'failed_rate': round((df['status_clean'] == 'FAILED').mean() * 100, 2),
        'pending_rate': round((df['status_clean'] == 'PENDING').mean() * 100, 2)
    }
    audit_tracker.record("transactions", stats)
    return df, stats


# ==========================================
# 2. KYC RECORDS CLEANING
# ==========================================

def clean_kyc(df_raw: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Cleans track1_kyc_records.csv
    Columns: user_id, full_name, pan, aadhaar, date_of_birth, city, state, monthly_income, occupation, signup_timestamp, kyc_status, risk_segment
    """
    df = df_raw.copy()
    raw_count = len(df)
    
    # 1. User ID canonical
    df['user_id_raw'] = df['user_id']
    df['user_id'] = df['user_id'].apply(normalize_user_id)
    
    # 2. PAN validation: real PAN regex ^[A-Z]{5}[0-9]{4}[A-Z]{1}$
    pan_regex = re.compile(r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$")
    def clean_and_check_pan(p: Any) -> Tuple[Optional[str], int]:
        if p is None or pd.isna(p):
            return None, 0
        s = re.sub(r"[\s\-_]+", "", str(p)).upper()
        if pan_regex.match(s):
            return s, 1
        return s if s else None, 0
        
    pan_results = [clean_and_check_pan(p) for p in df['pan']]
    df['pan_clean'] = [r[0] for r in pan_results]
    df['is_pan_valid'] = [r[1] for r in pan_results]
    
    # 3. Aadhaar validation: 12 digits
    def clean_and_check_aadhaar(a: Any) -> Tuple[Optional[str], int]:
        if a is None or pd.isna(a):
            return None, 0
        s = re.sub(r"\D", "", str(a))
        if len(s) == 12:
            return s, 1
        return s if s else None, 0
        
    aadhaar_results = [clean_and_check_aadhaar(a) for a in df['aadhaar']]
    df['aadhaar_clean'] = [r[0] for r in aadhaar_results]
    df['is_aadhaar_valid'] = [r[1] for r in aadhaar_results]
    
    # 4. Monthly income parsing
    income_cleaned = []
    income_valid = []
    for inc in df['monthly_income']:
        val, valid = clean_currency_amount(inc)
        income_cleaned.append(val if val is not None else 0.0)
        income_valid.append(1 if valid and val is not None else 0)
    df['monthly_income_clean'] = income_cleaned
    df['is_income_valid'] = income_valid
    
    # 5. DOB & Age
    dob_parsed = [parse_flexible_timestamp(d) for d in df['date_of_birth']]
    ref_date = datetime(2026, 9, 11)
    df['dob_clean'] = [d.strftime("%Y-%m-%d") if d else None for d in dob_parsed]
    df['age'] = [int((ref_date - d).days / 365.25) if d and d < ref_date else None for d in dob_parsed]
    
    # 6. Signup timestamp
    signup_parsed = [parse_flexible_timestamp(s) for s in df['signup_timestamp']]
    df['signup_timestamp_iso'] = [s.strftime("%Y-%m-%d %H:%M:%S") if s else None for s in signup_parsed]
    
    # 7. KYC Status mapping
    kyc_map = {
        'DONE': 'VERIFIED', 'VERIFIED': 'VERIFIED', 'APPROVED': 'VERIFIED',
        'V': 'VERIFIED', 'KYC_DONE': 'VERIFIED',
        'PENDING': 'PENDING', 'P': 'PENDING', 'UNDER REVIEW': 'PENDING',
        'IN_PROGRESS': 'PENDING',
        'REJECTED': 'REJECTED', 'REJECT': 'REJECTED', 'R': 'REJECTED', 'FAILED': 'REJECTED'
    }
    df['kyc_status_raw'] = df['kyc_status']
    df['kyc_status_clean'] = df['kyc_status'].astype(str).str.strip().str.upper().map(kyc_map).fillna('PENDING')
    
    # 8. Risk Segment
    risk_map = {
        'LOW': 'LOW', 'MEDIUM': 'MEDIUM', 'HIGH': 'HIGH',
        'UNKNOWN': 'UNKNOWN'
    }
    df['risk_segment_raw'] = df['risk_segment']
    df['risk_segment_clean'] = df['risk_segment'].astype(str).str.strip().str.upper().map(risk_map).fillna('UNKNOWN')
    
    # 9. City harmonization
    city_aliases = {
        'BOMBAY': 'Mumbai', 'CALCUTTA': 'Kolkata', 'MADRAS': 'Chennai',
        'BANGALORE': 'Bengaluru', 'POONA': 'Pune', 'BARODA': 'Vadodara'
    }
    def clean_city(c: Any) -> str:
        if c is None or pd.isna(c):
            return "Unknown"
        s = str(c).strip()
        s_upper = s.upper()
        if s_upper in city_aliases:
            return city_aliases[s_upper]
        return s.title()
        
    df['city_clean'] = df['city'].apply(clean_city)
    df['state_clean'] = df['state'].astype(str).str.strip().str.title()
    
    # Deduplicate KYC records keeping the most verified
    df = df.sort_values(by=['kyc_status_clean', 'is_pan_valid'], ascending=[True, False]).drop_duplicates(subset=['user_id'], keep='first')
    
    stats = {
        'raw_rows': raw_count,
        'unique_users': len(df),
        'invalid_pan_count': (df['is_pan_valid'] == 0).sum(),
        'invalid_aadhaar_count': (df['is_aadhaar_valid'] == 0).sum(),
        'kyc_status_distribution': df['kyc_status_clean'].value_counts().to_dict(),
        'risk_segment_distribution': df['risk_segment_clean'].value_counts().to_dict(),
        'kyc_completion_rate': round((df['kyc_status_clean'] == 'VERIFIED').mean() * 100, 2),
        'kyc_rejection_rate': round((df['kyc_status_clean'] == 'REJECTED').mean() * 100, 2)
    }
    audit_tracker.record("kyc_records", stats)
    return df, stats


# ==========================================
# 3. MERCHANTS MASTER CLEANING
# ==========================================

def clean_merchants(df_raw: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Cleans track1_merchants_master.csv
    Columns: merchant_id, merchant_name, mcc, merchant_category, business_type, city, state, onboarding_date, settlement_account, merchant_status, declared_avg_ticket_size
    """
    df = df_raw.copy()
    raw_count = len(df)
    
    # 1. Canonical Merchant ID
    df['merchant_id_raw'] = df['merchant_id']
    df['merchant_id'] = df['merchant_id'].apply(normalize_merchant_id)
    
    # 2. Merchant Name cleaning
    def clean_name(n: Any) -> str:
        if n is None or pd.isna(n):
            return "Unknown Merchant"
        s = str(n).strip()
        # Fix OCR '0' in middle of letters (e.g. Gh0sh -> Ghosh)
        s_fixed = re.sub(r"(?<=[a-zA-Z])0(?=[a-zA-Z])", "o", s)
        return s_fixed
    df['merchant_name_clean'] = df['merchant_name'].apply(clean_name)
    
    # 3. MCC code
    df['mcc_clean'] = df['mcc'].apply(normalize_mcc)
    
    # 4. Harmonize 82 merchant category noisy strings into 9 standard categories
    cat_taxonomy = {
        'grocery': 'Grocery & Supermarkets', 'groceries': 'Grocery & Supermarkets',
        'grocery stores': 'Grocery & Supermarkets', 'grocery_store': 'Grocery & Supermarkets',
        'kirana': 'Grocery & Supermarkets',
        
        'restaurant': 'Restaurants & Dining', 'restaurants': 'Restaurants & Dining',
        'food': 'Restaurants & Dining', 'food_services': 'Restaurants & Dining',
        'eating place': 'Restaurants & Dining',
        
        'retail': 'Retail & Apparel', 'apparel': 'Retail & Apparel',
        'clothing': 'Retail & Apparel', 'cloths': 'Retail & Apparel',
        'garments': 'Retail & Apparel', 'fashion': 'Retail & Apparel',
        'dept_store': 'Retail & Apparel', 'department store': 'Retail & Apparel',
        'department stores': 'Retail & Apparel', 'misc retail': 'Retail & Apparel',
        'retail other': 'Retail & Apparel',
        
        'medical': 'Healthcare & Pharmacy', 'medical_store': 'Healthcare & Pharmacy',
        'pharmacy': 'Healthcare & Pharmacy', 'pharmacies': 'Healthcare & Pharmacy',
        'chemist': 'Healthcare & Pharmacy',
        
        'transport': 'Transport & Travel', 'transportation': 'Transport & Travel',
        'transprt': 'Transport & Travel', 'bus/taxi': 'Transport & Travel',
        'travel': 'Transport & Travel',
        
        'hotel': 'Hotels & Lodging', 'hotels': 'Hotels & Lodging',
        'hotel_lodging': 'Hotels & Lodging', 'hospitality': 'Hotels & Lodging',
        
        'telecom': 'Telecom & Recharges', 'mobile recharge': 'Telecom & Recharges',
        'phone service': 'Telecom & Recharges',
        
        'books': 'Books & Stationery', 'book store': 'Books & Stationery',
        'stationery': 'Books & Stationery', 'books_stationery': 'Books & Stationery',
        
        'other': 'Other Services', 'miscellaneous': 'Other Services'
    }
    
    def harmonize_category(c: Any) -> str:
        if c is None or pd.isna(c):
            return "Other Services"
        s = str(c).strip().lower()
        return cat_taxonomy.get(s, "Other Services")
        
    df['merchant_category_clean'] = df['merchant_category'].apply(harmonize_category)
    
    # 5. Onboarding Date
    onb_dates = [parse_flexible_timestamp(d) for d in df['onboarding_date']]
    df['onboarding_date_clean'] = [d.strftime("%Y-%m-%d") if d else None for d in onb_dates]
    
    # 6. Settlement Account null standardization
    def clean_settlement_account(acc: Any) -> Optional[str]:
        if acc is None or pd.isna(acc):
            return None
        s = str(acc).strip()
        if not s or s.upper() in ("NA", "N/A", "BLANK", "NULL", "NONE", "0"):
            return None
        return s
        
    df['settlement_account_clean'] = df['settlement_account'].apply(clean_settlement_account)
    df['has_settlement_account'] = df['settlement_account_clean'].notna().astype(int)
    
    # 7. Merchant Status mapping
    status_map = {
        'ACTIVE': 'ACTIVE', 'A': 'ACTIVE', 'LIVE': 'ACTIVE', 'ENABLED': 'ACTIVE',
        'INACTIVE': 'INACTIVE', 'I': 'INACTIVE', 'SUSPENDED': 'INACTIVE', 'HOLD': 'INACTIVE',
        'DISABLED': 'INACTIVE', 'CLOSED': 'INACTIVE', 'BLOCKED': 'INACTIVE', 'S': 'INACTIVE'
    }
    df['merchant_status_raw'] = df['merchant_status']
    df['merchant_status_clean'] = df['merchant_status'].astype(str).str.strip().str.upper().map(status_map).fillna('INACTIVE')
    
    # 8. Declared Avg Ticket Size
    ticket_clean = []
    ticket_valid = []
    for t in df['declared_avg_ticket_size']:
        val, valid = clean_currency_amount(t)
        ticket_clean.append(abs(val) if val is not None else 0.0)
        # Note: negative ticket size is explicitly marked as invalid (data entry error)
        ticket_valid.append(1 if (valid and val is not None and val > 0) else 0)
        
    df['declared_avg_ticket_size_clean'] = ticket_clean
    df['is_declared_ticket_valid'] = ticket_valid
    
    # Deduplicate merchants
    df = df.drop_duplicates(subset=['merchant_id'], keep='first')
    
    stats = {
        'raw_rows': raw_count,
        'unique_merchants': len(df),
        'missing_settlement_account_count': (df['has_settlement_account'] == 0).sum(),
        'invalid_ticket_size_count': (df['is_declared_ticket_valid'] == 0).sum(),
        'active_merchant_count': (df['merchant_status_clean'] == 'ACTIVE').sum(),
        'inactive_merchant_count': (df['merchant_status_clean'] == 'INACTIVE').sum(),
        'category_breakdown': df['merchant_category_clean'].value_counts().to_dict()
    }
    audit_tracker.record("merchants_master", stats)
    return df, stats


# ==========================================
# 4. CHARGEBACKS / DISPUTES CLEANING
# ==========================================

def clean_chargebacks(json_data: List[Dict[str, Any]]) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Cleans track1_chargebacks.json
    Fields: complaint_id, txn_id, user_id, merchant_id, transaction_timestamp, reported_timestamp, disputed_amount, reason_code, complaint_text, resolution_status, bank_response_timestamp, severity, channel
    """
    df = pd.DataFrame(json_data)
    raw_count = len(df)
    
    # 1. Canonical IDs
    df['user_id_raw'] = df['user_id']
    df['merchant_id_raw'] = df['merchant_id']
    df['user_id'] = df['user_id'].apply(normalize_user_id)
    df['merchant_id'] = df['merchant_id'].apply(normalize_merchant_id)
    df['txn_id'] = df['txn_id'].astype(str).str.strip().str.upper()
    df['complaint_id'] = df['complaint_id'].astype(str).str.strip().str.upper()
    
    # 2. Disputed Amount
    cb_amount_clean = []
    cb_amount_valid = []
    for a in df['disputed_amount']:
        val, valid = clean_currency_amount(a)
        cb_amount_clean.append(val if val is not None else 0.0)
        cb_amount_valid.append(1 if valid and val is not None and val > 0 else 0)
    df['disputed_amount_clean'] = cb_amount_clean
    df['is_disputed_amount_valid'] = cb_amount_valid
    
    # 3. Reason Code normalization / bucketing
    reason_map = {
        'fraud': 'FRAUD_ATO', 'FRAUD': 'FRAUD_ATO', 'Fraud Suspected': 'FRAUD_ATO',
        'suspicious transaction': 'FRAUD_ATO', 'unauthorized_transaction': 'FRAUD_ATO',
        'Unauthorized Transaction': 'FRAUD_ATO', 'unauth txn': 'FRAUD_ATO',
        'UNAUTHORISED': 'FRAUD_ATO', 'not done by me': 'FRAUD_ATO',
        'login compromised': 'FRAUD_ATO', 'account hacked': 'FRAUD_ATO',
        'ATO': 'FRAUD_ATO', 'Account Takeover': 'FRAUD_ATO', 'scam': 'FRAUD_ATO',
        
        'Merchant Not Delivered': 'NON_DELIVERY', 'not delivered': 'NON_DELIVERY',
        'delivery issue': 'NON_DELIVERY', 'item not received': 'NON_DELIVERY',
        
        'Duplicate Debit': 'DUPLICATE_DEBIT', 'DUP_DEBIT': 'DUPLICATE_DEBIT',
        'double debit': 'DUPLICATE_DEBIT', 'charged twice': 'DUPLICATE_DEBIT',
        
        'Wrong Amount': 'WRONG_AMOUNT', 'extra amount deducted': 'WRONG_AMOUNT',
        'amount mismatch': 'WRONG_AMOUNT', 'incorrect amount': 'WRONG_AMOUNT',
        
        'no service': 'SERVICE_ISSUE', 'merchant service issue': 'SERVICE_ISSUE',
        'service failed': 'SERVICE_ISSUE', 'Service Not Provided': 'SERVICE_ISSUE',
        
        'Customer Dispute': 'CUSTOMER_DISPUTE_OTHER', 'customer issue': 'CUSTOMER_DISPUTE_OTHER',
        'dispute raised': 'CUSTOMER_DISPUTE_OTHER', 'complaint': 'CUSTOMER_DISPUTE_OTHER'
    }
    
    def bucket_reason(r: Any) -> str:
        if r is None or pd.isna(r):
            return "CUSTOMER_DISPUTE_OTHER"
        s = str(r).strip()
        return reason_map.get(s, reason_map.get(s.lower(), "CUSTOMER_DISPUTE_OTHER"))
        
    df['reason_code_raw'] = df['reason_code']
    df['reason_code_clean'] = df['reason_code'].apply(bucket_reason)
    
    # 4. Timestamps & Reporting Delay
    txn_dt = [parse_flexible_timestamp(t) for t in df['transaction_timestamp']]
    rep_dt = [parse_flexible_timestamp(r) for r in df['reported_timestamp']]
    bnk_dt = [parse_flexible_timestamp(b) for b in df['bank_response_timestamp']]
    
    df['transaction_timestamp_iso'] = [t.strftime("%Y-%m-%d %H:%M:%S") if t else None for t in txn_dt]
    df['reported_timestamp_iso'] = [r.strftime("%Y-%m-%d %H:%M:%S") if r else None for r in rep_dt]
    df['bank_response_timestamp_iso'] = [b.strftime("%Y-%m-%d %H:%M:%S") if b else None for b in bnk_dt]
    
    # Derived: reporting delay (days) = reported - transaction
    reporting_delays = []
    is_impossible_delays = []
    is_long_delays = []
    delay_explanations = []
    
    for t, r in zip(txn_dt, rep_dt):
        if t and r:
            delay = (r - t).total_seconds() / 86400.0
            if delay < 0:
                reporting_delays.append(delay)
                is_impossible_delays.append(1)
                is_long_delays.append(0)
                delay_explanations.append("Anomalous timestamp: Dispute logged before transaction timestamp (Data Quality Flag).")
            else:
                reporting_delays.append(round(delay, 2))
                is_impossible_delays.append(0)
                if delay > 7.0:
                    is_long_delays.append(1)
                    delay_explanations.append(f"Reported {int(delay)} days after transaction — may indicate late fraud detection or account takeover, per organizer notes.")
                else:
                    is_long_delays.append(0)
                    delay_explanations.append("Standard reporting window (<7 days).")
        else:
            reporting_delays.append(None)
            is_impossible_delays.append(0)
            is_long_delays.append(0)
            delay_explanations.append("Missing timestamp reference.")
            
    df['reporting_delay_days'] = reporting_delays
    df['is_impossible_delay'] = is_impossible_delays
    df['is_long_delay'] = is_long_delays
    df['delay_explanation'] = delay_explanations
    
    # 5. Severity mapping
    sev_map = {
        'CRITICAL': 'CRITICAL', 'CRIT': 'CRITICAL', 'P1': 'CRITICAL',
        'HIGH': 'HIGH', 'H': 'HIGH', 'P2': 'HIGH',
        'MEDIUM': 'MEDIUM', 'M': 'MEDIUM', 'P3': 'MEDIUM',
        'LOW': 'LOW', 'L': 'LOW', 'P4': 'LOW'
    }
    df['severity_raw'] = df['severity']
    df['severity_clean'] = df['severity'].astype(str).str.strip().str.upper().map(sev_map).fillna('MEDIUM')
    
    # 6. Resolution Status mapping
    res_map = {
        'OPEN': 'OPEN', 'WIP': 'OPEN',
        'IN PROGRESS': 'IN_PROGRESS', 'IN_PROGRESS': 'IN_PROGRESS',
        'PENDING BANK': 'PENDING_BANK', 'PENDING_BANK': 'PENDING_BANK',
        'RESOLVED': 'RESOLVED', 'CLOSED': 'RESOLVED',
        'REJECTED': 'REJECTED'
    }
    df['resolution_status_raw'] = df['resolution_status']
    df['resolution_status_clean'] = df['resolution_status'].astype(str).str.strip().str.upper().map(res_map).fillna('OPEN')
    
    # Deduplicate complaints
    df = df.drop_duplicates(subset=['complaint_id'], keep='first')
    
    # Compute average reporting delay for valid positive delays
    valid_delays = [d for d in reporting_delays if d is not None and d >= 0]
    avg_delay = round(float(np.mean(valid_delays)), 2) if valid_delays else 0.0
    
    stats = {
        'raw_rows': raw_count,
        'unique_disputes': len(df),
        'disputed_amount_total': round(float(df['disputed_amount_clean'].sum()), 2),
        'average_reporting_delay_days': avg_delay,
        'long_delay_disputes_count': sum(is_long_delays),
        'impossible_delay_anomalies_count': sum(is_impossible_delays),
        'reason_distribution': df['reason_code_clean'].value_counts().to_dict(),
        'severity_distribution': df['severity_clean'].value_counts().to_dict(),
        'resolution_distribution': df['resolution_status_clean'].value_counts().to_dict()
    }
    audit_tracker.record("chargebacks", stats)
    return df, stats

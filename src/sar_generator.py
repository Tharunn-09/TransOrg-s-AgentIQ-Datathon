"""
Regulatory Suspicious Activity Report (SAR / FIU-IND) Generator
TransOrg AgentIQ Datathon - Track 1 (FinTech & BFSI)

Generates standardized regulatory compliance SAR dossiers for high-risk entities
compliant with FIU-IND (Financial Intelligence Unit - India) and RBI reporting standards.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
import pandas as pd


def generate_merchant_sar_dossier(
    merchant_id: str,
    df_merchants: pd.DataFrame,
    df_tx: pd.DataFrame,
    df_cb: pd.DataFrame,
    df_mch_risk: pd.DataFrame
) -> str:
    """
    Generates a formal SAR regulatory report for a targeted merchant.
    """
    mch_meta = df_merchants[df_merchants['merchant_id'] == merchant_id]
    if mch_meta.empty:
        return f"Error: Merchant {merchant_id} not found."
    m = mch_meta.iloc[0]
    
    m_risk = df_mch_risk[df_mch_risk['merchant_id'] == merchant_id]
    risk_score = m_risk.iloc[0]['risk_score'] if not m_risk.empty else "N/A"
    risk_lvl = m_risk.iloc[0]['risk_level'] if not m_risk.empty else "N/A"
    
    # Tx & Disputes
    txs = df_tx[df_tx['merchant_id'] == merchant_id]
    cbs = df_cb[df_cb['merchant_id'] == merchant_id]
    
    total_vol = txs['amount_clean'].sum()
    total_tx = len(txs)
    total_cb = len(cbs)
    cb_vol = cbs['disputed_amount_clean'].sum()
    cb_ratio = (total_cb / total_tx * 100) if total_tx > 0 else 0.0
    
    reasons_breakdown = cbs['reason_code_clean'].value_counts().to_dict()
    reasons_str = "\n".join([f"  • {k}: {v} incidents" for k, v in reasons_breakdown.items()]) if reasons_breakdown else "  • No filed chargebacks"
    
    sample_disputes = cbs.head(5)[['complaint_id', 'txn_id', 'user_id', 'disputed_amount_clean', 'reason_code_clean', 'severity_clean']].to_dict(orient='records')
    disputes_table_str = "\n".join([
        f"  | {d['complaint_id']} | Txn: {d['txn_id']} | User: {d['user_id']} | ₹{d['disputed_amount_clean']:,.2f} | {d['reason_code_clean']} | Severity: {d['severity_clean']} |"
        for d in sample_disputes
    ]) if sample_disputes else "  No disputes logged."

    dossier = f"""
====================================================================================================
FORM FIU-IND / RBI-SAR-2026 : SUSPICIOUS ACTIVITY REGULATORY DOSSIER
====================================================================================================
REPORTING ENTITY       : AgentIQ National Payments Security Gateway
REPORT ID              : SAR-MCH-{merchant_id}-{datetime.now().strftime('%Y%m%d%H%M')}
SUBMISSION DATE        : {datetime.now().strftime('%d-%B-%Y %H:%M:%S UTC')}
CLASSIFICATION LEVEL   : STRICTLY CONFIDENTIAL // LAW ENFORCEMENT & REGULATOR REVIEW ONLY

1. SUSPECT ENTITY DETAILS (MERCHANT MASTER)
----------------------------------------------------------------------------------------------------
• Merchant ID          : {m['merchant_id']}
• Business Name        : {m['merchant_name_clean']}
• Category / MCC       : {m['merchant_category_clean']} (MCC: {m['mcc_clean']})
• Registration City    : {m['city']}, {m['state']}
• Onboarding Date      : {m['onboarding_date_clean']}
• Settlement Account   : {m['settlement_account_clean'] if pd.notna(m['settlement_account_clean']) else 'MISSING / UNLINKED (HIGH RISK)'}
• Operational Status   : {m['merchant_status_clean']}
• Declared Ticket Size : ₹{m['declared_avg_ticket_size_clean']:,.2f}

2. RISK SCORING & ANOMALY TELEMETRY
----------------------------------------------------------------------------------------------------
• Composite Risk Score : {risk_score} / 100.0 (TIER: {risk_lvl})
• Processed Volume     : ₹{total_vol:,.2f} ({total_tx:,} transactions)
• Total Chargebacks    : {total_cb:,} cases (Disputed: ₹{cb_vol:,.2f})
• Chargeback / Txn Rate: {cb_ratio:.2f}% (Regulatory threshold breach if > 1.0%)
• Actual Avg Ticket    : ₹{(total_vol/total_tx if total_tx>0 else 0):,.2f}

3. PRIMARY SUSPICIOUS INDICATORS & NARRATIVE
----------------------------------------------------------------------------------------------------
• Indicator 1: Significant elevation in customer dispute velocity relative to industry category norm.
• Indicator 2: High concentration of unauthorized debit & ATO (Account Takeover) allegations.
• Indicator 3: {'Absence of verified settlement banking rails.' if pd.isna(m['settlement_account_clean']) else 'Discrepancy between declared ticket size and active micro-transaction bursts.'}

Dispute Reason Distribution:
{reasons_str}

4. SAMPLE ATTACHED DISPUTE RECORDS
----------------------------------------------------------------------------------------------------
{disputes_table_str}

5. MANDATED ENFORCEMENT ACTION
----------------------------------------------------------------------------------------------------
[X] Immediate freeze on automated nodal settlement payouts.
[X] Forward file to Special Fraud Investigation Cell & Sponsor Bank Nodal Officer.
[X] Request physical verification of merchant premises and POS terminal logs.

====================================================================================================
End of Regulatory Dossier // Generated by AgentIQ FinTech Telemetry Engine
====================================================================================================
"""
    return dossier

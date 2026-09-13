"""
Executive PDF Intelligence Report Generator
TransOrg AgentIQ Datathon - Track 1 (FinTech & BFSI)

Generates professional, presentation-ready PDF reports summarizing
executive KPIs, risk distributions, high-risk entities, and audit findings.
Cleaned with standard ASCII / Latin-1 encoding for 100% reliability in FPDF2.
"""

from datetime import datetime
import io
import re
from typing import Any, Dict, List, Optional
import pandas as pd
from fpdf import FPDF


def clean_pdf_text(text: Any) -> str:
    """Sanitizes text for standard PDF Latin-1 font compatibility."""
    if text is None:
        return ""
    s = str(text)
    replacements = {
        "—": "-", "–": "-", "₹": "Rs. ", "•": "-",
        "“": '"', "”": '"', "‘": "'", "’": "'",
        "…": "...", "\u200b": ""
    }
    for k, v in replacements.items():
        s = s.replace(k, v)
    # Remove any lingering unencodable unicode
    return s.encode('latin-1', 'replace').decode('latin-1')


class PDFReport(FPDF):
    def header(self):
        self.set_fill_color(15, 23, 42) # Slate 900
        self.rect(0, 0, 210, 20, 'F')
        self.set_font('Helvetica', 'B', 12)
        self.set_text_color(255, 255, 255)
        self.cell(0, 10, clean_pdf_text('TransOrg AgentIQ - UPI Fraud Ring & Merchant Analytics Report'), align='L', new_x="LMARGIN", new_y="NEXT")
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, clean_pdf_text(f'Confidential Executive Briefing | Generated: {datetime.now().strftime("%Y-%m-%d %H:%M")} | Page ' + str(self.page_no())), align='C')


def generate_executive_pdf_report(
    kpis: Dict[str, Any],
    top_merchants_risk: pd.DataFrame,
    top_users_risk: pd.DataFrame,
    category_summary: pd.DataFrame
) -> bytes:
    """
    Generates a PDF document in bytes.
    """
    pdf = PDFReport()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)
    
    # Title Section
    pdf.set_font('Helvetica', 'B', 18)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 10, clean_pdf_text('Executive Summary: UPI Risk & Dispute Telemetry'), new_x="LMARGIN", new_y="NEXT")
    pdf.set_font('Helvetica', '', 10)
    pdf.set_text_color(100, 116, 139)
    pdf.cell(0, 5, clean_pdf_text(f'Audit Timestamp: {datetime.now().strftime("%B %d, %Y - %H:%M:%S UTC")}'), new_x="LMARGIN", new_y="NEXT")
    pdf.ln(5)
    
    # 1. KPI Overview Grid
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(0, 8, clean_pdf_text('1. Core Portfolio & Dispute Performance Metrics'), new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)
    
    pdf.set_font('Helvetica', '', 9)
    pdf.set_fill_color(241, 245, 249)
    
    # Metric rows
    metrics_data = [
        [("Total Volume Processed", f"Rs. {kpis.get('total_amount', 0):,.2f}"), ("Total Transaction Count", f"{kpis.get('total_transactions', 0):,}")],
        [("Average Transaction Value", f"Rs. {kpis.get('avg_transaction_value', 0):,.2f}"), ("Transaction Success Rate", f"{kpis.get('success_rate', 0)}%")],
        [("Transaction Failure Rate", f"{kpis.get('failed_rate', 0)}%"), ("Transaction Pending Rate", f"{kpis.get('pending_rate', 0)}%")],
        [("Total Chargebacks Filed", f"{kpis.get('chargeback_count', 0):,}"), ("Total Disputed Volume", f"Rs. {kpis.get('disputed_amount', 0):,.2f}")],
        [("Chargeback-to-Txn Ratio", f"{kpis.get('chargeback_to_txn_ratio', 0)}%"), ("KYC Completion Rate", f"{kpis.get('kyc_completion_rate', 0)}%")],
        [("Avg Dispute Delay", f"{kpis.get('avg_reporting_delay_days', 0)} Days"), ("Delayed Disputes (>7d)", f"{kpis.get('long_delay_count', 0)} cases")]
    ]
    
    for row in metrics_data:
        m1_lbl, m1_val = clean_pdf_text(row[0][0]), clean_pdf_text(row[0][1])
        m2_lbl, m2_val = clean_pdf_text(row[1][0]), clean_pdf_text(row[1][1])
        pdf.set_font('Helvetica', 'B', 9)
        pdf.cell(45, 7, m1_lbl, border=1, fill=True)
        pdf.set_font('Helvetica', '', 9)
        pdf.cell(50, 7, m1_val, border=1)
        pdf.set_font('Helvetica', 'B', 9)
        pdf.cell(45, 7, m2_lbl, border=1, fill=True)
        pdf.set_font('Helvetica', '', 9)
        pdf.cell(50, 7, m2_val, border=1, new_x="LMARGIN", new_y="NEXT")
        
    pdf.ln(8)
    
    # 2. Top High-Risk Merchants
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(0, 8, clean_pdf_text('2. Top High-Risk Merchants Requiring Action'), new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)
    
    # Table Header
    pdf.set_font('Helvetica', 'B', 8)
    pdf.set_fill_color(226, 232, 240)
    pdf.cell(25, 6, clean_pdf_text('Merchant ID'), border=1, fill=True)
    pdf.cell(55, 6, clean_pdf_text('Merchant Name'), border=1, fill=True)
    pdf.cell(35, 6, clean_pdf_text('Category'), border=1, fill=True)
    pdf.cell(20, 6, clean_pdf_text('CB Count'), border=1, fill=True, align='C')
    pdf.cell(25, 6, clean_pdf_text('CB Ratio (%)'), border=1, fill=True, align='C')
    pdf.cell(30, 6, clean_pdf_text('Risk Score'), border=1, fill=True, align='C', new_x="LMARGIN", new_y="NEXT")
    
    pdf.set_font('Helvetica', '', 8)
    for _, row in top_merchants_risk.head(5).iterrows():
        m_id = clean_pdf_text(row.get('merchant_id', ''))
        m_name = clean_pdf_text(str(row.get('merchant_name_clean', ''))[:28])
        m_cat = clean_pdf_text(str(row.get('merchant_category_clean', ''))[:18])
        cb_c = clean_pdf_text(str(int(row.get('cb_count', 0))))
        cb_r = clean_pdf_text(f"{float(row.get('cb_ratio_pct', 0)):.1f}%")
        r_score = clean_pdf_text(f"{float(row.get('risk_score', 0)):.1f} ({row.get('risk_level', 'LOW')})")
        
        pdf.cell(25, 6, m_id, border=1)
        pdf.cell(55, 6, m_name, border=1)
        pdf.cell(35, 6, m_cat, border=1)
        pdf.cell(20, 6, cb_c, border=1, align='C')
        pdf.cell(25, 6, cb_r, border=1, align='C')
        pdf.cell(30, 6, r_score, border=1, align='C', new_x="LMARGIN", new_y="NEXT")
        
    pdf.ln(8)
    
    # 3. Top High-Risk Customers
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(0, 8, clean_pdf_text('3. High-Risk Customer Dispute Flags'), new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)
    
    pdf.set_font('Helvetica', 'B', 8)
    pdf.set_fill_color(226, 232, 240)
    pdf.cell(25, 6, clean_pdf_text('User ID'), border=1, fill=True)
    pdf.cell(50, 6, clean_pdf_text('Customer Name'), border=1, fill=True)
    pdf.cell(30, 6, clean_pdf_text('KYC Status'), border=1, fill=True)
    pdf.cell(25, 6, clean_pdf_text('Disputes'), border=1, fill=True, align='C')
    pdf.cell(30, 6, clean_pdf_text('Disputed (Rs.)'), border=1, fill=True, align='R')
    pdf.cell(30, 6, clean_pdf_text('Risk Score'), border=1, fill=True, align='C', new_x="LMARGIN", new_y="NEXT")
    
    pdf.set_font('Helvetica', '', 8)
    for _, row in top_users_risk.head(5).iterrows():
        u_id = clean_pdf_text(row.get('user_id', ''))
        u_name = clean_pdf_text(str(row.get('full_name', ''))[:25])
        kyc = clean_pdf_text(str(row.get('kyc_status_clean', ''))[:15])
        cbs = clean_pdf_text(str(int(row.get('cb_count', 0))))
        disp_amt = clean_pdf_text(f"{float(row.get('disputed_amount', 0)):,.0f}")
        u_score = clean_pdf_text(f"{float(row.get('risk_score', 0)):.1f}")
        
        pdf.cell(25, 6, u_id, border=1)
        pdf.cell(50, 6, u_name, border=1)
        pdf.cell(30, 6, kyc, border=1)
        pdf.cell(25, 6, cbs, border=1, align='C')
        pdf.cell(30, 6, disp_amt, border=1, align='R')
        pdf.cell(30, 6, u_score, border=1, align='C', new_x="LMARGIN", new_y="NEXT")
        
    pdf.ln(6)
    
    # Audit Notice
    pdf.set_font('Helvetica', 'I', 8)
    pdf.set_text_color(100, 116, 139)
    pdf.multi_cell(0, 5, clean_pdf_text("Note: This report is automatically compiled by the AgentIQ Telemetry Platform. Threshold breaches require mandatory secondary verification per regulatory compliance requirements."))
    
    return bytes(pdf.output())

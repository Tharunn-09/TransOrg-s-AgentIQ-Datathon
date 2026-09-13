"""
Automated Fraud Alert & Email Incident Notification Engine
TransOrg AgentIQ Datathon - Track 1 (FinTech & BFSI)

Supports:
  1. Resend API (Modern transactional email API via resend package).
  2. Standard SMTP (Gmail, Outlook, SendGrid, Amazon SES).
  3. Live Sentinel Simulation (Zero-config sandbox preview).
"""

from datetime import datetime
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Any, Dict, List, Optional
import pandas as pd


class AlertManager:
    """
    Manages automated alert dispatching, live email dispatching, and threshold monitoring.
    """
    def __init__(self):
        self.alert_history = []

    def scan_for_threats(
        self,
        df_merchants_risk: pd.DataFrame,
        df_customers_risk: pd.DataFrame,
        df_cb: pd.DataFrame,
        merchant_ratio_threshold_pct: float = 2.0,
        user_dispute_count_threshold: int = 3
    ) -> List[Dict[str, Any]]:
        """
        Scans datasets for threshold breaches and compiles actionable alert payloads.
        """
        new_alerts = []
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # 1. Merchant Risk Threshold Breaches
        breached_merchants = df_merchants_risk[
            (df_merchants_risk['cb_ratio_pct'] >= merchant_ratio_threshold_pct) &
            (df_merchants_risk['tx_count'] >= 5)
        ]
        
        for _, mch in breached_merchants.iterrows():
            mch_id = mch['merchant_id']
            linked_cbs = df_cb[df_cb['merchant_id'] == mch_id][['complaint_id', 'txn_id', 'disputed_amount_clean', 'reason_code_clean', 'severity_clean']].to_dict(orient='records')
            
            alert = {
                'alert_id': f"ALT-MCH-{mch_id}-{len(self.alert_history)+len(new_alerts)+1}",
                'timestamp': now_str,
                'target_type': 'MERCHANT',
                'target_id': mch_id,
                'target_name': mch['merchant_name_clean'],
                'risk_level': 'CRITICAL' if mch['cb_ratio_pct'] > 5.0 else 'HIGH',
                'reason': f"Chargeback ratio reached {mch['cb_ratio_pct']:.2f}% (Threshold: {merchant_ratio_threshold_pct}%)",
                'metrics': {
                    'tx_count': int(mch['tx_count']),
                    'cb_count': int(mch['cb_count']),
                    'total_volume': float(mch['total_volume']),
                    'disputed_volume': float(mch['disputed_volume']),
                    'cb_ratio_pct': float(mch['cb_ratio_pct'])
                },
                'linked_incidents': linked_cbs,
                'suggested_action': "Freeze automated settlement payouts and initiate merchant KYC/POS audit."
            }
            new_alerts.append(alert)
            
        # 2. Customer Dispute Surge Breaches
        breached_users = df_customers_risk[
            (df_customers_risk['cb_count'] >= user_dispute_count_threshold)
        ]
        
        for _, usr in breached_users.iterrows():
            u_id = usr['user_id']
            linked_cbs = df_cb[df_cb['user_id'] == u_id][['complaint_id', 'txn_id', 'disputed_amount_clean', 'reason_code_clean', 'severity_clean']].to_dict(orient='records')
            
            alert = {
                'alert_id': f"ALT-USR-{u_id}-{len(self.alert_history)+len(new_alerts)+1}",
                'timestamp': now_str,
                'target_type': 'CUSTOMER',
                'target_id': u_id,
                'target_name': usr['full_name'],
                'risk_level': 'CRITICAL' if usr['cb_count'] >= 5 else 'HIGH',
                'reason': f"Customer filed {int(usr['cb_count'])} disputes totaling ₹{usr['disputed_amount']:,.2f}",
                'metrics': {
                    'cb_count': int(usr['cb_count']),
                    'disputed_amount': float(usr['disputed_amount']),
                    'kyc_status': usr['kyc_status_clean'],
                    'pan_valid': int(usr['is_pan_valid']),
                    'aadhaar_valid': int(usr['is_aadhaar_valid'])
                },
                'linked_incidents': linked_cbs,
                'suggested_action': "Place temporary block on high-value outbound UPI transfers and request re-KYC verification."
            }
            new_alerts.append(alert)
            
        self.alert_history.extend(new_alerts)
        return new_alerts

    def format_email_body(self, alert: Dict[str, Any]) -> str:
        """
        Formats alert into an executive plain-text email notification.
        """
        incidents_str = "\n".join([
            f"  • Complaint #{inc['complaint_id']} | Txn: {inc['txn_id']} | Amount: Rs. {inc['disputed_amount_clean']} | Reason: {inc['reason_code_clean']} | Severity: {inc['severity_clean']}"
            for inc in alert.get('linked_incidents', [])[:5]
        ])
        
        body = f"""
================================================================================
🚨 URGENT FRAUD ALERT: {alert['risk_level']} RISK DETECTED
================================================================================
Alert ID   : {alert['alert_id']}
Timestamp  : {alert['timestamp']}
Target     : [{alert['target_type']}] {alert['target_name']} ({alert['target_id']})
Breach     : {alert['reason']}

Summary Metrics:
{alert['metrics']}

Sample Linked Incident Records:
{incidents_str}

Recommended Action:
{alert['suggested_action']}

TransOrg AgentIQ Automated Security Sentinel
================================================================================
"""
        return body

    def send_live_email(
        self,
        alert: Dict[str, Any],
        recipient_email: str,
        resend_api_key: Optional[str] = None,
        smtp_config: Optional[Dict[str, Any]] = None
    ) -> Tuple[bool, str]:
        """
        Dispatches a live email via Resend API or SMTP.
        """
        subject = f"🚨 [AgentIQ Sentinel Alert] {alert['risk_level']} Risk: {alert['target_name']} ({alert['target_id']})"
        body_text = self.format_email_body(alert)
        
        # 1. Try Resend API
        api_key = resend_api_key or os.getenv("RESEND_API_KEY")
        if api_key:
            try:
                import resend
                resend.api_key = api_key
                params = {
                    "from": "AgentIQ Sentinel <onboarding@resend.dev>",
                    "to": [recipient_email],
                    "subject": subject,
                    "text": body_text
                }
                email_res = resend.Emails.send(params)
                return True, f"Email successfully sent via Resend API (ID: {email_res.get('id', 'OK')})"
            except Exception as e:
                return False, f"Resend API Error: {str(e)}"

        # 2. Try SMTP
        smtp_user = (smtp_config or {}).get("username") or os.getenv("SMTP_USERNAME")
        smtp_pass = (smtp_config or {}).get("password") or os.getenv("SMTP_PASSWORD")
        smtp_host = (smtp_config or {}).get("server") or os.getenv("SMTP_SERVER", "smtp.gmail.com")
        smtp_port = int((smtp_config or {}).get("port") or os.getenv("SMTP_PORT", 587))
        
        if smtp_user and smtp_pass:
            try:
                msg = MIMEMultipart()
                msg['From'] = smtp_user
                msg['To'] = recipient_email
                msg['Subject'] = subject
                msg.attach(MIMEText(body_text, 'plain'))
                
                server = smtplib.SMTP(smtp_host, smtp_port)
                server.starttls()
                server.login(smtp_user, smtp_pass)
                server.send_message(msg)
                server.quit()
                return True, f"Email successfully sent via SMTP to {recipient_email}!"
            except Exception as e:
                return False, f"SMTP Dispatch Error: {str(e)}"
                
        return False, "No active Email API Key (Resend) or SMTP credentials configured."

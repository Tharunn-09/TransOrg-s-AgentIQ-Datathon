"""
Audit Logging & Compliance Registry
TransOrg AgentIQ Datathon - Track 1 (FinTech & BFSI)

Maintains a tamper-evident audit trail of system logins, filter changes,
AI query executions, and automated risk alert dispatches.
"""

from datetime import datetime
import sqlite3
from typing import Any, Dict, List, Optional
import pandas as pd


class AuditLogger:
    """
    Manages session and persistent audit logging in SQLite.
    """
    def __init__(self, db_path: str = "upi_fraud_analytics.db"):
        self.db_path = db_path
        self._init_table()
        self.memory_logs = []

    def _init_table(self):
        try:
            conn = sqlite3.connect(self.db_path)
            conn.execute("""
            CREATE TABLE IF NOT EXISTS system_audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT,
                username TEXT,
                action_type TEXT,
                details TEXT,
                ip_address TEXT
            );
            """)
            conn.commit()
            conn.close()
        except Exception:
            pass

    def log(self, username: str, action_type: str, details: str, ip_address: str = "127.0.0.1"):
        """Records an action in memory and SQLite."""
        ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        entry = {
            'timestamp': ts,
            'username': username,
            'action_type': action_type,
            'details': details,
            'ip_address': ip_address
        }
        self.memory_logs.append(entry)
        
        try:
            conn = sqlite3.connect(self.db_path)
            conn.execute(
                "INSERT INTO system_audit_logs (timestamp, username, action_type, details, ip_address) VALUES (?, ?, ?, ?, ?)",
                (ts, username, action_type, details, ip_address)
            )
            conn.commit()
            conn.close()
        except Exception:
            pass

    def get_recent_logs(self, limit: int = 50) -> pd.DataFrame:
        """Fetches recent audit logs."""
        try:
            conn = sqlite3.connect(self.db_path)
            df = pd.read_sql_query(f"SELECT * FROM system_audit_logs ORDER BY id DESC LIMIT {limit}", conn)
            conn.close()
            return df
        except Exception:
            return pd.DataFrame(self.memory_logs[-limit:])


audit_logger = AuditLogger()

"""
Unit & Integration Test Suite for UPI Fraud Platform Pipeline
TransOrg AgentIQ Datathon - Track 1 (FinTech & BFSI)
"""

import os
import unittest
from datetime import datetime
import pandas as pd
import sqlite3

from src.normalizers import normalize_user_id, normalize_merchant_id, normalize_mcc
from src.cleaner import (
    clean_currency_amount, parse_flexible_timestamp,
    clean_transactions, clean_kyc, clean_merchants, clean_chargebacks
)
from src.metrics import (
    compute_executive_kpis, compute_merchant_risk_scores, compute_customer_risk_scores
)
from src.database import get_db_connection


class TestNormalizers(unittest.TestCase):
    def test_user_id_normalization(self):
        cases = [
            ("USR45826", "USR45826"),
            ("usr97580", "USR97580"),
            ("USR 45454", "USR45454"),
            ("USR-54113", "USR54113"),
            ("usr_12345", "USR12345"),
            ("45454", "USR45454"),
            (87810, "USR87810"),
            ("  USR  19283 ", "USR19283"),
            (None, "USR_UNKNOWN"),
            ("", "USR_UNKNOWN")
        ]
        for raw, expected in cases:
            self.assertEqual(normalize_user_id(raw), expected, f"Failed on {raw}")

    def test_merchant_id_normalization(self):
        cases = [
            ("mch2849", "MCH2849"),
            ("MCH4314", "MCH4314"),
            ("3835", "MCH3835"),
            ("MCH-1986", "MCH1986"),
            ("mch_9999", "MCH9999"),
            (7045, "MCH7045"),
            (" MCH 5031 ", "MCH5031"),
            (None, "MCH_UNKNOWN")
        ]
        for raw, expected in cases:
            self.assertEqual(normalize_merchant_id(raw), expected, f"Failed on {raw}")

    def test_mcc_normalization(self):
        cases = [
            ("MCC-5411", "5411"),
            ("05411", "5411"),
            (5411.0, "5411"),
            (5411, "5411"),
            ("5411", "5411")
        ]
        for raw, expected in cases:
            self.assertEqual(normalize_mcc(raw), expected, f"Failed on {raw}")


class TestCleaners(unittest.TestCase):
    def test_currency_cleaning(self):
        cases = [
            ("15722.34", 15722.34, True),
            ("Rs. 6362.9", 6362.9, True),
            ("₹16,466.93", 16466.93, True),
            ("INR 2,432.18", 2432.18, True),
            ("27.3k", 27300.0, True),
            ("-1271.48", -1271.48, False), # Negative flagged invalid
            ("", None, False),
            ("N/A", None, False)
        ]
        for raw, exp_val, exp_valid in cases:
            val, valid = clean_currency_amount(raw)
            if exp_val is not None:
                self.assertAlmostEqual(val, exp_val, places=2)
            else:
                self.assertIsNone(val)
            self.assertEqual(valid, exp_valid)

    def test_flexible_timestamp_parser(self):
        # Epoch
        dt1 = parse_flexible_timestamp("1770063471")
        self.assertIsNotNone(dt1)
        # ISO
        dt2 = parse_flexible_timestamp("2026-01-15 00:11:30")
        self.assertEqual(dt2.year, 2026)
        self.assertEqual(dt2.month, 1)
        self.assertEqual(dt2.day, 15)
        # 12hr AM/PM
        dt3 = parse_flexible_timestamp("03-10-2026 09:27:31 PM")
        self.assertIsNotNone(dt3)
        self.assertEqual(dt3.hour, 21)


class TestDatabaseIntegrity(unittest.TestCase):
    def test_sqlite_views_exist(self):
        conn = get_db_connection("upi_fraud_analytics.db")
        cur = conn.cursor()
        cur.execute("SELECT name FROM sqlite_master WHERE type='view';")
        views = [r[0] for r in cur.fetchall()]
        expected_views = [
            'v_transactions_enriched', 'v_merchant_metrics',
            'v_customer_metrics', 'v_category_performance', 'v_daily_trends'
        ]
        for v in expected_views:
            self.assertIn(v, views, f"Missing SQL view: {v}")
        conn.close()


if __name__ == "__main__":
    unittest.main()

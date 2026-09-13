"""
FastAPI Backend & ML / Graph Engine Test Suite
TransOrg AgentIQ Datathon - Track 1 (FinTech & BFSI)
"""

import unittest
from fastapi.testclient import TestClient
import pandas as pd
from server import app
from src.database import get_db_connection
from src.ml_engine import detect_merchant_spikes_isolation_forest, cluster_customers_risk_profile
from src.graph_engine import build_fraud_bipartite_network, detect_suspicious_fraud_rings
from src.auth import get_current_totp


class TestApiAndEngines(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        conn = get_db_connection("upi_fraud_analytics.db")
        cls.df_tx = pd.read_sql_query("SELECT * FROM transactions", conn)
        cls.df_kyc = pd.read_sql_query("SELECT * FROM customers", conn)
        cls.df_merchants = pd.read_sql_query("SELECT * FROM merchants", conn)
        cls.df_cb = pd.read_sql_query("SELECT * FROM chargebacks", conn)
        conn.close()

    def test_filter_options_endpoint(self):
        res = self.client.get("/api/filters/options")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("categories", data)
        self.assertEqual(data["total_transactions"], 20000)

    def test_auth_login_and_dynamic_mfa(self):
        login_res = self.client.post("/api/auth/login", json={"username": "executive", "password": "Password123!"})
        self.assertEqual(login_res.status_code, 200)
        login_data = login_res.json()
        self.assertEqual(login_data["status"], "mfa_required")
        self.assertIn("qr_code_base64", login_data)

        totp = get_current_totp("executive")
        mfa_res = self.client.post("/api/auth/verify-mfa", json={"username": "executive", "otp_code": totp})
        self.assertEqual(mfa_res.status_code, 200)
        self.assertEqual(mfa_res.json()["status"], "authenticated")

    def test_isolation_forest_spikes(self):
        spikes = detect_merchant_spikes_isolation_forest(self.df_tx, self.df_cb)
        self.assertGreater(len(spikes), 0)
        self.assertIn("is_spike_anomaly", spikes.columns)
        self.assertIn("anomaly_score", spikes.columns)

    def test_kmeans_clustering(self):
        from src.metrics import compute_customer_risk_scores
        cust_risk = compute_customer_risk_scores(self.df_kyc, self.df_tx, self.df_cb)
        clustered, labels = cluster_customers_risk_profile(cust_risk, n_clusters=4)
        self.assertEqual(len(clustered), len(cust_risk))
        self.assertIn("cluster_name", clustered.columns)

    def test_graph_network_engine(self):
        G, metrics = build_fraud_bipartite_network(self.df_tx, self.df_cb, top_n_nodes=30)
        self.assertGreater(len(G.nodes), 0)
        self.assertIn("pagerank", metrics)

    def test_regulatory_pdf_endpoint(self):
        res = self.client.get("/api/reports/pdf")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.headers["content-type"], "application/pdf")
        self.assertGreater(len(res.content), 1000)


if __name__ == "__main__":
    unittest.main()

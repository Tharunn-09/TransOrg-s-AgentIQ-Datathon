import unittest
import pandas as pd
from src.database import get_db_connection
from src.agent import AgenticGraphAI


class TestCopilotChartIntegrity(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        conn = get_db_connection("upi_fraud_analytics.db")
        cls.df_tx = pd.read_sql_query("SELECT * FROM transactions", conn)
        cls.df_kyc = pd.read_sql_query("SELECT * FROM customers", conn)
        cls.df_merchants = pd.read_sql_query("SELECT * FROM merchants", conn)
        cls.df_cb = pd.read_sql_query("SELECT * FROM chargebacks", conn)
        conn.close()
        cls.agent = AgenticGraphAI(cls.df_tx, cls.df_kyc, cls.df_merchants, cls.df_cb)

    def test_all_quick_queries(self):
        queries = [
            "Show daily transaction volume trend.",
            "Show total transaction amount by merchant category.",
            "Compare successful vs failed transactions by day.",
            "Which merchant has the highest chargeback count?",
            "Show chargeback reason distribution.",
            "Compare chargebacks by severity level.",
            "Show disputes reported after 7 days.",
            "Which merchant category has the highest chargeback-to-transaction ratio?",
            "Show hourly failure spikes",
            "Which states have the highest failure rate?",
            "Arbitrary test query on multi-bank volume clustering"
        ]

        for q in queries:
            with self.subTest(query=q):
                res = self.agent.process_query(q)
                self.assertEqual(res["status"], "success")
                ds = res.get("dataset")
                self.assertIsNotNone(ds, f"Dataset missing for {q}")
                data = ds.get("data")
                xKey = ds.get("xKey")
                yKey = ds.get("yKey")
                self.assertGreater(len(data), 0, f"Data empty for {q}")
                self.assertIn(xKey, data[0], f"xKey '{xKey}' not found in first row of data: {data[0]}")
                if not ds.get("series"):
                    self.assertIn(yKey, data[0], f"yKey '{yKey}' not found in first row of data: {data[0]}")
                self.assertIsNotNone(res.get("summary"))
                self.assertGreater(len(res["summary"]), 10)


if __name__ == "__main__":
    unittest.main()

"""
Real-Time Fraud Attack Simulator & What-If Scenario Sandbox
TransOrg AgentIQ Datathon - Track 1 (FinTech & BFSI)

Enables risk officers and datathon evaluators to simulate real-world payments attacks:
  1. Micro-Transaction Burst / Velocity Laundering Attack.
  2. Synthetic Identity & Stolen Identity Injection.
  3. Ghost Merchant Settlement Account Hijack.
"""

from datetime import datetime
from typing import Any, Dict, List, Tuple
import numpy as np
import pandas as pd


def simulate_micro_transaction_burst(
    target_merchant_id: str,
    burst_count: int = 50,
    burst_amount_per_tx: float = 499.0,
    df_tx: pd.DataFrame = None,
    df_mch_risk: pd.DataFrame = None
) -> Dict[str, Any]:
    """
    Simulates a rapid burst of micro-transactions to test velocity detection.
    """
    mch_curr = df_mch_risk[df_mch_risk['merchant_id'] == target_merchant_id]
    baseline_risk = float(mch_curr.iloc[0]['risk_score']) if not mch_curr.empty else 25.0
    baseline_tx = int(mch_curr.iloc[0]['tx_count']) if not mch_curr.empty else 10
    
    # Calculate simulated post-burst metrics
    sim_tx_count = baseline_tx + burst_count
    sim_burst_volume = burst_count * burst_amount_per_tx
    
    # Velocity spike multiplier
    spike_multiplier = burst_count / max(1, baseline_tx)
    
    # Updated simulated risk score
    sim_risk_score = min(100.0, baseline_risk + spike_multiplier * 18.0)
    
    return {
        'scenario': 'Micro-Transaction Velocity Burst Attack',
        'target_merchant_id': target_merchant_id,
        'simulated_tx_injected': burst_count,
        'burst_volume_injected': sim_burst_volume,
        'spike_multiplier': round(spike_multiplier, 2),
        'baseline_risk_score': round(baseline_risk, 1),
        'simulated_risk_score': round(sim_risk_score, 1),
        'anomaly_detected': sim_risk_score > 60.0,
        'recommended_action': "Trigger automated velocity threshold circuit breaker and hold POS settlement batch."
    }


def simulate_synthetic_identity_wave(
    wave_size: int = 100,
    invalid_pan_pct: float = 75.0,
    df_cust_risk: pd.DataFrame = None
) -> Dict[str, Any]:
    """
    Simulates an onboarding wave of synthetic identities with malformed PANs/Aadhaars.
    """
    flagged_identities = int(wave_size * (invalid_pan_pct / 100.0))
    avg_synthetic_risk = 78.5
    
    return {
        'scenario': 'Synthetic Identity Infiltration Wave',
        'synthetic_accounts_attempted': wave_size,
        'malformed_pan_aadhaar_flagged': flagged_identities,
        'detection_rate_pct': invalid_pan_pct,
        'avg_synthetic_risk_score': avg_synthetic_risk,
        'enforcement_action': "Auto-route flagged applicants to manual Video-KYC queue with document hash validation."
    }

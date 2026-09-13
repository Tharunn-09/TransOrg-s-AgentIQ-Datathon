import { useEffect, useState } from 'react';
import { ShieldAlert, Siren, Zap, Loader2, CheckCircle2 } from 'lucide-react';
import ChartCard from '../ChartCard';
import { runBurstSimulation, runIdentitySimulation, getHighRiskMerchants } from '../../../lib/api';
import { REAL_DATASET_SNAPSHOT } from '../../../lib/datasetSnapshot';

export default function SandboxTab() {
  // Merchant options from real dataset
  const [merchants, setMerchants] = useState<any[]>(REAL_DATASET_SNAPSHOT.high_risk_merchants);
  const [selectedMerchantId, setSelectedMerchantId] = useState(
    REAL_DATASET_SNAPSHOT.high_risk_merchants[0]?.merchant_id || 'MCH0842'
  );

  // Velocity burst sandbox state
  const [burst, setBurst] = useState(60);
  const [amount, setAmount] = useState(499);
  const [burstLoading, setBurstLoading] = useState(false);
  const [burstResult, setBurstResult] = useState<null | {
    scenario: string;
    baseline_risk_score: number;
    simulated_risk_score: number;
    spike_multiplier: number;
    anomaly_detected: boolean;
    recommended_action: string;
  }>(null);

  // Synthetic identity sandbox state
  const [batchSize, setBatchSize] = useState(50);
  const [malformedPct, setMalformedPct] = useState(35);
  const [idLoading, setIdLoading] = useState(false);
  const [idResult, setIdResult] = useState<null | {
    scenario: string;
    synthetic_accounts_attempted: number;
    malformed_pan_aadhaar_flagged: number;
    detection_rate_pct: number;
    avg_synthetic_risk_score: number;
    enforcement_action: string;
  }>(null);

  useEffect(() => {
    getHighRiskMerchants(50).then((m) => {
      if (m && m.length > 0) {
        setMerchants(m);
        setSelectedMerchantId(m[0].merchant_id);
      }
    });
  }, []);

  const executeBurst = async () => {
    setBurstLoading(true);
    try {
      const res = await runBurstSimulation(selectedMerchantId, burst, amount);
      setBurstResult(res);
    } catch (e) {
      // fallback
    } finally {
      setBurstLoading(false);
    }
  };

  const executeInfiltration = async () => {
    setIdLoading(true);
    try {
      const res = await runIdentitySimulation(batchSize, malformedPct);
      setIdResult(res);
    } catch (e) {
      // fallback
    } finally {
      setIdLoading(false);
    }
  };

  const currentMerchantName = merchants.find((m) => m.merchant_id === selectedMerchantId)?.name || selectedMerchantId;

  return (
    <div className="space-y-5">
      <ChartCard
        title="Micro-Transaction Velocity Burst Attack Simulator"
        subtitle="Simulate high-frequency micro-payment bursts against an active merchant to test automated circuit breakers"
      >
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs mono text-mystic/50 mb-1.5">Target Merchant</label>
              <select
                value={selectedMerchantId}
                onChange={(e) => setSelectedMerchantId(e.target.value)}
                className="w-full bg-white/[0.04] border border-surface-border rounded-md px-3 py-2.5 text-sm text-arctic outline-none focus:border-forsythia/50"
              >
                {merchants.map((m) => (
                  <option key={m.merchant_id} value={m.merchant_id} className="bg-oceanic">
                    {m.name || m.merchant_id} ({m.merchant_id} · Score: {m.risk_score})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-xs mono text-mystic/50">Burst Volume (Txn Count)</label>
                <span className="text-xs mono text-forsythia font-semibold">{burst} transactions</span>
              </div>
              <input
                type="range"
                min={10}
                max={250}
                step={5}
                value={burst}
                onChange={(e) => setBurst(Number(e.target.value))}
                className="w-full accent-forsythia"
              />
            </div>
            <div>
              <label className="block text-xs mono text-mystic/50 mb-1.5">Amount per Transaction (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-white/[0.04] border border-surface-border rounded-md px-3 py-2.5 text-sm text-arctic outline-none focus:border-forsythia/50"
              />
            </div>
            <button
              onClick={executeBurst}
              disabled={burstLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium text-oceanic bg-gradient-to-r from-forsythia to-saffron hover:shadow-glow transition-shadow duration-500"
            >
              {burstLoading ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
              <span>Execute Velocity Burst Simulation</span>
            </button>
          </div>

          <div className="flex flex-col justify-center">
            {burstResult ? (
              <div className="glass-panel p-5 space-y-4 border-forsythia/30">
                <div className="flex items-center justify-between pb-2 border-b border-surface-border">
                  <span className="text-xs mono text-mystic/50">Target Entity</span>
                  <span className="text-sm font-medium text-arctic">{currentMerchantName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs mono text-mystic/50">Baseline Risk Score</span>
                  <span className="text-lg font-display text-mystic/80">{burstResult.baseline_risk_score} / 100</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs mono text-mystic/50">Simulated Post-Burst Risk</span>
                  <span className="text-2xl font-display font-bold text-saffron">{burstResult.simulated_risk_score} / 100</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-forsythia to-saffron transition-all duration-700"
                    style={{ width: `${burstResult.simulated_risk_score}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs mono text-mystic/60">
                  <span>Velocity Multiplier: {burstResult.spike_multiplier}x</span>
                  <span>Injected Volume: ₹{(burst * amount).toLocaleString()}</span>
                </div>
                {burstResult.anomaly_detected && (
                  <div className="flex items-start gap-2 text-saffron text-xs pt-3 border-t border-surface-border leading-relaxed">
                    <Siren size={16} className="flex-shrink-0 mt-0.5" />
                    <span><strong>Circuit Breaker Triggered:</strong> {burstResult.recommended_action}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-panel p-6 text-center text-sm text-mystic/40">
                Configure parameters and click <strong>Execute Velocity Burst</strong> to test the machine learning spike detection engine.
              </div>
            )}
          </div>
        </div>
      </ChartCard>

      <ChartCard
        title="Synthetic Identity Infiltration Sandbox"
        subtitle="Simulate a batch of onboarding applicants with invalid PAN and unlinked Aadhaar records"
      >
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-xs mono text-mystic/50">Batch Signup Size</label>
                <span className="text-xs mono text-forsythia font-semibold">{batchSize} applicant accounts</span>
              </div>
              <input
                type="range"
                min={10}
                max={300}
                step={10}
                value={batchSize}
                onChange={(e) => setBatchSize(Number(e.target.value))}
                className="w-full accent-forsythia"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-xs mono text-mystic/50">Malformed Identity % (Invalid PAN / Aadhaar)</label>
                <span className="text-xs mono text-saffron font-semibold">{malformedPct}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={malformedPct}
                onChange={(e) => setMalformedPct(Number(e.target.value))}
                className="w-full accent-saffron"
              />
            </div>
            <button
              onClick={executeInfiltration}
              disabled={idLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium text-arctic border border-forsythia/30 hover:bg-forsythia/10 transition-colors"
            >
              {idLoading ? <Loader2 size={15} className="animate-spin" /> : <ShieldAlert size={15} />}
              <span>Run Identity Infiltration Test</span>
            </button>
          </div>

          <div className="flex flex-col justify-center">
            {idResult ? (
              <div className="glass-panel p-5 space-y-4 border-forsythia/30">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2 rounded-md bg-white/[0.02]">
                    <p className="text-2xl font-display font-bold text-forsythia">{idResult.malformed_pan_aadhaar_flagged}</p>
                    <p className="text-[11px] text-mystic/50 mt-1">Flagged Identities</p>
                  </div>
                  <div className="p-2 rounded-md bg-white/[0.02]">
                    <p className="text-2xl font-display font-bold text-arctic">{idResult.detection_rate_pct}%</p>
                    <p className="text-[11px] text-mystic/50 mt-1">Detection Rate</p>
                  </div>
                  <div className="p-2 rounded-md bg-white/[0.02]">
                    <p className="text-2xl font-display font-bold text-saffron">{idResult.avg_synthetic_risk_score}</p>
                    <p className="text-[11px] text-mystic/50 mt-1">Avg Synthetic Risk</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-xs text-mystic/80 pt-2 border-t border-surface-border">
                  <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Policy Enforcement:</strong> {idResult.enforcement_action}</span>
                </div>
              </div>
            ) : (
              <div className="glass-panel p-6 text-center text-sm text-mystic/40">
                Run the infiltration test to evaluate KYC anomaly interception accuracy.
              </div>
            )}
          </div>
        </div>
      </ChartCard>
    </div>
  );
}

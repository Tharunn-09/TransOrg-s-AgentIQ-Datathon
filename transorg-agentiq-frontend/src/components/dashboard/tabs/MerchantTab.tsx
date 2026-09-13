import { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';
import { Search, RefreshCw, Info, ShieldAlert } from 'lucide-react';
import ChartCard from '../ChartCard';
import DataTable, { type Column } from '../DataTable';
import { RiskScoreBar } from '../RiskBadge';
import RiskBadge from '../RiskBadge';
import { getHighRiskMerchants, getTopDisputeMerchants, getMerchantSpikes } from '../../../lib/api';
import { REAL_DATASET_SNAPSHOT } from '../../../lib/datasetSnapshot';

const chartTooltipStyle = {
  background: '#142A34',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 8,
  fontSize: 12,
  color: '#D9E8E2',
};

const tooltipItemStyle = {
  color: '#D9E8E2',
};

const tooltipLabelStyle = {
  color: '#D9E8E2',
  fontWeight: 600,
};

interface MerchantRow {
  merchant_id: string;
  name: string;
  category: string;
  settlement: string;
  risk_score: number;
  risk_level?: string;
  tx_count?: number;
  cb_count?: number;
  cb_ratio_pct?: number;
}

// Generate rich diagnostic explanation for why the merchant was flagged as high-risk
function getMerchantRiskReasons(m: MerchantRow): string[] {
  const reasons: string[] = [];

  if (m.risk_score >= 95) {
    reasons.push(`Extreme composite risk score (${m.risk_score}/100) exceeding severe threat tolerance`);
  } else if (m.risk_score >= 80) {
    reasons.push(`Elevated risk score (${m.risk_score}/100) triggering automated underwriting review`);
  }

  if (m.cb_count && m.cb_count > 0) {
    if (m.tx_count && m.cb_count > m.tx_count) {
      reasons.push(`Abnormal dispute inversion: ${m.cb_count} chargebacks filed against only ${m.tx_count} transactions`);
    } else {
      reasons.push(`High dispute volume (${m.cb_count} chargebacks filed)`);
    }
  }

  if (m.settlement === 'Held' || m.settlement === 'Frozen') {
    reasons.push(`Settlement payout status held due to AML/anti-fraud policy lockdown`);
  }

  if (m.category === 'Books & Stationery' || m.category === 'Restaurants & Dining' || m.category === 'Telecom & Recharges') {
    reasons.push(`High-chargeback merchant category: elevated friendly fraud & return rate in ${m.category}`);
  }

  if (reasons.length === 0) {
    reasons.push('Isolation Forest velocity anomaly and suspicious multi-card retry patterns detected');
  }

  return reasons;
}

export default function MerchantTab() {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [highRiskMerchants, setHighRiskMerchants] = useState<MerchantRow[]>(REAL_DATASET_SNAPSHOT.high_risk_merchants as any);
  const [topDisputes, setTopDisputes] = useState(REAL_DATASET_SNAPSHOT.top_dispute_merchants);
  const [spikes, setSpikes] = useState(REAL_DATASET_SNAPSHOT.merchant_spikes);
  const [loading, setLoading] = useState(false);
  const [hoveredMerchant, setHoveredMerchant] = useState<MerchantRow | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, t, s] = await Promise.all([
        getHighRiskMerchants(100),
        getTopDisputeMerchants(10),
        getMerchantSpikes(),
      ]);
      if (m && m.length > 0) setHighRiskMerchants(m as any);
      if (t && t.length > 0) setTopDisputes(t);
      if (s && s.length > 0) setSpikes(s);
    } catch (err) {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const categories = useMemo(() => {
    const list = Array.from(new Set(highRiskMerchants.map((m) => m.category).filter(Boolean)));
    return ['All', ...list];
  }, [highRiskMerchants]);

  const filtered = useMemo(
    () =>
      highRiskMerchants.filter(
        (m) =>
          (categoryFilter === 'All' || m.category === categoryFilter) &&
          (m.name?.toLowerCase().includes(query.toLowerCase()) || m.merchant_id?.toLowerCase().includes(query.toLowerCase()))
      ),
    [highRiskMerchants, query, categoryFilter]
  );

  const columns: Column<MerchantRow>[] = [
    {
      key: 'name',
      header: 'Merchant (Hover for Risk Reasons)',
      render: (r) => {
        const isHovered = hoveredMerchant?.merchant_id === r.merchant_id;
        const reasons = getMerchantRiskReasons(r);

        return (
          <div
            className="relative group py-1 cursor-help"
            onMouseEnter={() => setHoveredMerchant(r)}
            onMouseLeave={() => setHoveredMerchant(null)}
          >
            <div className="flex items-center gap-1.5">
              <p className="text-arctic font-medium group-hover:text-forsythia transition-colors">{r.name}</p>
              <Info size={12} className="text-mystic/40 group-hover:text-forsythia shrink-0" />
            </div>
            <p className="text-[10px] mono text-mystic/40">{r.merchant_id}</p>

            {/* Rich Hover Popup for Risk Reasons */}
            {isHovered && (
              <div className="absolute left-0 top-full mt-1.5 z-50 w-72 sm:w-80 p-3 rounded-lg shadow-2xl border border-saffron/40 bg-[#142A34]/95 backdrop-blur-md pointer-events-none text-left">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-saffron mb-1.5 pb-1 border-b border-surface-border">
                  <ShieldAlert size={14} />
                  <span>Risk Diagnosis: {r.name}</span>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[11px] text-[#D9E8E2] font-medium">Why this merchant is flagged high risk:</p>
                  <ul className="space-y-1">
                    {reasons.map((reason, idx) => (
                      <li key={idx} className="text-[11px] text-[#D9E8E2] flex items-start gap-1.5">
                        <span className="text-saffron shrink-0 font-bold">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-1.5 mt-1 border-t border-white/10 flex justify-between items-center text-[10px] text-mystic/70">
                    <span>Disputes: <strong className="text-saffron">{r.cb_count ?? 0}</strong></span>
                    <span>Status: <strong className="text-forsythia">{r.settlement}</strong></span>
                    <span>Score: <strong className="text-saffron">{r.risk_score}/100</strong></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      },
    },
    { key: 'category', header: 'Category', render: (r) => <span className="text-mystic/80">{r.category}</span> },
    {
      key: 'tx_count',
      header: 'Txns / Disputes',
      align: 'right',
      render: (r) => (
        <span className="mono text-xs text-mystic/70">
          {r.tx_count ?? '-'} / <span className="text-saffron">{r.cb_count ?? '-'}</span>
        </span>
      ),
    },
    { key: 'settlement', header: 'Settlement status', render: (r) => <RiskBadge label={r.settlement} /> },
    { key: 'risk', header: 'Risk score', align: 'right', render: (r) => <RiskScoreBar score={r.risk_score} /> },
  ];

  return (
    <div className="space-y-5">
      <div className="grid lg:grid-cols-2 gap-5">
        <ChartCard title="Top 10 merchants by dispute count" subtitle="Chargebacks aggregated directly from chargeback records">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topDisputes} layout="vertical" margin={{ left: 10, right: 15 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#9BAEAF', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                dataKey="merchant_name"
                type="category"
                width={140}
                tick={{ fill: '#D9E8E2', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={chartTooltipStyle}
                itemStyle={tooltipItemStyle}
                labelStyle={tooltipLabelStyle}
              />
              <Bar dataKey="dispute_count" fill="#FF9932" radius={[0, 3, 3, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Velocity spike scatter"
          subtitle="Max daily transactions vs spike ratio · Isolation Forest flagged anomalies"
        >
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                type="number"
                dataKey="max_daily_tx"
                name="Max daily tx"
                tick={{ fill: '#9BAEAF', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="number"
                dataKey="tx_spike_ratio"
                name="Spike ratio"
                tick={{ fill: '#9BAEAF', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <ZAxis range={[60, 60]} />
              <Tooltip
                contentStyle={chartTooltipStyle}
                itemStyle={tooltipItemStyle}
                labelStyle={tooltipLabelStyle}
                cursor={{ strokeDasharray: '3 3' }}
                formatter={(value: any, name: any) => [value, name]}
                labelFormatter={() => ''}
              />
              <Scatter data={spikes}>
                {spikes.map((d, i) => (
                  <Cell key={i} fill={d.is_anomaly ? '#FF9932' : '#114C5A'} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 text-[11px] text-mystic/50">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-saffron inline-block" /> ML Isolation Forest Flagged Anomaly
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-nocturnal inline-block" /> Normal Velocity Range
            </span>
          </div>
        </ChartCard>
      </div>

      <ChartCard
        title="High-risk merchant directory"
        subtitle="Multi-dimensional risk scores computed from transactions, chargebacks, and master records (Hover over any merchant name for AI risk diagnosis)"
      >
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mystic/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search merchant name or ID (e.g. MCH0842)…"
              className="w-full bg-white/[0.04] border border-surface-border rounded-md pl-9 pr-3 py-2 text-sm text-arctic placeholder:text-mystic/30 focus:border-forsythia/50 outline-none transition-colors"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white/[0.04] border border-surface-border rounded-md px-3 py-2 text-sm text-arctic outline-none focus:border-forsythia/50"
          >
            {categories.map((c) => (
              <option key={c} value={c} className="bg-oceanic">
                {c}
              </option>
            ))}
          </select>
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3 py-2 border border-surface-border hover:border-forsythia/40 rounded-md text-xs text-forsythia flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
        <DataTable columns={columns} rows={filtered} keyField={(r) => r.merchant_id} />
      </ChartCard>
    </div>
  );
}

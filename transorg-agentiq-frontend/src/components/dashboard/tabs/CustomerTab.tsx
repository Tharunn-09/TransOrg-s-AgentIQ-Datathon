import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Legend } from 'recharts';
import { Check, X, RefreshCw } from 'lucide-react';
import ChartCard from '../ChartCard';
import DataTable, { type Column } from '../DataTable';
import RiskBadge from '../RiskBadge';
import { getCustomerKycStats, getCustomerClusters, getCustomerRisk } from '../../../lib/api';
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

interface CustomerRow {
  customer_id: string;
  full_name?: string;
  city_clean?: string;
  pan_valid: boolean;
  aadhaar_linked: boolean;
  risk: string;
  disputes: number;
}

const columns: Column<CustomerRow>[] = [
  {
    key: 'id',
    header: 'Customer ID',
    render: (r) => (
      <div>
        <span className="mono text-arctic font-medium">{r.customer_id}</span>
        {r.full_name && <p className="text-[11px] text-mystic/40">{r.full_name} · {r.city_clean}</p>}
      </div>
    ),
  },
  {
    key: 'pan',
    header: 'PAN valid',
    align: 'center',
    render: (r) =>
      r.pan_valid ? (
        <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-mono font-medium">
          <Check size={13} /> Valid
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-saffron text-xs font-mono font-medium">
          <X size={13} /> Malformed
        </span>
      ),
  },
  {
    key: 'aadhaar',
    header: 'Aadhaar compliant',
    align: 'center',
    render: (r) =>
      r.aadhaar_linked ? (
        <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-mono font-medium">
          <Check size={13} /> Verified
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-saffron text-xs font-mono font-medium">
          <X size={13} /> Missing
        </span>
      ),
  },
  { key: 'risk', header: 'Composite risk', render: (r) => <RiskBadge label={r.risk} /> },
  { key: 'disputes', header: 'Disputes filed', align: 'right', render: (r) => <span className="mono font-semibold">{r.disputes}</span> },
];

export default function CustomerTab() {
  const [kycDonut, setKycDonut] = useState(REAL_DATASET_SNAPSHOT.kyc_donut);
  const [utrImpact, setUtrImpact] = useState(REAL_DATASET_SNAPSHOT.utr_impact);
  const [clusters, setClusters] = useState(REAL_DATASET_SNAPSHOT.customer_clusters);
  const [customerRisk, setCustomerRisk] = useState<CustomerRow[]>(REAL_DATASET_SNAPSHOT.high_risk_customers as any);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [k, c, r] = await Promise.all([
        getCustomerKycStats(),
        getCustomerClusters(),
        getCustomerRisk(100),
      ]);
      if (k?.kyc_donut) setKycDonut(k.kyc_donut);
      if (k?.utr_impact) setUtrImpact(k.utr_impact);
      if (c?.clusters) setClusters(c.clusters);
      if (r && r.length > 0) setCustomerRisk(r as any);
    } catch (e) {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-5">
      <div className="grid lg:grid-cols-2 gap-5">
        <ChartCard
          title="Customer KYC status"
          subtitle="Verification breakdown across 28,920 customer records"
        >
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={kycDonut}
                dataKey="value"
                nameKey="name"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={2}
              >
                {kycDonut.map((d, i) => (
                  <Cell key={i} fill={d.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={chartTooltipStyle}
                itemStyle={tooltipItemStyle}
                labelStyle={tooltipLabelStyle}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: '#9BAEAF' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="UTR failure & dispute impact"
          subtitle="Success and chargeback rate comparison by UTR validity"
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={utrImpact}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#9BAEAF', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9BAEAF', fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip
                contentStyle={chartTooltipStyle}
                itemStyle={tooltipItemStyle}
                labelStyle={tooltipLabelStyle}
                formatter={(v: any) => `${v}%`}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: '#9BAEAF' }} />
              <Bar dataKey="success_rate" name="Payment Success %" fill="#114C5A" radius={[3, 3, 0, 0]} />
              <Bar dataKey="dispute_rate" name="Dispute Ratio %" fill="#FF9932" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard
        title="K-Means behavioral risk archetypes"
        subtitle="4-cluster profile over transaction velocity vs dispute intensity (trained on live KYC records)"
      >
        <ResponsiveContainer width="100%" height={320}>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              type="number"
              dataKey="x"
              name="Transaction Velocity"
              tick={{ fill: '#9BAEAF', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Dispute & Risk Score"
              tick={{ fill: '#9BAEAF', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={chartTooltipStyle}
              itemStyle={tooltipItemStyle}
              labelStyle={tooltipLabelStyle}
              cursor={{ strokeDasharray: '3 3' }}
            />
            <Legend wrapperStyle={{ fontSize: 11, color: '#9BAEAF' }} />
            {clusters.map((c) => (
              <Scatter key={c.cluster} name={c.cluster} data={c.points} fill={c.color} />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="High-risk customer directory"
        subtitle="Customer KYC anomaly & compliance risk scorecard"
      >
        <div className="flex justify-end mb-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3 py-1.5 border border-surface-border hover:border-forsythia/40 rounded-md text-xs text-forsythia flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
        <DataTable columns={columns} rows={customerRisk} keyField={(r) => r.customer_id} />
      </ChartCard>
    </div>
  );
}

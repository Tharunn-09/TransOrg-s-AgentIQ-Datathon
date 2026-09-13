import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { RefreshCw } from 'lucide-react';
import ChartCard from '../ChartCard';
import DataTable, { type Column } from '../DataTable';
import { getDisputesSummary, getSlaHistogram } from '../../../lib/api';
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

const SEVERITY_COLOR: Record<string, string> = {
  CRITICAL: '#FF9932',
  HIGH: '#FFC801',
  MEDIUM: '#114C5A',
  LOW: '#9BAEAF',
};

interface DelayRow {
  dispute_id: string;
  merchant: string;
  delay_days: number;
  explainability: string;
}

const columns: Column<DelayRow>[] = [
  { key: 'id', header: 'Dispute ID', render: (r) => <span className="mono text-arctic font-medium">{r.dispute_id}</span> },
  { key: 'merchant', header: 'Merchant', render: (r) => <span className="text-mystic/90">{r.merchant}</span> },
  {
    key: 'delay',
    header: 'Reporting Delay',
    align: 'right',
    render: (r) => (
      <span className={r.delay_days > 7 ? 'text-saffron font-mono font-semibold' : 'text-mystic/80 font-mono'}>
        {r.delay_days} days
      </span>
    ),
  },
  { key: 'explain', header: 'AI Explainability & Root Cause', render: (r) => <span className="text-mystic/70 text-xs">{r.explainability}</span> },
];

export default function DisputesTab() {
  const [disputeReasons, setDisputeReasons] = useState(REAL_DATASET_SNAPSHOT.dispute_reasons);
  const [disputeSeverity, setDisputeSeverity] = useState(REAL_DATASET_SNAPSHOT.dispute_severity);
  const [slaHistogram, setSlaHistogram] = useState(REAL_DATASET_SNAPSHOT.sla_histogram);
  const [longDelays, setLongDelays] = useState(REAL_DATASET_SNAPSHOT.long_delay_disputes);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [summary, sla] = await Promise.all([
        getDisputesSummary(),
        getSlaHistogram(),
      ]);
      if (summary?.dispute_reasons) setDisputeReasons(summary.dispute_reasons);
      if (summary?.dispute_severity) setDisputeSeverity(summary.dispute_severity);
      if (summary?.long_delays_sample) setLongDelays(summary.long_delays_sample);
      if (sla && sla.length > 0) setSlaHistogram(sla);
    } catch (err) {
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
          title="Canonical dispute reasons"
          subtitle="Distribution across 2,800 filed chargebacks from Track 1 dataset"
        >
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={disputeReasons}
                dataKey="value"
                nameKey="name"
                innerRadius={0}
                outerRadius={100}
                paddingAngle={1}
              >
                {disputeReasons.map((d, i) => (
                  <Cell key={i} fill={d.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={chartTooltipStyle}
                itemStyle={tooltipItemStyle}
                labelStyle={tooltipLabelStyle}
              />
              <Legend
                wrapperStyle={{ fontSize: 10, color: '#9BAEAF' }}
                layout="vertical"
                align="right"
                verticalAlign="middle"
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Dispute severity buckets"
          subtitle="Aggregated by priority rating for risk desks"
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={disputeSeverity}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="severity" tick={{ fill: '#9BAEAF', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9BAEAF', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={chartTooltipStyle}
                itemStyle={tooltipItemStyle}
                labelStyle={tooltipLabelStyle}
              />
              <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                {disputeSeverity.map((d, i) => (
                  <Cell key={i} fill={SEVERITY_COLOR[d.severity] || '#114C5A'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard
        title="Reporting delay SLA distribution"
        subtitle="Distribution of elapsed days between transaction timestamp and chargeback filing date"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 p-2.5 rounded-lg bg-white/[0.02] border border-surface-border text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-[#FF9932] border-t border-dashed border-[#FF9932] inline-block" />
            <span className="text-[#D9E8E2] font-semibold">Orange Dashed Line: 7-Day Statutory SLA Threshold</span>
          </div>
          <p className="text-mystic/70 text-[11px]">
            Bars to the right of the orange line (<strong className="text-saffron">8-10d, 11-14d, 15-20d, 21d+</strong>) represent SLA breaches requiring enhanced compliance review.
          </p>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={slaHistogram}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="bucket" tick={{ fill: '#9BAEAF', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#9BAEAF', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={chartTooltipStyle}
              itemStyle={tooltipItemStyle}
              labelStyle={tooltipLabelStyle}
            />
            <ReferenceLine
              x="6-7d"
              stroke="#FF9932"
              strokeWidth={2}
              strokeDasharray="4 4"
              label={{
                value: '7-Day Statutory SLA Limit',
                fill: '#D9E8E2',
                fontSize: 11,
                position: 'top',
                fontWeight: 600,
              }}
            />
            <Bar dataKey="count" radius={[3, 3, 0, 0]}>
              {slaHistogram.map((entry, idx) => {
                const isViolation = ['8-10d', '11-14d', '15-20d', '21d+'].includes(entry.bucket);
                return <Cell key={idx} fill={isViolation ? '#FF9932' : '#FFC801'} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Long-delay dispute inspector"
        subtitle="Cases filed more than 7 days after originating UPI transaction with automated root-cause explanation"
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
        <DataTable columns={columns} rows={longDelays} keyField={(r) => r.dispute_id} />
      </ChartCard>
    </div>
  );
}

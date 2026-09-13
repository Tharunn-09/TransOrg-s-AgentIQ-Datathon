import { useEffect, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { IndianRupee, Receipt, TrendingUp, AlertTriangle, ShieldAlert, FileCheck2, RefreshCw } from 'lucide-react';
import KpiCard from '../KpiCard';
import ChartCard from '../ChartCard';
import DataTable, { type Column } from '../DataTable';
import { getOverviewKpis, getDailyTrends, getHourlyFailures, getCategoryPerformance } from '../../../lib/api';
import { REAL_DATASET_SNAPSHOT } from '../../../lib/datasetSnapshot';
import { formatCompactINR, formatNumber } from '../../../lib/utils';

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

interface CategoryRow {
  category: string;
  total_txns: number;
  total_volume: number;
  avg_ticket: number;
  disputed_amount: number;
  chargeback_ratio: number;
}

const columns: Column<CategoryRow>[] = [
  { key: 'category', header: 'Category', render: (r) => <span className="text-arctic font-medium">{r.category}</span> },
  { key: 'txns', header: 'Total txns', align: 'right', render: (r) => formatNumber(r.total_txns) },
  { key: 'volume', header: 'Volume', align: 'right', render: (r) => formatCompactINR(r.total_volume) },
  { key: 'avg', header: 'Avg ticket', align: 'right', render: (r) => formatCompactINR(r.avg_ticket) },
  { key: 'disputed', header: 'Disputed volume', align: 'right', render: (r) => formatCompactINR(r.disputed_amount) },
  {
    key: 'ratio',
    header: 'Chargeback %',
    align: 'right',
    render: (r) => (
      <span className={r.chargeback_ratio > 18 ? 'text-saffron font-mono font-semibold' : 'text-mystic/80 font-mono'}>
        {r.chargeback_ratio.toFixed(1)}%
      </span>
    ),
  },
];

export default function OverviewTab() {
  const [kpis, setKpis] = useState(REAL_DATASET_SNAPSHOT.kpis);
  const [dailyTrends, setDailyTrends] = useState(REAL_DATASET_SNAPSHOT.daily_trends);
  const [hourlyFailures, setHourlyFailures] = useState(REAL_DATASET_SNAPSHOT.hourly_failures);
  const [categoryPerf, setCategoryPerf] = useState<CategoryRow[]>(REAL_DATASET_SNAPSHOT.category_performance as any);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [k, d, h, c] = await Promise.all([
        getOverviewKpis(),
        getDailyTrends(),
        getHourlyFailures(),
        getCategoryPerformance(),
      ]);
      if (k) setKpis(k);
      if (d) setDailyTrends(d);
      if (h) setHourlyFailures(h);
      if (c) setCategoryPerf(c as any);
    } catch (e) {
      // dataset snapshot used as fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-5">
      {/* Live Dataset Synchronization Banner */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-surface border border-surface-border">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono text-mystic/70">
            DATASET LIVE TELEMETRY · 20,000 TRANSACTIONS · 28,920 USERS · 4,343 MERCHANTS
          </span>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-forsythia hover:text-white transition-colors"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          <span>Sync live</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard
          label="Processed volume"
          value={formatCompactINR(kpis.total_amount)}
          sublabel={`${formatNumber(kpis.total_transactions)} txns`}
          icon={IndianRupee}
        />
        <KpiCard
          label="Avg txn value"
          value={formatCompactINR(kpis.avg_transaction_value)}
          icon={Receipt}
        />
        <KpiCard
          label="Success rate"
          value={`${kpis.success_rate}%`}
          sublabel={`${kpis.failed_rate}% failed`}
          icon={TrendingUp}
          tone="positive"
        />
        <KpiCard
          label="Chargebacks filed"
          value={formatNumber(kpis.chargeback_count)}
          sublabel={formatCompactINR(kpis.disputed_amount)}
          icon={AlertTriangle}
          tone="warning"
        />
        <KpiCard
          label="Chargeback ratio"
          value={`${kpis.chargeback_to_txn_ratio}%`}
          icon={ShieldAlert}
          tone="warning"
        />
        <KpiCard
          label="KYC completion"
          value={`${kpis.kyc_completion_rate}%`}
          sublabel={`${kpis.kyc_rejection_rate}% rejected`}
          icon={FileCheck2}
        />
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        <ChartCard title="Daily transaction volume" subtitle="14-day rolling window from transaction dataset" className="lg:col-span-3">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={dailyTrends}>
              <defs>
                <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFC801" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#FF9932" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="txn_date" tick={{ fill: '#9BAEAF', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => formatCompactINR(v)} tick={{ fill: '#9BAEAF', fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
              <Tooltip
                contentStyle={chartTooltipStyle}
                itemStyle={tooltipItemStyle}
                labelStyle={tooltipLabelStyle}
                formatter={(v: any) => formatCompactINR(v)}
              />
              <Area type="monotone" dataKey="total_volume" stroke="#FFC801" strokeWidth={2} fill="url(#volGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Hourly failure rate" subtitle="24h failure distribution across all gateways" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={hourlyFailures}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="hour" tick={{ fill: '#9BAEAF', fontSize: 9 }} axisLine={false} tickLine={false} interval={3} />
              <YAxis tick={{ fill: '#9BAEAF', fontSize: 11 }} axisLine={false} tickLine={false} width={30} unit="%" />
              <Tooltip
                contentStyle={chartTooltipStyle}
                itemStyle={tooltipItemStyle}
                labelStyle={tooltipLabelStyle}
                formatter={(v: any) => `${v}%`}
              />
              <Bar dataKey="failure_rate" radius={[3, 3, 0, 0]}>
                {hourlyFailures.map((d, i) => (
                  <Cell key={i} fill={d.failure_rate > 10 ? '#FF9932' : '#114C5A'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Merchant category performance" subtitle="Volume, ticket size, and dispute exposure computed across merchants master & chargebacks">
        <DataTable columns={columns} rows={categoryPerf} keyField={(r) => r.category} />
      </ChartCard>
    </div>
  );
}

import { useEffect, useState, useMemo } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RefreshCw, MapPin, AlertTriangle, TrendingUp, ShieldCheck, Activity } from 'lucide-react';
import ChartCard from '../ChartCard';
import DataTable, { type Column } from '../DataTable';
import IndiaMap from '../IndiaMap';
import { getGeoStates, getGeoCities } from '../../../lib/api';
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

interface MetroRow {
  city: string;
  txn_count: number;
  volume: number;
  dispute_ratio: number;
  failure_rate: number;
}

const columns: Column<MetroRow>[] = [
  { key: 'city', header: 'Metropolitan City', render: (r) => <span className="text-arctic font-medium">{r.city}</span> },
  { key: 'txn', header: 'Txn Count', align: 'right', render: (r) => formatNumber(r.txn_count) },
  { key: 'volume', header: 'Processed Volume', align: 'right', render: (r) => formatCompactINR(r.volume) },
  {
    key: 'dispute',
    header: 'Dispute Ratio',
    align: 'right',
    render: (r) => (
      <span className={r.dispute_ratio > 13 ? 'text-saffron font-mono font-semibold' : 'text-mystic/80 font-mono'}>
        {r.dispute_ratio}%
      </span>
    ),
  },
  {
    key: 'failure',
    header: 'Gateway Failure %',
    align: 'right',
    render: (r) => <span className="font-mono text-mystic/80">{r.failure_rate}%</span>,
  },
];

export default function GeoTab() {
  const [stateData, setStateData] = useState(REAL_DATASET_SNAPSHOT.state_data);
  const [metroLeague, setMetroLeague] = useState<MetroRow[]>(REAL_DATASET_SNAPSHOT.metro_league as any);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [st, ct] = await Promise.all([getGeoStates(), getGeoCities()]);
      if (st && st.length > 0) setStateData(st);
      if (ct && ct.length > 0) setMetroLeague(ct as any);
    } catch (e) {
      // fallback to snapshot
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalVolume = useMemo(() => stateData.reduce((acc, s) => acc + (s.volume || 0), 0), [stateData]);
  const totalTxns = useMemo(() => stateData.reduce((acc, s) => acc + (s.tx_count || 0), 0), [stateData]);
  const topDisputeState = useMemo(() => [...stateData].sort((a, b) => (b.dispute_ratio || 0) - (a.dispute_ratio || 0))[0], [stateData]);
  const lowestDisputeState = useMemo(() => [...stateData].sort((a, b) => (a.dispute_ratio || 0) - (b.dispute_ratio || 0))[0], [stateData]);
  const maxDispute = Math.max(...stateData.map((s) => s.dispute_ratio || 1));

  return (
    <div className="space-y-6">
      {/* Top Regional KPI Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-surface border border-surface-border flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-surface-dark border border-white/5 text-forsythia">
            <TrendingUp size={18} />
          </div>
          <div>
            <div className="text-[11px] text-mystic/60 uppercase tracking-wider font-semibold">Total Regional Volume</div>
            <div className="text-lg font-bold font-mono text-arctic mt-0.5">{formatCompactINR(totalVolume)}</div>
            <div className="text-[10px] text-mystic/50">{formatNumber(totalTxns)} total telemetry transactions</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-surface-border flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-surface-dark border border-white/5 text-saffron">
            <AlertTriangle size={18} />
          </div>
          <div>
            <div className="text-[11px] text-mystic/60 uppercase tracking-wider font-semibold">Max Dispute Exposure</div>
            <div className="text-lg font-bold font-mono text-saffron mt-0.5">{topDisputeState?.state || 'Maharashtra'}</div>
            <div className="text-[10px] text-mystic/50">{topDisputeState?.dispute_ratio}% chargeback ratio</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-surface-border flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-surface-dark border border-white/5 text-emerald-400">
            <ShieldCheck size={18} />
          </div>
          <div>
            <div className="text-[11px] text-mystic/60 uppercase tracking-wider font-semibold">Most Compliant Hub</div>
            <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">{lowestDisputeState?.state || 'Uttar Pradesh'}</div>
            <div className="text-[10px] text-mystic/50">{lowestDisputeState?.dispute_ratio}% chargeback (lowest risk tier)</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-surface-border flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-surface-dark border border-white/5 text-cyan-400">
            <Activity size={18} />
          </div>
          <div>
            <div className="text-[11px] text-mystic/60 uppercase tracking-wider font-semibold">Active Partition Map</div>
            <div className="text-lg font-bold font-mono text-cyan-400 mt-0.5">{stateData.length} States • {metroLeague.length} Metros</div>
            <div className="text-[10px] text-mystic/50">100% Real-time geo-telemetry sync</div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Balanced 2-Column Telemetry Grid */}
      <div className="grid lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column: Interactive India Map */}
        <div className="lg:col-span-5 flex flex-col">
          <ChartCard
            title="India Regional Telemetry Map"
            subtitle="Geospatial distribution of chargeback risks across states (Hover or click state to inspect)"
            className="flex-1 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3 text-xs text-mystic/70">
              <div className="flex items-center gap-1.5">
                <MapPin size={13} className="text-forsythia" />
                <span>{selectedState ? `Inspecting: ${selectedState}` : 'Click any state to highlight & filter'}</span>
              </div>
              {selectedState && (
                <button
                  onClick={() => setSelectedState(null)}
                  className="text-[11px] text-forsythia hover:underline font-mono"
                >
                  Reset View
                </button>
              )}
            </div>

            <div className="flex-1 flex items-center justify-center">
              <IndiaMap
                stateData={stateData}
                selectedState={selectedState}
                onSelectState={(st) => setSelectedState(selectedState === st ? null : st)}
              />
            </div>

            {/* Map Legend */}
            <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-mystic/70">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-saffron inline-block" /> ≥15% High Risk</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-forsythia inline-block" /> 11-15% Moderate</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-nocturnal inline-block" /> &lt;11% Compliant</span>
              </div>
              <span className="text-[11px] font-mono text-mystic/50">9 Active Hubs</span>
            </div>
          </ChartCard>
        </div>

        {/* Right Column: State Volume BarChart + Active State Telemetry Cards */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* State Volume & Risk Bar Chart */}
          <ChartCard
            title="State-by-state volume & dispute risk"
            subtitle="Bar height = transaction volume (₹), color intensity = chargeback ratio %"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-3 text-xs text-mystic/60">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-saffron inline-block" /> High CB Rate</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-forsythia inline-block" /> Moderate Risk</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-nocturnal inline-block" /> Baseline</span>
              </div>
              <button
                onClick={loadData}
                disabled={loading}
                className="px-2.5 py-1 border border-surface-border hover:border-forsythia/40 rounded text-xs text-forsythia flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
                <span>Sync</span>
              </button>
            </div>

            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={stateData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="state"
                  tick={{ fill: '#9BAEAF', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  angle={-15}
                  textAnchor="end"
                  height={45}
                />
                <YAxis
                  tickFormatter={(v) => formatCompactINR(v)}
                  tick={{ fill: '#9BAEAF', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={55}
                />
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  itemStyle={tooltipItemStyle}
                  labelStyle={tooltipLabelStyle}
                  formatter={(value: any, name: any) =>
                    name === 'volume' ? [formatCompactINR(value), 'Volume'] : [value, name]
                  }
                />
                <Bar dataKey="volume" radius={[3, 3, 0, 0]}>
                  {stateData.map((s, i) => {
                    const intensity = (s.dispute_ratio || 0) / maxDispute;
                    const isSelected = selectedState === s.state;
                    const color = isSelected
                      ? '#FFFFFF'
                      : intensity > 0.82
                      ? '#FF9932'
                      : intensity > 0.55
                      ? '#FFC801'
                      : '#114C5A';
                    return <Cell key={i} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Active Dataset States Partition Hubs (Fills the space cleanly) */}
          <ChartCard
            title="Active State Telemetry Partitions"
            subtitle="Click any state partition to isolate telemetry and highlight across views"
          >
            <div className="grid grid-cols-3 gap-2.5">
              {stateData.map((st) => {
                const isSelected = selectedState?.toLowerCase() === st.state.toLowerCase();
                const isHighRisk = (st.dispute_ratio || 0) >= 15.0;
                const isModerate = (st.dispute_ratio || 0) >= 11.0;

                return (
                  <button
                    key={st.state}
                    onClick={() => setSelectedState(selectedState === st.state ? null : st.state)}
                    className={`text-left p-3 rounded-xl border transition-all duration-200 ${
                      isSelected
                        ? 'bg-[#183944] border-white shadow-lg ring-1 ring-white/50'
                        : 'bg-surface-dark/70 border-white/10 hover:border-forsythia/40 hover:bg-surface-dark'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-xs font-bold font-display ${isSelected ? 'text-white' : 'text-arctic'}`}>
                        {st.state}
                      </span>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                          isHighRisk
                            ? 'bg-saffron/20 text-saffron border border-saffron/40'
                            : isModerate
                            ? 'bg-forsythia/20 text-forsythia border border-forsythia/40'
                            : 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/40'
                        }`}
                      >
                        {st.dispute_ratio}% CB
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-mystic/70 font-mono">
                      <span className="text-forsythia font-semibold">{formatCompactINR(st.volume || 0)}</span>
                      <span>{formatNumber(st.tx_count || 0)} txns</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Metro League Table (Full Width) */}
      <ChartCard
        title="Metropolitan City League Table"
        subtitle="Ranked by total payments volume, transaction frequency, and dispute exposure"
      >
        <DataTable columns={columns} rows={metroLeague} keyField={(r) => r.city} />
      </ChartCard>
    </div>
  );
}

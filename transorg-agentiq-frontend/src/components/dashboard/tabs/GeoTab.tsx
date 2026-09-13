import { useEffect, useState } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RefreshCw, MapPin } from 'lucide-react';
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
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const maxDispute = Math.max(...stateData.map((s) => s.dispute_ratio || 1));

  return (
    <div className="space-y-5">
      {/* India Map & State Bar Chart Grid */}
      <div className="grid lg:grid-cols-12 gap-5 items-start">
        {/* Interactive India Map */}
        <div className="lg:col-span-5">
          <ChartCard
            title="India Regional Telemetry Map"
            subtitle="Geospatial distribution of chargeback risks across states (Hover over any state for telemetry)"
          >
            <div className="flex items-center gap-2 mb-2 text-xs text-mystic/70">
              <MapPin size={13} className="text-forsythia" />
              <span>Click state to highlight • Color heatmap represents dispute severity</span>
            </div>
            <IndiaMap
              stateData={stateData}
              selectedState={selectedState}
              onSelectState={(st) => setSelectedState(selectedState === st ? null : st)}
            />
          </ChartCard>
        </div>

        {/* State Volume & Risk Bars */}
        <div className="lg:col-span-7">
          <ChartCard
            title="State-by-state volume & dispute risk"
            subtitle="Bar height = transaction volume (₹), color intensity = chargeback ratio % (computed from customer states)"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3 text-xs text-mystic/60">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-saffron inline-block" /> Elevated Dispute Rate</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-forsythia inline-block" /> Moderate Risk</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-nocturnal inline-block" /> Baseline</span>
              </div>
              <button
                onClick={loadData}
                disabled={loading}
                className="px-3 py-1.5 border border-surface-border hover:border-forsythia/40 rounded-md text-xs text-forsythia flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>

            <ResponsiveContainer width="100%" height={380}>
              <BarChart data={stateData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="state"
                  tick={{ fill: '#9BAEAF', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tickFormatter={(v) => formatCompactINR(v)}
                  tick={{ fill: '#9BAEAF', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={65}
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
        </div>
      </div>

      {/* Metro League Table */}
      <ChartCard
        title="Metropolitan city league table"
        subtitle="Ranked by total payments volume, transaction frequency, and dispute exposure"
      >
        <DataTable columns={columns} rows={metroLeague} keyField={(r) => r.city} />
      </ChartCard>
    </div>
  );
}

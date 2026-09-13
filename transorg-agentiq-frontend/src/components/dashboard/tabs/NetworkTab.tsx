import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import ChartCard from '../ChartCard';
import DataTable, { type Column } from '../DataTable';
import { getGraphNetworkData, getGraphSyndicates } from '../../../lib/api';
import { REAL_DATASET_SNAPSHOT } from '../../../lib/datasetSnapshot';
import { formatCompactINR } from '../../../lib/utils';

interface RingRow {
  ring_id: string;
  members: number;
  hub_merchant: string;
  total_volume: number;
  pagerank_max: number;
}

interface HubRow {
  hub_id: string;
  cycle_length: number;
  merchants_involved: number;
  est_amount_recycled: number;
}

const ringColumns: Column<RingRow>[] = [
  { key: 'ring', header: 'Ring ID', render: (r) => <span className="mono text-arctic font-medium">{r.ring_id}</span> },
  { key: 'members', header: 'Entity Count', align: 'right', render: (r) => r.members },
  { key: 'hub', header: 'Disputed Hub Merchant', render: (r) => <span className="text-saffron font-medium">{r.hub_merchant}</span> },
  { key: 'volume', header: 'Exposure Volume', align: 'right', render: (r) => formatCompactINR(r.total_volume) },
  { key: 'pr', header: 'Max PageRank', align: 'right', render: (r) => <span className="font-mono text-forsythia">{r.pagerank_max.toFixed(2)}</span> },
];

const hubColumns: Column<HubRow>[] = [
  { key: 'hub', header: 'Hub ID', render: (r) => <span className="mono text-arctic font-medium">{r.hub_id}</span> },
  { key: 'cycle', header: 'Cycle Degree', align: 'right', render: (r) => `${r.cycle_length}-hop` },
  { key: 'merchants', header: 'Inbound Flow Count', align: 'right', render: (r) => r.merchants_involved },
  { key: 'amount', header: 'Est. Recycled Volume', align: 'right', render: (r) => formatCompactINR(r.est_amount_recycled) },
];

export default function NetworkTab() {
  const [networkData, setNetworkData] = useState({
    nodes: REAL_DATASET_SNAPSHOT.network_nodes,
    edges: REAL_DATASET_SNAPSHOT.network_edges,
  });
  const [syndicates, setSyndicates] = useState({
    fraud_rings: REAL_DATASET_SNAPSHOT.fraud_rings,
    laundering_hubs: REAL_DATASET_SNAPSHOT.laundering_hubs,
  });
  const [hovered, setHovered] = useState<(typeof REAL_DATASET_SNAPSHOT.network_nodes)[number] | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [net, syn] = await Promise.all([
        getGraphNetworkData(),
        getGraphSyndicates(),
      ]);
      if (net?.nodes && net.nodes.length > 0) setNetworkData(net);
      if (syn?.fraud_rings) setSyndicates(syn as any);
    } catch (e) {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const nodeById = (id: string) => networkData.nodes.find((n) => n.id === id);

  return (
    <div className="space-y-5">
      <ChartCard
        title="Bipartite syndicate network topology"
        subtitle="NetworkX graph generated from customer-to-merchant transaction edges & dispute links"
      >
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-4 text-xs text-mystic/60">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-forsythia inline-block" /> Customer Nodes (Yellow)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-saffron inline-block" /> Disputed Merchants (Orange)
            </span>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3 py-1.5 border border-surface-border hover:border-forsythia/40 rounded-md text-xs text-forsythia flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            <span>Recompute centrality</span>
          </button>
        </div>

        <div className="relative w-full aspect-[16/9] rounded-md bg-white/[0.015] border border-surface-border overflow-hidden">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {networkData.edges.map(([a, b], i) => {
              const na = nodeById(a);
              const nb = nodeById(b);
              if (!na || !nb) return null;
              const isHighlighted = hovered && (hovered.id === a || hovered.id === b);
              return (
                <line
                  key={i}
                  x1={na.x}
                  y1={na.y}
                  x2={nb.x}
                  y2={nb.y}
                  stroke={isHighlighted ? '#FFC801' : '#114C5A'}
                  strokeWidth={isHighlighted ? 0.8 : 0.35}
                  opacity={isHighlighted ? 0.95 : 0.55}
                />
              );
            })}
            {networkData.nodes.map((n) => (
              <g
                key={n.id}
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(null)}
                className="cursor-pointer transition-transform"
              >
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={n.type === 'merchant' ? 2.6 + n.pagerank * 2.2 : 1.8 + n.pagerank * 1.5}
                  fill={n.type === 'merchant' ? '#FF9932' : '#FFC801'}
                  opacity={hovered && hovered.id !== n.id ? 0.4 : 0.95}
                  stroke={hovered?.id === n.id ? '#FFFFFF' : 'none'}
                  strokeWidth={0.6}
                />
              </g>
            ))}
          </svg>

          {hovered && (
            <div className="absolute top-3 left-3 glass-panel px-3.5 py-2.5 text-xs mono border-forsythia/40 shadow-card">
              <p className="text-arctic font-semibold text-sm">{hovered.id}</p>
              <p className="text-mystic/60">{hovered.type === 'merchant' ? 'Disputed Merchant Node' : 'Customer Account'}</p>
              <p className="text-forsythia font-mono mt-1">PageRank Centrality: {hovered.pagerank.toFixed(2)}</p>
              <p className="text-[10px] text-mystic/40">Status: Active In Graph Topology</p>
            </div>
          )}
        </div>
      </ChartCard>

      <div className="grid lg:grid-cols-2 gap-5">
        <ChartCard
          title="Shared syndicate fraud rings"
          subtitle="User pairs transacting across multiple identical disputed merchants"
        >
          <DataTable columns={ringColumns} rows={syndicates.fraud_rings} keyField={(r) => r.ring_id} />
        </ChartCard>
        <ChartCard
          title="Circular laundering & high-degree hubs"
          subtitle="Entities exhibiting dense in-degree concentrations in directed payment graphs"
        >
          <DataTable columns={hubColumns} rows={syndicates.laundering_hubs} keyField={(r) => r.hub_id} />
        </ChartCard>
      </div>
    </div>
  );
}

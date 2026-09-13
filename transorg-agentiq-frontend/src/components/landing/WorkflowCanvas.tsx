import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  CheckCircle2,
  Lock,
  FileText,
  Cpu,
  ArrowRight,
  Volume2,
  VolumeX
} from 'lucide-react';
import { speakText, stopSpeech } from '../../lib/speech';

interface WorkflowNode {
  id: string;
  name: string;
  type: 'source' | 'process' | 'model' | 'action';
  x: number; // Center X in 1200-width virtual canvas
  y: number; // Center Y in 360-height virtual canvas
  width: number; // Exact card width in virtual coordinates for pixel-perfect port docking
  badge?: string;
  description: string;
  metric?: string;
}

interface WorkflowTabConfig {
  id: string;
  name: string;
  count: number;
  agentName: string;
  agentSub: string;
  nodes: WorkflowNode[];
  connections: { from: string; to: string }[];
}

// Helper to compute exact port docking coordinates for each node
function getNodeBounds(node: WorkflowNode) {
  const w = node.width;
  const h = 28;
  return {
    left: node.x - w / 2,
    right: node.x + w / 2,
    top: node.y - h / 2,
    bottom: node.y + h / 2,
    width: w,
    height: h,
    inPort: { x: node.x - w / 2, y: node.y },
    outPort: { x: node.x + w / 2, y: node.y },
  };
}

// 1100 x 280 Virtual Vector Canvas Coordinate Grid with horizontal docking bounds
const WORKFLOW_CONFIGS: WorkflowTabConfig[] = [
  {
    id: 'agents',
    name: 'Agents',
    count: 16,
    agentName: 'Agent: FinTech Fraud & Syndicate Sentinel',
    agentSub: 'Running · 16 nodes · 20k events · p99 12ms',
    nodes: [
      {
        id: 'src-upi',
        name: 'UPI Switch Stream',
        type: 'source',
        x: 95,
        y: 70,
        width: 135,
        description: '20,000 real-time transaction events ingested across 9 Indian states with UTR hash indexing.',
        metric: '20,000 txns'
      },
      {
        id: 'src-cb',
        name: 'Dispute Webhooks',
        type: 'source',
        x: 95,
        y: 210,
        width: 135,
        description: '2,800 chargeback dispute filings with reason code parsing and statutory 7-day SLA tracking.',
        metric: '2,800 disputes'
      },
      {
        id: 'proc-rescue',
        name: 'Data Rescue Core',
        type: 'process',
        x: 300,
        y: 140,
        width: 145,
        badge: 'L1 Cleaned',
        description: 'Regex PAN/Aadhaar sanitization, deduplication, timestamp normalization, and relational schema validation.',
        metric: '100% Cleaned'
      },
      {
        id: 'proc-isoforest',
        name: 'Isolation Forest',
        type: 'model',
        x: 525,
        y: 70,
        width: 155,
        badge: 'ML Anomaly',
        description: 'Unsupervised tree isolation detects velocity bursts, sudden spikes, and multi-card retry anomalies.',
        metric: 'Spike Score'
      },
      {
        id: 'proc-networkx',
        name: 'NetworkX Graph',
        type: 'model',
        x: 525,
        y: 210,
        width: 155,
        badge: 'Syndicate AI',
        description: 'PageRank centrality and circular flow analysis identifies shared merchant fraud rings and layering hubs.',
        metric: 'PageRank >0.85'
      },
      {
        id: 'proc-gemini',
        name: 'Gemini 3.6 Flash',
        type: 'model',
        x: 750,
        y: 140,
        width: 150,
        badge: 'AI Copilot',
        description: 'Natural language intent parsing transforms queries into dynamic SQL aggregations, charts, and voice briefings.',
        metric: 'p99 180ms'
      },
      {
        id: 'act-sar',
        name: 'Auto-SAR Dossier',
        type: 'action',
        x: 970,
        y: 70,
        width: 150,
        badge: 'FIU-IND',
        description: 'Automated generation of statutory Suspicious Activity Reports (SAR) with tamper-evident evidence logs.',
        metric: 'Statutory PDF'
      },
      {
        id: 'act-lock',
        name: 'Payout Lockdown',
        type: 'action',
        x: 970,
        y: 210,
        width: 150,
        badge: 'Circuit Breaker',
        description: 'Freezes merchant settlement account upon policy breach and dispatches instant security alerts.',
        metric: 'Sub-12ms Lock'
      },
    ],
    connections: [
      { from: 'src-upi', to: 'proc-rescue' },
      { from: 'src-cb', to: 'proc-rescue' },
      { from: 'proc-rescue', to: 'proc-isoforest' },
      { from: 'proc-rescue', to: 'proc-networkx' },
      { from: 'proc-isoforest', to: 'proc-gemini' },
      { from: 'proc-networkx', to: 'proc-gemini' },
      { from: 'proc-gemini', to: 'act-sar' },
      { from: 'proc-gemini', to: 'act-lock' },
    ]
  },
  {
    id: 'pipelines',
    name: 'Pipelines',
    count: 4,
    agentName: 'Pipeline: Ingestion, Validation & Metrics Engine',
    agentSub: 'Active · 4 Datasets Cleaned · SQL Schema Ready · SQLite & DuckDB',
    nodes: [
      {
        id: 'p-tx',
        name: 'transactions.csv',
        type: 'source',
        x: 160,
        y: 70,
        width: 170,
        description: '20k transaction records with timestamps, amounts, statuses, and UPI switches.',
        metric: '₹23.92 Cr Volume'
      },
      {
        id: 'p-kyc',
        name: 'customers.csv',
        type: 'source',
        x: 160,
        y: 210,
        width: 170,
        description: '28,920 customers with KYC statuses, PAN format verification, and Aadhaar linkage.',
        metric: '28.9k Entities'
      },
      {
        id: 'p-engine',
        name: 'Data Rescue Transformer',
        type: 'process',
        x: 550,
        y: 140,
        width: 210,
        badge: 'Data Layer',
        description: 'Handles corrupt dates, missing values, duplicates, and standardizes categorical features.',
        metric: 'Zero NULL Leaks'
      },
      {
        id: 'p-db',
        name: 'Indexed Analytics Model',
        type: 'action',
        x: 930,
        y: 70,
        width: 200,
        badge: 'Query Ready',
        description: 'Structured database model powering sub-millisecond BI KPI metrics and regional telemetry.',
        metric: 'SQLite Store'
      },
      {
        id: 'p-cache',
        name: 'DuckDB Analytical Cache',
        type: 'action',
        x: 930,
        y: 210,
        width: 200,
        badge: 'Columnar Store',
        description: 'High-speed columnar analytics cache for instantaneous multi-dimensional drill-downs.',
        metric: 'Vector Engine'
      }
    ],
    connections: [
      { from: 'p-tx', to: 'p-engine' },
      { from: 'p-kyc', to: 'p-engine' },
      { from: 'p-engine', to: 'p-db' },
      { from: 'p-engine', to: 'p-cache' }
    ]
  },
  {
    id: 'datasets',
    name: 'Datasets',
    count: 4,
    agentName: 'Dataset Mesh: 4 Cleaned & Unified Tables',
    agentSub: 'Integrated · Transactions · Customers · Merchants · Chargebacks',
    nodes: [
      {
        id: 'd-mch',
        name: 'merchants.csv',
        type: 'source',
        x: 160,
        y: 70,
        width: 170,
        description: '4,343 merchant accounts across 10 categories with active settlement verification.',
        metric: '4,343 Accounts'
      },
      {
        id: 'd-cb',
        name: 'chargebacks.csv',
        type: 'source',
        x: 160,
        y: 210,
        width: 170,
        description: '2,800 chargeback disputes linked to transactions and customer IDs.',
        metric: '2,800 Disputes'
      },
      {
        id: 'd-risk',
        name: 'Composite Risk Engine',
        type: 'model',
        x: 550,
        y: 140,
        width: 210,
        badge: 'Scorecard 0-100',
        description: 'Calculates multi-dimensional risk scores combining dispute ratio, velocity, and settlement status.',
        metric: 'Scoring Formula'
      },
      {
        id: 'd-kpi',
        name: 'Executive Dashboard Sync',
        type: 'action',
        x: 930,
        y: 70,
        width: 200,
        badge: '9-Tab Control',
        description: 'Live telemetry feeds into interactive React command center and Sentinel alerts.',
        metric: 'Real-time Sync'
      },
      {
        id: 'd-telemetry',
        name: 'Sentinel Telemetry Bus',
        type: 'action',
        x: 930,
        y: 210,
        width: 200,
        badge: 'Event Broker',
        description: 'Publishes categorized anomaly streams for automated incident triage and audit records.',
        metric: 'Live Stream'
      }
    ],
    connections: [
      { from: 'd-mch', to: 'd-risk' },
      { from: 'd-cb', to: 'd-risk' },
      { from: 'd-risk', to: 'd-kpi' },
      { from: 'd-risk', to: 'd-telemetry' }
    ]
  },
  {
    id: 'triggers',
    name: 'Triggers',
    count: 7,
    agentName: 'Trigger: Automated Policy Enforcement',
    agentSub: 'Autonomous · SLA Breaches · Spike Bursts · Syndicate Flags',
    nodes: [
      {
        id: 't-sla',
        name: '7-Day SLA Breach',
        type: 'source',
        x: 160,
        y: 70,
        width: 170,
        description: 'Detects reporting delays exceeding 7 days mandated by statutory payment guidelines.',
        metric: '>7d Delay Flag'
      },
      {
        id: 't-spike',
        name: 'Velocity Burst Attack',
        type: 'source',
        x: 160,
        y: 210,
        width: 170,
        description: 'Micro-transaction flood (>50 txns in minutes) triggers isolation forest alert.',
        metric: 'Velocity Spike'
      },
      {
        id: 't-eval',
        name: 'Threat Sentinel Evaluator',
        type: 'process',
        x: 550,
        y: 140,
        width: 210,
        badge: 'Automated DAG',
        description: 'Evaluates composite risk thresholds and initiates multi-channel mitigation workflows.',
        metric: 'p99 8ms'
      },
      {
        id: 't-dispatch',
        name: 'Resend Email Alert',
        type: 'action',
        x: 930,
        y: 70,
        width: 200,
        badge: 'Instant Alert',
        description: 'Dispatches high-priority email notification to compliance desk via Resend API.',
        metric: 'Zero-latency'
      },
      {
        id: 't-sar',
        name: 'Auto-SAR PDF Dossier',
        type: 'action',
        x: 930,
        y: 210,
        width: 200,
        badge: 'FIU-IND Ready',
        description: 'Packages transaction forensics, user KYC, and dispute chains into regulatory filing documents.',
        metric: 'Statutory PDF'
      }
    ],
    connections: [
      { from: 't-sla', to: 't-eval' },
      { from: 't-spike', to: 't-eval' },
      { from: 't-eval', to: 't-dispatch' },
      { from: 't-eval', to: 't-sar' }
    ]
  },
  {
    id: 'observability',
    name: 'Observability',
    count: 9,
    agentName: 'Observability: Tamper-Evident Audit & Telemetry',
    agentSub: 'Immutable Logging · Sha256 Audit Trail · User Auth · MFA Verified',
    nodes: [
      {
        id: 'o-auth',
        name: 'TOTP Multi-Factor Auth',
        type: 'source',
        x: 160,
        y: 70,
        width: 180,
        description: 'Cryptographic time-based one-time password (TOTP) verification with live QR enrollment.',
        metric: 'RFC 6238'
      },
      {
        id: 'o-session',
        name: 'RBAC Session Guard',
        type: 'source',
        x: 160,
        y: 210,
        width: 180,
        description: 'Role-based access token verification enforcing strict compliance desk permissions.',
        metric: 'Bearer Tokens'
      },
      {
        id: 'o-audit',
        name: 'Zero-Trust Audit Logger',
        type: 'process',
        x: 550,
        y: 140,
        width: 210,
        badge: 'Zero-Trust',
        description: 'Records all analyst actions, AI queries, sandbox simulations, and SAR downloads with cryptographic hashes.',
        metric: 'Append-Only'
      },
      {
        id: 'o-dash',
        name: 'Executive PDF Dossier',
        type: 'action',
        x: 930,
        y: 70,
        width: 200,
        badge: 'FPDF2 Engine',
        description: 'One-click high-resolution PDF compliance report generation for executive review.',
        metric: 'Statutory PDF'
      },
      {
        id: 'o-trail',
        name: 'Immutable Audit Trail',
        type: 'action',
        x: 930,
        y: 210,
        width: 200,
        badge: 'SHA-256 Logs',
        description: 'Tamper-evident audit storage guaranteeing full traceability for regulatory oversight.',
        metric: 'Cryptographic'
      }
    ],
    connections: [
      { from: 'o-auth', to: 'o-audit' },
      { from: 'o-session', to: 'o-audit' },
      { from: 'o-audit', to: 'o-dash' },
      { from: 'o-audit', to: 'o-trail' }
    ]
  },
  {
    id: 'models',
    name: 'Models',
    count: 4,
    agentName: 'AI Model Mesh: Isolation Forest · K-Means · NetworkX · Gemini',
    agentSub: 'Multi-Model Pipeline · Unsupervised Anomaly Detection · GenAI Reasoning',
    nodes: [
      {
        id: 'm-iso',
        name: 'Isolation Forest ML',
        type: 'model',
        x: 160,
        y: 70,
        width: 170,
        description: 'Detects velocity outliers and high-frequency micro-payment anomalies.',
        metric: 'Anomaly Model'
      },
      {
        id: 'm-km',
        name: 'K-Means 4-Cluster',
        type: 'model',
        x: 160,
        y: 210,
        width: 170,
        description: 'Segments 28,920 customers into 4 distinct behavioral risk archetypes.',
        metric: 'Behavior Model'
      },
      {
        id: 'm-nx',
        name: 'NetworkX Graph Engine',
        type: 'model',
        x: 550,
        y: 140,
        width: 210,
        badge: 'Graph Theory',
        description: 'Bipartite projection, PageRank centrality, and cycle finding for money laundering rings.',
        metric: 'PageRank Hubs'
      },
      {
        id: 'm-gem',
        name: 'Gemini 3.6 Flash Copilot',
        type: 'action',
        x: 930,
        y: 70,
        width: 200,
        badge: 'GenAI Reasoning',
        description: 'Translates natural language questions into dynamic charts with voice synthesis narrative.',
        metric: 'Natural Language'
      },
      {
        id: 'm-tts',
        name: 'Voice Intelligence (TTS)',
        type: 'action',
        x: 930,
        y: 210,
        width: 200,
        badge: 'Speech Engine',
        description: 'Spoken narrative briefings summarizing risk insights directly from query results.',
        metric: 'Real-time TTS'
      }
    ],
    connections: [
      { from: 'm-iso', to: 'm-nx' },
      { from: 'm-km', to: 'm-nx' },
      { from: 'm-nx', to: 'm-gem' },
      { from: 'm-nx', to: 'm-tts' }
    ]
  }
];

export default function WorkflowCanvas({ onLaunch }: { onLaunch: () => void }) {
  const [activeTab, setActiveTab] = useState<string>('agents');
  const [hoveredNode, setHoveredNode] = useState<WorkflowNode | null>(null);
  const [speakingNodeId, setSpeakingNodeId] = useState<string | null>(null);

  const toggleNodeAudio = (node: WorkflowNode) => {
    if (speakingNodeId === node.id) {
      stopSpeech();
      setSpeakingNodeId(null);
      return;
    }

    stopSpeech();
    const narration = `AgentIQ Pipeline Node: ${node.name}. ${node.description} Telemetry metric: ${node.metric || 'Real-time telemetry active'}.`;
    speakText(
      narration,
      () => setSpeakingNodeId(node.id),
      () => setSpeakingNodeId(null),
      () => setSpeakingNodeId(null)
    );
  };

  const activeConfig = WORKFLOW_CONFIGS.find((c) => c.id === activeTab) || WORKFLOW_CONFIGS[0];

  return (
    <section id="workflow" className="py-14 px-4 sm:px-6 relative w-full">
      {/* Sleek Compact Main Outer Container */}
      <div className="w-full max-w-5xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-8"
        >
          <div className="eyebrow inline-flex items-center gap-1.5 text-[10px] font-medium px-3 py-1 rounded-full mb-3 border border-forsythia/30 bg-forsythia/10 text-forsythia">
            <Zap size={11} />
            <span>Interactive Workflow Canvas</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-arctic tracking-tight mb-2.5">
            Autonomous Graph Agent Pipeline
          </h2>
          <p className="text-mystic/70 text-xs sm:text-sm leading-relaxed">
            Explore how AgentIQ ingests raw UPI streams, rescues messy datasets, executes multi-model machine learning, and triggers autonomous compliance actions in sub-12ms.
          </p>
        </motion.div>

        {/* Outer macOS-Style Glass Workflow Container */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full rounded-xl border border-forsythia/25 bg-[#10232B]/95 backdrop-blur-xl shadow-2xl overflow-hidden"
        >
          {/* Top Window Header Bar */}
          <div className="px-4 py-2.5 border-b border-surface-border flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] inline-block opacity-80" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] inline-block opacity-80" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] inline-block opacity-80" />
              <span className="text-[11px] mono text-mystic/40 ml-2 font-medium">agent-workflow-orchestrator.dag</span>
            </div>

            <div className="flex items-center gap-3 text-[11px]">
              <span className="mono text-mystic/50 hidden sm:inline text-[10px]">ENGINE: AGENTIC GRAPH AI</span>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 font-mono text-[9px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>LIVE TELEMETRY</span>
              </div>
            </div>
          </div>

          {/* Body: Left Sidebar + Fully Expanded Graph Canvas */}
          <div className="flex flex-col lg:flex-row min-h-[420px] w-full">
            {/* Left Sidebar: Compact Width (200px) */}
            <div className="w-full lg:w-48 lg:shrink-0 border-r border-surface-border bg-black/20 p-3.5 space-y-1.5 flex flex-col justify-between">
              <div className="space-y-1">
                <p className="text-[9px] mono uppercase tracking-wider text-mystic/40 px-2 py-0.5 font-semibold">Platform Topology</p>
                {WORKFLOW_CONFIGS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setHoveredNode(null);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-xs transition-all duration-200 ${
                        isActive
                          ? 'bg-forsythia/15 text-forsythia font-semibold border border-forsythia/40 shadow-sm'
                          : 'text-mystic/70 hover:text-arctic hover:bg-white/[0.03] border border-transparent'
                      }`}
                    >
                      <span className="capitalize">{tab.name}</span>
                      <span
                        className={`text-[10px] mono px-1.5 py-0.2 rounded ${
                          isActive
                            ? 'bg-forsythia/20 text-forsythia font-bold'
                            : 'bg-white/[0.04] text-mystic/40'
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Sidebar Quick Action Button */}
              <div className="pt-3 border-t border-surface-border/50">
                <button
                  onClick={onLaunch}
                  className="w-full py-2 px-3 rounded-md bg-gradient-to-r from-forsythia to-saffron text-oceanic text-xs font-semibold flex items-center justify-center gap-1.5 hover:shadow-glow transition-shadow"
                >
                  <span>Launch Live UI</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>

            {/* Main Expanded Graph Area */}
            <div className="flex-1 min-w-0 p-4 sm:p-5 flex flex-col justify-between relative bg-radial-gradient">
              {/* Canvas Agent Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-surface-border/60">
                <div>
                  <h3 className="text-sm sm:text-base font-display font-semibold text-arctic flex items-center gap-2">
                    <span>{activeConfig.agentName}</span>
                  </h3>
                  <p className="text-[11px] text-mystic/60 mono mt-0.5">{activeConfig.agentSub}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] mono text-forsythia px-2.5 py-0.5 rounded bg-forsythia/10 border border-forsythia/25 font-medium">
                    100% Deterministic &amp; Traced
                  </span>
                </div>
              </div>

              {/* Inner Graph Canvas (Responsive 1100x280 coordinate viewport) */}
              <div className="relative w-full h-[250px] my-2.5 rounded-lg bg-white/[0.015] border border-surface-border/40 overflow-hidden flex items-center justify-center select-none shadow-inner">
                {/* Background Grid Pattern */}
                <div
                  className="absolute inset-0 opacity-[0.035] pointer-events-none"
                  style={{
                    backgroundImage: `linear-gradient(to right, #D9E8E2 1px, transparent 1px), linear-gradient(to bottom, #D9E8E2 1px, transparent 1px)`,
                    backgroundSize: '28px 28px',
                  }}
                />

                {/* Vector Canvas Container (1100 x 280 virtual space) */}
                <div className="relative w-full h-full">
                  {/* SVG Spline Curves */}
                  <svg
                    viewBox="0 0 1100 280"
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <filter id="splineGlow" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>

                      <filter id="nodeDotGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3.5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>

                    {/* Render Glowing Spline Connections with strictly horizontal tangent docking */}
                    {activeConfig.connections.map((conn, idx) => {
                      const fromNode = activeConfig.nodes.find((n) => n.id === conn.from);
                      const toNode = activeConfig.nodes.find((n) => n.id === conn.to);
                      if (!fromNode || !toNode) return null;

                      // Exact port coordinates
                      const fromBounds = getNodeBounds(fromNode);
                      const toBounds = getNodeBounds(toNode);

                      const startX = fromBounds.outPort.x;
                      const startY = fromBounds.outPort.y;
                      const endX = toBounds.inPort.x;
                      const endY = toBounds.inPort.y;

                      const dx = endX - startX;
                      const curvature = Math.max(20, dx * 0.45);

                      // Strictly horizontal cubic Bezier tangents at both ends
                      const cp1x = startX + curvature;
                      const cp1y = startY;
                      const cp2x = endX - curvature;
                      const cp2y = endY;

                      const pathD = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;

                      return (
                        <g key={`${conn.from}-${conn.to}-${idx}`}>
                          {/* Background shadow path */}
                          <path
                            d={pathD}
                            fill="none"
                            stroke="#10232B"
                            strokeWidth="5"
                            opacity="0.95"
                          />
                          {/* Vibrant golden glowing connecting spline */}
                          <path
                            d={pathD}
                            fill="none"
                            stroke="#FFC801"
                            strokeWidth="2"
                            strokeDasharray="4 2"
                            filter="url(#splineGlow)"
                          />
                          {/* Source Output Port Anchor Pin */}
                          <circle
                            cx={startX}
                            cy={startY}
                            r="3.5"
                            fill="#FFC801"
                            filter="url(#nodeDotGlow)"
                          />
                          <circle cx={startX} cy={startY} r="1.2" fill="#10232B" />
                          {/* Target Input Port Anchor Pin */}
                          <circle
                            cx={endX}
                            cy={endY}
                            r="3.5"
                            fill="#FF9932"
                            filter="url(#nodeDotGlow)"
                          />
                          <circle cx={endX} cy={endY} r="1.2" fill="#10232B" />
                          {/* Animated traveling data particle */}
                          <circle r="2.5" fill="#FFFFFF" filter="url(#nodeDotGlow)">
                            <animateMotion
                              path={pathD}
                              dur={`${1.8 + (idx % 3) * 0.5}s`}
                              repeatCount="indefinite"
                            />
                          </circle>
                        </g>
                      );
                    })}
                  </svg>

                  {/* Render Interactive Node Badges (Scaled 1100x280) */}
                  {activeConfig.nodes.map((node) => {
                    const isHovered = hoveredNode?.id === node.id;
                    const isSource = node.type === 'source';
                    const isAction = node.type === 'action';
                    const isModel = node.type === 'model';

                    return (
                      <div
                        key={node.id}
                        style={{
                          left: `${(node.x / 1100) * 100}%`,
                          top: `${(node.y / 280) * 100}%`,
                          width: `${(node.width / 1100) * 100}%`,
                        }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                        onMouseEnter={() => setHoveredNode(node)}
                        onMouseLeave={() => setHoveredNode(null)}
                        onClick={() => setHoveredNode(node)}
                      >
                        <div
                          className={`w-full h-[28px] px-2 rounded-full text-xs flex items-center justify-between gap-1 border transition-all duration-300 shadow-md backdrop-blur-md overflow-hidden ${
                            isHovered
                              ? 'border-forsythia bg-[#142A34] scale-105 shadow-glow z-30 ring-1 ring-forsythia/40'
                              : isSource
                              ? 'border-surface-border bg-[#10232B]/95 hover:border-forsythia/40 text-arctic'
                              : isAction
                              ? 'border-saffron/70 bg-[#172B36]/95 hover:border-saffron text-arctic'
                              : isModel
                              ? 'border-forsythia/70 bg-[#172B36]/95 hover:border-forsythia text-arctic'
                              : 'border-white/10 bg-[#172B36]/95 text-arctic'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 min-w-0 shrink">
                            <span
                              className={`w-1.5 h-1.5 rounded-full inline-block shrink-0 ${
                                isAction
                                  ? 'bg-saffron'
                                  : isModel
                                  ? 'bg-forsythia'
                                  : 'bg-emerald-400'
                              }`}
                            />
                            <span className="font-semibold truncate text-[10px] sm:text-[10.5px] text-arctic">{node.name}</span>
                          </div>
                          {node.badge && (
                            <span
                              className={`text-[7.5px] sm:text-[8px] mono px-1.5 py-0.2 rounded-full font-bold shrink-0 tracking-tight whitespace-nowrap ${
                                isAction
                                  ? 'bg-saffron/20 text-saffron border border-saffron/40'
                                  : isModel
                                  ? 'bg-forsythia/20 text-forsythia border border-forsythia/40'
                                  : 'bg-white/10 text-mystic/90 border border-white/15'
                              }`}
                            >
                              {node.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Floating Node Details Inspector HUD */}
                <AnimatePresence>
                  {hoveredNode && (
                    <motion.div
                      key={hoveredNode.id}
                      initial={{ opacity: 0, y: hoveredNode.y > 140 ? -8 : 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: hoveredNode.y > 140 ? -5 : 5, scale: 0.98 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className={`absolute inset-x-3 p-2.5 rounded-lg border border-forsythia/50 bg-[#10232B]/98 backdrop-blur-2xl shadow-xl z-40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pointer-events-auto ring-1 ring-forsythia/25 ${
                        hoveredNode.y > 140 ? 'top-2' : 'bottom-2'
                      }`}
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="w-2 h-2 rounded-full bg-forsythia animate-pulse" />
                          <span className="text-[11px] mono font-bold text-forsythia uppercase tracking-wider">
                            Node: {hoveredNode.name}
                          </span>
                          {hoveredNode.badge && (
                            <span className="text-[9px] mono px-2 py-0.2 rounded-full bg-forsythia/20 text-forsythia font-bold border border-forsythia/30">
                              {hoveredNode.badge}
                            </span>
                          )}
                          <span className="text-[9px] mono text-mystic/50 px-1.5 py-0.2 rounded bg-white/[0.04] border border-white/5">
                            ID: {hoveredNode.id}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#D9E8E2] leading-relaxed max-w-2xl font-medium">
                          {hoveredNode.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => toggleNodeAudio(hoveredNode)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-md border text-[11px] font-mono font-medium transition-all ${
                            speakingNodeId === hoveredNode.id
                              ? 'bg-saffron/20 border-saffron text-saffron animate-pulse'
                              : 'bg-forsythia/10 border-forsythia/30 text-forsythia hover:bg-forsythia/20'
                          }`}
                          title="Listen to voice narration"
                        >
                          {speakingNodeId === hoveredNode.id ? <VolumeX size={12} /> : <Volume2 size={12} />}
                          <span>{speakingNodeId === hoveredNode.id ? 'Mute' : 'TTS'}</span>
                        </button>

                        {hoveredNode.metric && (
                          <div className="text-right bg-white/[0.04] px-2.5 py-1 rounded-md border border-surface-border">
                            <span className="text-[8px] mono text-mystic/60 block uppercase">Telemetry</span>
                            <span className="text-[11px] font-mono font-bold text-forsythia">{hoveredNode.metric}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom Quick Metric Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-surface-border/50 text-[11px]">
                <div className="flex items-center gap-1.5 text-mystic/70">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  <span>20k Txns Verified</span>
                </div>
                <div className="flex items-center gap-1.5 text-mystic/70">
                  <Cpu size={13} className="text-forsythia shrink-0" />
                  <span>Gemini 3.6 Flash</span>
                </div>
                <div className="flex items-center gap-1.5 text-mystic/70">
                  <Lock size={13} className="text-saffron shrink-0" />
                  <span>TOTP MFA Auth</span>
                </div>
                <div className="flex items-center gap-1.5 text-mystic/70">
                  <FileText size={13} className="text-arctic shrink-0" />
                  <span>Auto-SAR Export</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

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
  const h = 38;
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

// 1200 x 360 Virtual Vector Canvas Coordinate Grid with horizontal docking bounds
const WORKFLOW_CONFIGS: WorkflowTabConfig[] = [
  {
    id: 'agents',
    name: 'Agents',
    count: 49,
    agentName: 'Agent: FinTech Fraud & Syndicate Sentinel',
    agentSub: 'Running · 16 nodes · 20k events/min · p99 12ms',
    nodes: [
      {
        id: 'src-upi',
        name: 'UPI Switch Stream',
        type: 'source',
        x: 105,
        y: 85,
        width: 170,
        description: '20,000 real-time transaction events ingested across 9 Indian states with UTR hash indexing.',
        metric: '20,000 txns'
      },
      {
        id: 'src-cb',
        name: 'Dispute Webhooks',
        type: 'source',
        x: 105,
        y: 275,
        width: 170,
        description: '2,800 chargeback dispute filings with reason code parsing and statutory 7-day SLA tracking.',
        metric: '2,800 disputes'
      },
      {
        id: 'proc-rescue',
        name: 'Data Rescue Core',
        type: 'process',
        x: 345,
        y: 180,
        width: 220,
        badge: 'L1 Cleaned',
        description: 'Regex PAN/Aadhaar sanitization, deduplication, timestamp normalization, and relational schema validation.',
        metric: '100% Cleaned'
      },
      {
        id: 'proc-isoforest',
        name: 'Isolation Forest',
        type: 'model',
        x: 585,
        y: 85,
        width: 220,
        badge: 'ML Anomaly',
        description: 'Unsupervised tree isolation detects velocity bursts, sudden spikes, and multi-card retry anomalies.',
        metric: 'Spike Score'
      },
      {
        id: 'proc-networkx',
        name: 'NetworkX Graph',
        type: 'model',
        x: 585,
        y: 275,
        width: 220,
        badge: 'Syndicate AI',
        description: 'PageRank centrality and circular flow analysis identifies shared merchant fraud rings and layering hubs.',
        metric: 'PageRank >0.85'
      },
      {
        id: 'proc-gemini',
        name: 'Gemini 3.6 Flash',
        type: 'model',
        x: 825,
        y: 180,
        width: 220,
        badge: 'AI Copilot',
        description: 'Natural language intent parsing transforms queries into dynamic SQL aggregations, charts, and voice briefings.',
        metric: 'p99 180ms'
      },
      {
        id: 'act-sar',
        name: 'Auto-SAR Dossier',
        type: 'action',
        x: 1065,
        y: 85,
        width: 230,
        badge: 'FIU-IND',
        description: 'Automated generation of statutory Suspicious Activity Reports (SAR) with tamper-evident evidence logs.',
        metric: 'Statutory PDF'
      },
      {
        id: 'act-lock',
        name: 'Payout Lockdown',
        type: 'action',
        x: 1065,
        y: 275,
        width: 230,
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
    count: 57,
    agentName: 'Pipeline: Ingestion, Validation & Metrics Engine',
    agentSub: 'Active · 4 Datasets Cleaned · SQL Schema Ready · SQLite & DuckDB',
    nodes: [
      {
        id: 'p-tx',
        name: 'transactions.csv',
        type: 'source',
        x: 160,
        y: 85,
        width: 220,
        description: '20k transaction records with timestamps, amounts, statuses, and UPI switches.',
        metric: '₹7.64 Cr Volume'
      },
      {
        id: 'p-kyc',
        name: 'customers.csv',
        type: 'source',
        x: 160,
        y: 275,
        width: 220,
        description: '28,920 customers with KYC statuses, PAN format verification, and Aadhaar linkage.',
        metric: '28.9k Entities'
      },
      {
        id: 'p-engine',
        name: 'Data Rescue Transformer',
        type: 'process',
        x: 570,
        y: 180,
        width: 310,
        badge: 'Data Layer',
        description: 'Handles corrupt dates, missing values, duplicates, and standardizes categorical features.',
        metric: 'Zero NULL Leaks'
      },
      {
        id: 'p-db',
        name: 'Indexed Analytics Model',
        type: 'action',
        x: 980,
        y: 85,
        width: 310,
        badge: 'Query Ready',
        description: 'Structured database model powering sub-millisecond BI KPI metrics and regional telemetry.',
        metric: 'SQLite Store'
      },
      {
        id: 'p-cache',
        name: 'DuckDB Analytical Cache',
        type: 'action',
        x: 980,
        y: 275,
        width: 310,
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
    count: 62,
    agentName: 'Dataset Mesh: 4 Cleaned & Unified Tables',
    agentSub: 'Integrated · Transactions · Customers · Merchants · Chargebacks',
    nodes: [
      {
        id: 'd-mch',
        name: 'merchants.csv',
        type: 'source',
        x: 160,
        y: 85,
        width: 220,
        description: '4,343 merchant accounts across 10 categories with active settlement verification.',
        metric: '4,343 Accounts'
      },
      {
        id: 'd-cb',
        name: 'chargebacks.csv',
        type: 'source',
        x: 160,
        y: 275,
        width: 220,
        description: '2,800 chargeback disputes linked to transactions and customer IDs.',
        metric: '2,800 Disputes'
      },
      {
        id: 'd-risk',
        name: 'Composite Risk Engine',
        type: 'model',
        x: 570,
        y: 180,
        width: 310,
        badge: 'Scorecard 0-100',
        description: 'Calculates multi-dimensional risk scores combining dispute ratio, velocity, and settlement status.',
        metric: 'Scoring Formula'
      },
      {
        id: 'd-kpi',
        name: 'Executive Dashboard Sync',
        type: 'action',
        x: 980,
        y: 85,
        width: 310,
        badge: '9-Tab Control',
        description: 'Live telemetry feeds into interactive React command center and Sentinel alerts.',
        metric: 'Real-time Sync'
      },
      {
        id: 'd-telemetry',
        name: 'Sentinel Telemetry Bus',
        type: 'action',
        x: 980,
        y: 275,
        width: 310,
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
    count: 59,
    agentName: 'Trigger: Automated Policy Enforcement',
    agentSub: 'Autonomous · SLA Breaches · Spike Bursts · Syndicate Flags',
    nodes: [
      {
        id: 't-sla',
        name: '7-Day SLA Breach',
        type: 'source',
        x: 160,
        y: 85,
        width: 220,
        description: 'Detects reporting delays exceeding 7 days mandated by statutory payment guidelines.',
        metric: '>7d Delay Flag'
      },
      {
        id: 't-spike',
        name: 'Velocity Burst Attack',
        type: 'source',
        x: 160,
        y: 275,
        width: 220,
        description: 'Micro-transaction flood (>50 txns in minutes) triggers isolation forest alert.',
        metric: 'Velocity Spike'
      },
      {
        id: 't-eval',
        name: 'Threat Sentinel Evaluator',
        type: 'process',
        x: 570,
        y: 180,
        width: 310,
        badge: 'Automated DAG',
        description: 'Evaluates composite risk thresholds and initiates multi-channel mitigation workflows.',
        metric: 'p99 8ms'
      },
      {
        id: 't-dispatch',
        name: 'Resend Email Alert',
        type: 'action',
        x: 980,
        y: 85,
        width: 300,
        badge: 'Instant Alert',
        description: 'Dispatches high-priority email notification to compliance desk via Resend API.',
        metric: 'Zero-latency'
      },
      {
        id: 't-sar',
        name: 'Auto-SAR PDF Dossier',
        type: 'action',
        x: 980,
        y: 275,
        width: 300,
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
    count: 31,
    agentName: 'Observability: Tamper-Evident Audit & Telemetry',
    agentSub: 'Immutable Logging · Sha256 Audit Trail · User Auth · MFA Verified',
    nodes: [
      {
        id: 'o-auth',
        name: 'TOTP Multi-Factor Auth',
        type: 'source',
        x: 160,
        y: 85,
        width: 230,
        description: 'Cryptographic time-based one-time password (TOTP) verification with live QR enrollment.',
        metric: 'RFC 6238'
      },
      {
        id: 'o-session',
        name: 'RBAC Session Guard',
        type: 'source',
        x: 160,
        y: 275,
        width: 230,
        description: 'Role-based access token verification enforcing strict compliance desk permissions.',
        metric: 'Bearer Tokens'
      },
      {
        id: 'o-audit',
        name: 'Zero-Trust Audit Logger',
        type: 'process',
        x: 570,
        y: 180,
        width: 310,
        badge: 'Zero-Trust',
        description: 'Records all analyst actions, AI queries, sandbox simulations, and SAR downloads with cryptographic hashes.',
        metric: 'Append-Only'
      },
      {
        id: 'o-dash',
        name: 'Executive PDF Dossier',
        type: 'action',
        x: 980,
        y: 85,
        width: 300,
        badge: 'FPDF2 Engine',
        description: 'One-click high-resolution PDF compliance report generation for executive review.',
        metric: 'Statutory PDF'
      },
      {
        id: 'o-trail',
        name: 'Immutable Audit Trail',
        type: 'action',
        x: 980,
        y: 275,
        width: 300,
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
    count: 62,
    agentName: 'AI Model Mesh: Isolation Forest · K-Means · NetworkX · Gemini',
    agentSub: 'Multi-Model Pipeline · Unsupervised Anomaly Detection · GenAI Reasoning',
    nodes: [
      {
        id: 'm-iso',
        name: 'Isolation Forest ML',
        type: 'model',
        x: 160,
        y: 85,
        width: 220,
        description: 'Detects velocity outliers and high-frequency micro-payment anomalies.',
        metric: 'Anomaly Model'
      },
      {
        id: 'm-km',
        name: 'K-Means 4-Cluster',
        type: 'model',
        x: 160,
        y: 275,
        width: 220,
        description: 'Segments 28,920 customers into 4 distinct behavioral risk archetypes.',
        metric: 'Behavior Model'
      },
      {
        id: 'm-nx',
        name: 'NetworkX Graph Engine',
        type: 'model',
        x: 570,
        y: 180,
        width: 310,
        badge: 'Graph Theory',
        description: 'Bipartite projection, PageRank centrality, and cycle finding for money laundering rings.',
        metric: 'PageRank Hubs'
      },
      {
        id: 'm-gem',
        name: 'Gemini 3.6 Flash Copilot',
        type: 'action',
        x: 980,
        y: 85,
        width: 310,
        badge: 'GenAI Reasoning',
        description: 'Translates natural language questions into dynamic charts with voice synthesis narrative.',
        metric: 'Natural Language'
      },
      {
        id: 'm-tts',
        name: 'Voice Intelligence (TTS)',
        type: 'action',
        x: 980,
        y: 275,
        width: 310,
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
    <section id="workflow" className="py-24 px-4 sm:px-6 lg:px-8 relative w-full">
      {/* Expanded Main Outer Container (1440px wide max-w-[1440px]) */}
      <div className="w-full max-w-[1440px] mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="eyebrow inline-flex items-center gap-2 text-[11px] font-medium px-3.5 py-1.5 rounded-full mb-4 border border-forsythia/30 bg-forsythia/10 text-forsythia">
            <Zap size={12} />
            <span>Interactive Workflow Canvas</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-arctic tracking-tight mb-4">
            Autonomous Graph Agent Pipeline
          </h2>
          <p className="text-mystic/70 text-base leading-relaxed">
            Explore how AgentIQ ingests raw UPI streams, rescues messy datasets, executes multi-model machine learning, and triggers autonomous compliance actions in sub-12ms.
          </p>
        </motion.div>

        {/* Outer macOS-Style Glass Workflow Container */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full rounded-2xl border border-forsythia/30 bg-[#10232B]/90 backdrop-blur-xl shadow-2xl overflow-hidden"
        >
          {/* Top Window Header Bar */}
          <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56] inline-block opacity-80" />
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E] inline-block opacity-80" />
              <span className="w-3 h-3 rounded-full bg-[#27C93F] inline-block opacity-80" />
              <span className="text-xs mono text-mystic/40 ml-3 font-medium">agentiq-workflow-orchestrator.dag</span>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <span className="mono text-mystic/50 hidden sm:inline">ENGINE: AGENTIC GRAPH AI</span>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 font-mono text-[10px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>LIVE TELEMETRY</span>
              </div>
            </div>
          </div>

          {/* Body: Left Sidebar + Fully Expanded Graph Canvas */}
          <div className="flex flex-col lg:flex-row min-h-[560px] w-full">
            {/* Left Sidebar: Fixed Width (260px) */}
            <div className="w-full lg:w-64 lg:shrink-0 border-r border-surface-border bg-black/20 p-5 space-y-2 flex flex-col justify-between">
              <div className="space-y-1.5">
                <p className="text-[10px] mono uppercase tracking-wider text-mystic/40 px-3 py-1 font-semibold">Platform Topology</p>
                {WORKFLOW_CONFIGS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setHoveredNode(null);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-all duration-300 ${
                        isActive
                          ? 'bg-forsythia/15 text-forsythia font-semibold border border-forsythia/40 shadow-sm'
                          : 'text-mystic/70 hover:text-arctic hover:bg-white/[0.03] border border-transparent'
                      }`}
                    >
                      <span className="capitalize">{tab.name}</span>
                      <span
                        className={`text-xs mono px-2 py-0.5 rounded-md ${
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
              <div className="pt-5 border-t border-surface-border/50">
                <button
                  onClick={onLaunch}
                  className="w-full py-2.5 px-3.5 rounded-md bg-gradient-to-r from-forsythia to-saffron text-oceanic text-xs font-semibold flex items-center justify-center gap-2 hover:shadow-glow transition-shadow"
                >
                  <span>Launch Live UI</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Main Expanded Graph Area */}
            <div className="flex-1 min-w-0 p-6 sm:p-8 flex flex-col justify-between relative bg-radial-gradient">
              {/* Canvas Agent Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-border/60">
                <div>
                  <h3 className="text-xl font-display font-semibold text-arctic flex items-center gap-2">
                    <span>{activeConfig.agentName}</span>
                  </h3>
                  <p className="text-xs text-mystic/60 mono mt-1">{activeConfig.agentSub}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] mono text-forsythia px-3 py-1 rounded bg-forsythia/10 border border-forsythia/25 font-medium">
                    100% Deterministic &amp; Traced
                  </span>
                </div>
              </div>

              {/* Inner Graph Canvas */}
              <div className="relative w-full h-[380px] my-5 rounded-xl bg-white/[0.015] border border-surface-border/40 overflow-x-auto overflow-y-hidden flex items-center justify-center select-none shadow-inner">
                {/* Background Grid Pattern */}
                <div
                  className="absolute inset-0 opacity-[0.035] pointer-events-none min-w-[1000px]"
                  style={{
                    backgroundImage: `linear-gradient(to right, #D9E8E2 1px, transparent 1px), linear-gradient(to bottom, #D9E8E2 1px, transparent 1px)`,
                    backgroundSize: '36px 36px',
                  }}
                />

                {/* Vector Canvas Container (1200 x 360 virtual space) */}
                <div className="relative w-full h-full min-w-[1000px]">
                  {/* SVG Spline Curves */}
                  <svg
                    viewBox="0 0 1200 360"
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <filter id="splineGlow" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="3.5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>

                      <filter id="nodeDotGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
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
                      const curvature = Math.max(30, dx * 0.45);

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
                            strokeWidth="7"
                            opacity="0.95"
                          />
                          {/* Vibrant golden glowing connecting spline */}
                          <path
                            d={pathD}
                            fill="none"
                            stroke="#FFC801"
                            strokeWidth="2.8"
                            strokeDasharray="6 3"
                            filter="url(#splineGlow)"
                          />
                          {/* Source Output Port Anchor Pin (Right Edge of Source Card) */}
                          <circle
                            cx={startX}
                            cy={startY}
                            r="5"
                            fill="#FFC801"
                            filter="url(#nodeDotGlow)"
                          />
                          <circle cx={startX} cy={startY} r="2" fill="#10232B" />
                          {/* Target Input Port Anchor Pin (Left Edge of Target Card) */}
                          <circle
                            cx={endX}
                            cy={endY}
                            r="5"
                            fill="#FF9932"
                            filter="url(#nodeDotGlow)"
                          />
                          <circle cx={endX} cy={endY} r="2" fill="#10232B" />
                          {/* Animated traveling data particle */}
                          <circle r="4" fill="#FFFFFF" filter="url(#nodeDotGlow)">
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

                  {/* Render Interactive Node Badges (Percentage positioned in 1200x360 coordinate grid) */}
                  {activeConfig.nodes.map((node) => {
                    const isHovered = hoveredNode?.id === node.id;
                    const isSource = node.type === 'source';
                    const isAction = node.type === 'action';
                    const isModel = node.type === 'model';

                    return (
                      <div
                        key={node.id}
                        style={{
                          left: `${(node.x / 1200) * 100}%`,
                          top: `${(node.y / 360) * 100}%`,
                          width: `${(node.width / 1200) * 100}%`,
                        }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                        onMouseEnter={() => setHoveredNode(node)}
                        onMouseLeave={() => setHoveredNode(null)}
                        onClick={() => setHoveredNode(node)}
                      >
                        <div
                          className={`w-full h-[38px] px-3 rounded-full text-xs flex items-center justify-between gap-2 border transition-all duration-300 shadow-xl backdrop-blur-md overflow-hidden ${
                            isHovered
                              ? 'border-forsythia bg-[#142A34] scale-105 shadow-glow z-30 ring-2 ring-forsythia/40'
                              : isSource
                              ? 'border-surface-border bg-[#10232B]/95 hover:border-forsythia/40 text-arctic'
                              : isAction
                              ? 'border-saffron/70 bg-[#172B36]/95 hover:border-saffron text-arctic'
                              : isModel
                              ? 'border-forsythia/70 bg-[#172B36]/95 hover:border-forsythia text-arctic'
                              : 'border-white/10 bg-[#172B36]/95 text-arctic'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 shrink">
                            <span
                              className={`w-2 h-2 rounded-full inline-block shrink-0 ${
                                isAction
                                  ? 'bg-saffron'
                                  : isModel
                                  ? 'bg-forsythia'
                                  : 'bg-emerald-400'
                              }`}
                            />
                            <span className="font-semibold truncate text-[11px] sm:text-[12px] text-arctic">{node.name}</span>
                          </div>
                          {node.badge && (
                            <span
                              className={`text-[9px] mono px-2 py-0.5 rounded-full font-bold shrink-0 tracking-tight whitespace-nowrap ${
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

                {/* Floating Node Details Inspector HUD with Smart Adaptive Flip & Non-blocking Pointer Events */}
                <AnimatePresence>
                  {hoveredNode && (
                    <motion.div
                      key={hoveredNode.id}
                      initial={{ opacity: 0, y: hoveredNode.y > 180 ? -10 : 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: hoveredNode.y > 180 ? -6 : 6, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className={`absolute inset-x-4 p-4 rounded-xl border border-forsythia/60 bg-[#10232B]/98 backdrop-blur-2xl shadow-2xl z-40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pointer-events-auto ring-1 ring-forsythia/30 ${
                        hoveredNode.y > 180 ? 'top-3' : 'bottom-3'
                      }`}
                    >
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="w-2.5 h-2.5 rounded-full bg-forsythia animate-pulse" />
                          <span className="text-xs mono font-bold text-forsythia uppercase tracking-wider">
                            Node Inspection: {hoveredNode.name}
                          </span>
                          {hoveredNode.badge && (
                            <span className="text-[10px] mono px-2.5 py-0.5 rounded-full bg-forsythia/20 text-forsythia font-bold border border-forsythia/30">
                              {hoveredNode.badge}
                            </span>
                          )}
                          <span className="text-[10px] mono text-mystic/50 px-2 py-0.5 rounded bg-white/[0.04] border border-white/5">
                            ID: {hoveredNode.id}
                          </span>
                        </div>
                        <p className="text-xs text-[#D9E8E2] leading-relaxed max-w-3xl font-medium">
                          {hoveredNode.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          onClick={() => toggleNodeAudio(hoveredNode)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition-all ${
                            speakingNodeId === hoveredNode.id
                              ? 'bg-saffron/20 border-saffron text-saffron animate-pulse'
                              : 'bg-forsythia/10 border-forsythia/30 text-forsythia hover:bg-forsythia/20'
                          }`}
                          title="Listen to voice narration"
                        >
                          {speakingNodeId === hoveredNode.id ? <VolumeX size={14} /> : <Volume2 size={14} />}
                          <span>{speakingNodeId === hoveredNode.id ? 'Mute' : 'Listen TTS'}</span>
                        </button>

                        {hoveredNode.metric && (
                          <div className="text-right bg-white/[0.04] px-3.5 py-1.5 rounded-lg border border-surface-border">
                            <span className="text-[9px] mono text-mystic/60 block uppercase">Telemetry Metric</span>
                            <span className="text-xs font-mono font-bold text-forsythia">{hoveredNode.metric}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom Quick Metric Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-surface-border/50 text-xs">
                <div className="flex items-center gap-2 text-mystic/70">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                  <span>20,000 Transactions Verified</span>
                </div>
                <div className="flex items-center gap-2 text-mystic/70">
                  <Cpu size={15} className="text-forsythia shrink-0" />
                  <span>Gemini 3.6 Flash Active</span>
                </div>
                <div className="flex items-center gap-2 text-mystic/70">
                  <Lock size={15} className="text-saffron shrink-0" />
                  <span>TOTP MFA Authenticated</span>
                </div>
                <div className="flex items-center gap-2 text-mystic/70">
                  <FileText size={15} className="text-arctic shrink-0" />
                  <span>Auto-SAR FIU-IND Export</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

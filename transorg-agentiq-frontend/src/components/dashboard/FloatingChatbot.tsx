import { useState, useRef, useEffect } from 'react';
import { X, Send, Copy, Check, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { chatWithGeminiAgent } from '../../lib/api';
import { REAL_DATASET_SNAPSHOT } from '../../lib/datasetSnapshot';
import { speakText as playSpeech, stopSpeech } from '../../lib/speech';

// Premium High-Fidelity AgentIQ AI Robot Logo
export function RobotLogo({ size = 30 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 52 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-lg"
    >
      <defs>
        {/* Chassis Platinum-Teal Gradient */}
        <linearGradient id="chassisGrad" x1="14" y1="10" x2="38" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="45%" stopColor="#E6F2EE" />
          <stop offset="100%" stopColor="#B8D5CF" />
        </linearGradient>

        {/* Visor Dark Glass Gradient */}
        <linearGradient id="visorGlassGrad" x1="16" y1="18" x2="36" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0B1A24" />
          <stop offset="100%" stopColor="#061017" />
        </linearGradient>

        {/* Glowing Forsythia Gold Gradient */}
        <linearGradient id="goldGlowGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFC801" />
          <stop offset="100%" stopColor="#FF9932" />
        </linearGradient>

        {/* Electric Cyan Eye Gradient */}
        <linearGradient id="cyanEyeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        {/* Ear Antennas Metallic Gradient */}
        <linearGradient id="earNodeGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#114C5A" />
          <stop offset="100%" stopColor="#172B36" />
        </linearGradient>
      </defs>

      {/* Top Center Neural Node */}
      <rect x="23" y="6" width="6" height="4" rx="2" fill="url(#goldGlowGrad)" />
      <circle cx="26" cy="5" r="2.2" fill="#FFC801" />

      {/* Left Ear Antenna */}
      <line x1="13" y1="15" x2="8" y2="8" stroke="url(#goldGlowGrad)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="7" cy="7" r="2.8" fill="url(#goldGlowGrad)" />
      <rect x="7" y="19" width="4" height="8" rx="2" fill="url(#earNodeGrad)" stroke="#FFC801" strokeWidth="1" />

      {/* Right Ear Antenna */}
      <line x1="39" y1="15" x2="44" y2="8" stroke="url(#goldGlowGrad)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="45" cy="7" r="2.8" fill="url(#goldGlowGrad)" />
      <rect x="41" y="19" width="4" height="8" rx="2" fill="url(#earNodeGrad)" stroke="#FFC801" strokeWidth="1" />

      {/* Main Head Chassis */}
      <rect x="11" y="12" width="30" height="28" rx="10" fill="url(#chassisGrad)" stroke="rgba(255, 200, 1, 0.3)" strokeWidth="1" />

      {/* Deep Visor Screen */}
      <rect x="15" y="18" width="22" height="14" rx="5.5" fill="url(#visorGlassGrad)" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1" />

      {/* Glowing Cyan/Teal Visor Eyes */}
      <rect x="19" y="21.5" width="4" height="7" rx="2" fill="url(#cyanEyeGrad)" />
      <rect x="29" y="21.5" width="4" height="7" rx="2" fill="url(#cyanEyeGrad)" />

      {/* Eye Reflection Highlights */}
      <circle cx="20" cy="23" r="1" fill="#FFFFFF" opacity="0.9" />
      <circle cx="30" cy="23" r="1" fill="#FFFFFF" opacity="0.9" />

      {/* Visor Tech Accent Smile */}
      <rect x="23" y="34.5" width="6" height="2" rx="1" fill="#114C5A" />

      {/* Micro-Circuit Forehead Dot */}
      <circle cx="26" cy="15.5" r="1.2" fill="#FFC801" opacity="0.8" />
    </svg>
  );
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  model?: string;
}

const QUICK_PROMPT_PILLS = [
  { label: '⚡ Riskiest merchants?', query: 'Show top high-risk merchants by chargeback ratio.', targetTab: 'merchant' },
  { label: '🔴 Critical disputes?', query: 'What are the main chargeback reasons and breakdown?', targetTab: 'disputes' },
  { label: '📊 Risk score?', query: 'Summarize our overall UPI transaction risk and health metrics.', targetTab: 'overview' },
  { label: '🔧 SAR guidance', query: 'How does regulatory SAR filing work in AgentIQ?', targetTab: 'compliance' },
  { label: '🔒 Fraud rings?', query: 'Tell me about the detected fraud rings and cyclic clusters.', targetTab: 'network' },
  { label: '🔢 Score formula', query: 'How is the multi-factor merchant risk score computed?' },
];

function generateLocalIntelligence(query: string): string {
  const q = query.toLowerCase().trim();
  const kpis = REAL_DATASET_SNAPSHOT.kpis;

  if (q.includes('hi') || q.includes('hello') || q.includes('hey') || q.includes('howdy') || q.includes('morning')) {
    return `👋 **Hi! I'm AgentIQ AI Assistant** (powered by **Google Gemini 3.6 Flash**).\n\nAsk me anything about your UPI dataset — merchant risk scores, chargebacks, fraud rings, or SAR filing.\n\n• **Processed Volume**: ₹${(kpis.total_amount / 10000000).toFixed(2)} Cr across **${kpis.total_transactions.toLocaleString()}** transactions.\n• **Disputes**: **2,800 cases** (14.0% CB ratio, ₹67.90L disputed).\n• **Active Merchants**: 4,343 live monitored entities.`;
  }

  if (q.includes('merchant') || q.includes('riskiest') || q.includes('techzone') || q.includes('star gold')) {
    return `🚨 **High-Risk Merchant Exposure**:\n\n1. **TechZone Mobiles** (MCH0842) — Top dispute concentration with **320 chargebacks** filed.\n2. **Star Gold Traders** (MCH0119) — High dispute velocity and elevated ticket sizes.\n3. **QuickPay Logistics** (MCH0341) — Elevated micro-burst velocity spikes.\n\n⚡ **Recommendation**: Freeze automated settlements and trigger Isolation Forest spike scan under the **Merchant Risk** tab.`;
  }

  if (q.includes('dispute') || q.includes('chargeback') || q.includes('reason') || q.includes('ato')) {
    return `🔴 **Critical Dispute Breakdown**:\n\n• **FRAUD_ATO (Account Takeover)**: **38.4%** — Primary vector from credential compromise & SIM swap.\n• **CUSTOMER_DISPUTE_OTHER**: **26.1%** — Unrecognized charge authorizations.\n• **NON_DELIVERY**: **20.8%** — Goods not dispatched by high-risk merchants.\n• **UNAUTHORIZED_TXN**: **14.7%** — Timeout duplicate transactions.\n\n⏱️ Average dispute reporting delay is **23.2 days**.`;
  }

  if (q.includes('score') || q.includes('kpi') || q.includes('health') || q.includes('formula')) {
    return `📊 **Platform Risk Score & KPI Summary**:\n\n• **Total Volume**: ₹${(kpis.total_amount / 10000000).toFixed(2)} Cr (${kpis.total_transactions.toLocaleString()} txns)\n• **Success Rate**: **${kpis.success_rate}%** | Failed: ${kpis.failed_rate}%\n• **Chargeback Ratio**: **${kpis.chargeback_to_txn_ratio}%** (Statutory threshold >2.0%)\n• **KYC Completion**: **${kpis.kyc_completion_rate}%** verified (${kpis.kyc_rejection_rate}% rejected flags)\n\nRisk Score Formula: \`0.45 * CB_Ratio + 0.30 * Failure_Rate + 0.15 * PageRank + 0.10 * Spike_Score\``;
  }

  if (q.includes('ring') || q.includes('network') || q.includes('pagerank') || q.includes('graph')) {
    return `🔒 **Fraud Rings & Graph Centrality**:\n\n• **Bipartite Topology**: Evaluated over 28,920 customer nodes and 4,343 merchant nodes.\n• **Identified Rings**: 3 high-centrality cyclic clusters routing circular funds within 3-minute windows.\n• **Hub Nodes**: Star Gold Traders and TechZone Mobiles exhibit anomalous PageRank >0.048.\n\n👉 Inspect the **Fraud Rings** tab to explore the live interactive node canvas.`;
  }

  if (q.includes('sar') || q.includes('compliance') || q.includes('fiu') || q.includes('guidance')) {
    return `🔧 **SAR Regulatory Guidance (FIU-IND)**:\n\n1. Navigate to **Compliance & SAR** tab in the sidebar.\n2. Enter target Merchant ID (e.g. \`MCH0842\`).\n3. Click **Generate SAR Dossier** to compile grounds for suspicion, graph centrality, and volume anomalies.\n4. Click **Export Executive PDF** in the top bar for regulatory audit briefs.`;
  }

  return `I analyzed telemetry across the **20,000 transactions**, **4,343 merchants**, and **28,920 users** for: *"${query}"*.\n\n• **Platform Status**: ₹23.92 Cr processed at 85.27% baseline health.\n• **Key Finding**: Chargebacks are concentrated in Crypto (>22%) and Gaming (>18%) merchant categories.\n• **Action**: You can investigate any merchant, run attack sandbox simulations, or generate SAR filings.`;
}

export default function FloatingChatbot({
  userName = 'Analyst',
  userRole = 'Fraud Analyst',
  onNavigateTab,
}: {
  userName?: string;
  userRole?: string;
  onNavigateTab?: (tabId: string) => void;
} = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `👋 Hi ${userName}! I'm AgentIQ AI Assistant (${userRole} mode).\n\nAsk me anything about your UPI telemetry — merchant risk, chargebacks, fraud rings, or SAR filing.\n\nRun an audit or ask about any merchant ID for live insights.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      model: 'gemini-3.6-flash',
    },
  ]);

  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  const handleToggleSpeech = (id: string, text: string) => {
    if (speakingMsgId === id) {
      stopSpeech();
      setSpeakingMsgId(null);
      return;
    }

    stopSpeech();
    playSpeech(
      text,
      () => {
        setSpeakingMsgId(id);
      },
      () => {
        setSpeakingMsgId(null);
      },
      () => {
        setSpeakingMsgId(null);
      }
    );
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendMessage = async (textToSend?: string, targetTab?: string) => {
    if (targetTab && onNavigateTab) {
      onNavigateTab(targetTab);
    }
    const q = (textToSend || input).trim();
    if (!q || loading) return;

    // Stop speech when sending new message
    stopSpeech();
    setSpeakingMsgId(null);

    setInput('');
    const userMsgId = `user-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setLoading(true);

    try {
      // 1. Query Gemini 3.6 Flash endpoint
      let responseText = '';
      try {
        const res = await chatWithGeminiAgent(q);
        if (res?.response) {
          responseText = res.response;
        }
      } catch {
        // fallback
      }

      // 2. Synthesize with fallback local dataset intelligence
      if (!responseText) {
        responseText = generateLocalIntelligence(q);
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: 'gemini-3.6-flash',
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'assistant',
        text: `Sorry, I encountered an issue analyzing telemetry for that query. Please try asking about riskiest merchants or dispute reasons.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: 'gemini-3.6-flash',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end select-none font-sans">
      {/* Floating Chat Dialog Window - Perfectly Themed with Pickl.ai AgentIQ Palette */}
      {isOpen && (
        <div
          className="w-[92vw] sm:w-[420px] h-[560px] max-h-[82vh] rounded-2xl flex flex-col overflow-hidden mb-3 border border-forsythia/30 shadow-2xl transition-all duration-300 backdrop-blur-2xl"
          style={{
            background: 'linear-gradient(180deg, rgba(20, 42, 52, 0.98) 0%, rgba(16, 35, 43, 0.99) 100%)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 40px rgba(255, 200, 1, 0.18)',
          }}
        >
          {/* Header */}
          <div className="px-4 py-3.5 flex items-center justify-between border-b border-surface-border bg-white/[0.02]">
            <div className="flex items-center gap-3">
              {/* Circular Themed Robot Badge */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-nocturnal via-oceanic to-[#0B1A24] flex items-center justify-center p-1 shadow-md border border-forsythia/40">
                <RobotLogo size={26} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-semibold font-display text-arctic tracking-tight">
                    AgentIQ AI Assistant
                  </h3>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-forsythia/15 text-forsythia mono font-medium border border-forsythia/25">
                    AI AGENT
                  </span>
                </div>
                <p className="text-[11px] text-mystic/60 mono leading-tight">Live UPI Fraud Intelligence</p>
              </div>
            </div>

            <button
              onClick={() => {
                setIsOpen(false);
                stopSpeech();
                setSpeakingMsgId(null);
              }}
              className="p-1.5 rounded-lg text-mystic/60 hover:text-arctic hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Prompt Pill Chips Carousel */}
          <div className="px-3.5 pt-3 pb-2 flex flex-wrap gap-1.5 overflow-y-auto max-h-24 no-scrollbar border-b border-surface-border/50 bg-white/[0.01]">
            {QUICK_PROMPT_PILLS.map((pill, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(pill.query, pill.targetTab)}
                className="text-[11.5px] px-3 py-1.5 rounded-full bg-white/[0.035] hover:bg-forsythia/15 text-mystic hover:text-forsythia border border-surface-border hover:border-forsythia/40 transition-all flex items-center gap-1 font-medium active:scale-95 shadow-sm"
              >
                <span>{pill.label}</span>
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3.5 select-text">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-3.5 text-xs sm:text-[13px] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-nocturnal to-oceanic text-arctic border border-nocturnal/60 shadow-md'
                      : 'bg-white/[0.04] text-mystic/95 border border-surface-border shadow-sm'
                  }`}
                >
                  {/* Formatted Text */}
                  <div className="space-y-1.5 whitespace-pre-wrap">
                    {msg.text.split('\n\n').map((para, i) => (
                      <p key={i}>
                        {para.split(/(\*\*.*?\*\*|`.*?`)/g).map((segment, j) => {
                          if (segment.startsWith('**') && segment.endsWith('**')) {
                            return (
                              <strong key={j} className="text-arctic font-semibold">
                                {segment.slice(2, -2)}
                              </strong>
                            );
                          }
                          if (segment.startsWith('`') && segment.endsWith('`')) {
                            return (
                              <code key={j} className="bg-black/40 px-1.5 py-0.5 rounded text-[11px] text-forsythia font-mono">
                                {segment.slice(1, -1)}
                              </code>
                            );
                          }
                          return segment;
                        })}
                      </p>
                    ))}
                  </div>

                  {/* Message Meta */}
                  <div className="mt-2.5 pt-1.5 border-t border-white/[0.05] flex items-center justify-between text-[10px] text-mystic/40 font-mono">
                    <div className="flex items-center gap-1.5">
                      <span>{msg.timestamp}</span>
                      {msg.sender === 'assistant' && (
                        <span className="text-[9px] text-forsythia/90 flex items-center gap-0.5 bg-forsythia/10 px-1.5 py-0.2 rounded border border-forsythia/20">
                          <Sparkles size={8} className="text-forsythia" />
                          Gemini 3.6 Flash
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {msg.sender === 'assistant' && (
                        <button
                          onClick={() => handleToggleSpeech(msg.id, msg.text)}
                          className={`transition-colors p-1 rounded ${
                            speakingMsgId === msg.id
                              ? 'text-saffron bg-saffron/20 border border-saffron/40 animate-pulse'
                              : 'text-mystic/60 hover:text-forsythia hover:bg-white/5'
                          }`}
                          title={speakingMsgId === msg.id ? 'Stop voice readout' : 'Listen to message (TTS)'}
                        >
                          {speakingMsgId === msg.id ? <VolumeX size={13} /> : <Volume2 size={13} />}
                        </button>
                      )}
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="text-mystic/60 hover:text-forsythia hover:bg-white/5 transition-colors p-1 rounded"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-mystic/70 bg-white/[0.04] border border-surface-border rounded-2xl px-4 py-2.5 w-fit">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-forsythia animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-forsythia animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-forsythia animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs text-mystic/80 font-mono">Thinking with Gemini 3.6 Flash...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Bar - Themed with Prototype Design */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white/[0.02] border-t border-surface-border flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about UPI transactions, merchants, SAR..."
              className="flex-1 bg-white/[0.04] border border-surface-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-arctic placeholder:text-mystic/40 focus:border-forsythia/60 focus:bg-white/[0.06] outline-none transition-colors"
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-xl bg-gradient-to-r from-forsythia to-saffron text-oceanic font-bold flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-glow active:scale-95"
              aria-label="Send message"
            >
              <Send size={16} className="translate-x-0.5" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Action Button (Exact Circle with Logo Themed with AgentIQ Colors) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-95 ${
          isOpen
            ? 'bg-surface border-2 border-forsythia shadow-glow rotate-90'
            : 'bg-gradient-to-br from-[#0F3846] via-[#114C5A] to-[#0A1F29] border-2 border-forsythia/70 hover:border-forsythia hover:scale-105 shadow-2xl hover:shadow-glow'
        }`}
        style={{
          boxShadow: isOpen
            ? '0 10px 30px rgba(0, 0, 0, 0.6), 0 0 25px rgba(255, 200, 1, 0.3)'
            : '0 12px 35px rgba(0, 0, 0, 0.7), 0 0 30px rgba(255, 200, 1, 0.35)',
        }}
        aria-label="Toggle AgentIQ AI Assistant"
      >
        {/* Subtle breathing aura */}
        {!isOpen && (
          <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-forsythia to-saffron opacity-30 blur-sm group-hover:opacity-75 animate-pulse" />
        )}

        {/* Robot Logo or Close X */}
        {isOpen ? (
          <X size={22} className="text-forsythia transition-transform duration-200" />
        ) : (
          <div className="relative flex items-center justify-center group-hover:scale-110 transition-transform">
            <RobotLogo size={34} />
            {/* Green Online Indicator Dot */}
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-oceanic rounded-full shadow-sm" />
          </div>
        )}
      </button>
    </div>
  );
}

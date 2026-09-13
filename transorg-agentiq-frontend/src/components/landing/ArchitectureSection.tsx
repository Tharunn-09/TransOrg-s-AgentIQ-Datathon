import { motion } from 'framer-motion';
import { Layers, ShieldAlert, Sparkles, CheckCircle2, GitMerge, Terminal } from 'lucide-react';

const LAYERS = [
  {
    badge: 'Layer 1: Core',
    title: 'Data Rescue & Cleansing Pipeline',
    tagline: 'Standardizing messy real-world transaction streams into an indexed relational model',
    icon: Terminal,
    color: 'border-forsythia text-forsythia',
    points: [
      'Cleaned corrupted timestamps, duplicate transaction records, and null value distributions.',
      'Regex-validated Indian Permanent Account Numbers (PAN: [A-Z]{5}[0-9]{4}[A-Z]{1}) and Aadhaar linkage integrity.',
      'Constructed clean relational foreign-key joins across User IDs, Merchant IDs, and Complaint IDs into a query-ready analytical SQLite store.',
    ],
  },
  {
    badge: 'Layer 2: Core',
    title: 'Analytics & Metric Engineering',
    tagline: 'Multi-dimensional risk scoring, statutory SLA tracking, and geospatial intelligence',
    icon: Layers,
    color: 'border-saffron text-saffron',
    points: [
      'Engineered multi-dimensional merchant composite risk scores (0-100) combining dispute velocity, chargeback ratio, and settlement holds.',
      'Binned dispute reporting delays into SLA distribution buckets with 7-day statutory regulatory limits.',
      'Extracted regional telemetry across 9 Indian states (Punjab, Maharashtra, West Bengal, Delhi, Uttar Pradesh, Rajasthan, Telangana, Tamil Nadu, Karnataka).',
    ],
  },
  {
    badge: 'Layer 3: Core',
    title: 'Executive Dashboard & Compliance',
    tagline: 'High-density cybernetic command center with live streaming telemetry and zero Streamlit dependencies',
    icon: ShieldAlert,
    color: 'border-emerald-400 text-emerald-400',
    points: [
      'Built a custom React + Tailwind + Recharts frontend backed by a high-speed FastAPI REST server.',
      'Enterprise security suite: RFC 6238 TOTP Multi-Factor Authentication with dynamic QR codes and tamper-evident audit logging.',
      'Interactive vector map of India with live dispute heatmaps and automated FIU-IND regulatory SAR dossier generator.',
    ],
  },
  {
    badge: 'Layer 4: Bonus Deliverable',
    title: 'Agentic Graph AI Copilot',
    tagline: 'Dynamic natural language query parsing, chart generation, and narrative voice synthesis',
    icon: Sparkles,
    color: 'border-sky-400 text-sky-400',
    points: [
      'Powered by Google Gemini 3.6 Flash (gemini-2.5-flash architecture) for natural language text-to-chart processing.',
      'Converts plain English prompts into dynamic SQL aggregations, rendering interactive Bar, Area, Line, Donut, and Scatter charts.',
      'Includes text-to-speech (TTS) voice synthesis for hands-free executive boardroom briefings and risk narration.',
    ],
  },
];

export default function ArchitectureSection() {
  return (
    <section id="architecture" className="py-24 px-4 sm:px-6 relative bg-white/[0.01]">
      <div className="max-w-6xl mx-auto">
        {/* Section Header with Scroll InView */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl mb-14"
        >
          <div className="eyebrow inline-flex items-center gap-2 text-[11px] font-medium px-3 py-1 rounded-full mb-4 border border-forsythia/30 bg-forsythia/10 text-forsythia">
            <GitMerge size={12} />
            <span>The 4-Layer Challenge Architecture</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-arctic tracking-tight mb-4">
            How We Achieved The Challenge
          </h2>
          <p className="text-mystic/70 leading-relaxed">
            From raw data rescue to autonomous multi-model graph agents and Gemini 3.6 Flash GenAI copilot — our 4-layer architecture addresses all datathon requirements.
          </p>
        </motion.div>

        {/* Staggered Layer Cards on Scroll */}
        <div className="space-y-6">
          {LAYERS.map((layer, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.008, transition: { duration: 0.2 } }}
              className="glass-panel p-6 sm:p-8 rounded-xl border border-surface-border hover:border-forsythia/50 hover:shadow-[0_4px_30px_rgba(255,200,1,0.06)] transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                <div className="lg:max-w-xs shrink-0">
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className={`text-[11px] mono px-2.5 py-0.5 rounded-full border font-bold ${layer.color} bg-white/[0.02]`}>
                      {layer.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-display font-semibold text-arctic mb-2 flex items-center gap-2">
                    <layer.icon size={18} className="text-forsythia shrink-0" />
                    <span>{layer.title}</span>
                  </h3>
                  <p className="text-xs text-mystic/60 leading-relaxed">{layer.tagline}</p>
                </div>

                <div className="flex-1 lg:border-l lg:border-surface-border lg:pl-8 space-y-2.5">
                  <p className="text-xs font-mono text-mystic/40 uppercase tracking-wider">Implementation Highlights &amp; Approach:</p>
                  <ul className="space-y-2">
                    {layer.points.map((pt, pIdx) => (
                      <motion.li
                        key={pIdx}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.15 + pIdx * 0.08 }}
                        className="text-xs sm:text-sm text-[#D9E8E2] flex items-start gap-2.5 leading-relaxed"
                      >
                        <CheckCircle2 size={15} className="text-forsythia shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


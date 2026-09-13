import { motion } from 'framer-motion';
import { Network, GitBranch, Plug, Gauge, FileWarning, Eye, Sparkles } from 'lucide-react';

const CARDS = [
  {
    icon: Network,
    title: 'Autonomous graph agents',
    body: 'PageRank centrality and syndicate detection over multi-party bipartite transaction networks.',
  },
  {
    icon: GitBranch,
    title: 'Composable threat DAGs',
    body: 'Branch, isolate, and simulate velocity attacks against live traffic with zero downtime.',
  },
  {
    icon: Plug,
    title: '4 Core FinTech Pipelines',
    body: 'Ingest NPCI UPI transactions, customer KYC profiles, merchant master records, and chargeback webhooks natively.',
  },
  {
    icon: Gauge,
    title: 'Sub-millisecond engine',
    body: 'Indexed analytics over 20K transactions with p99 traversal latency under 12ms.',
  },
  {
    icon: FileWarning,
    title: 'Regulatory SAR generation',
    body: 'Instant FIU-IND and RBI-ready law enforcement dossiers in a single click.',
  },
  {
    icon: Eye,
    title: 'Built-in explainability',
    body: 'Every agent decision and risk score is traced, replayable, and audit-logged.',
  },
];

export default function PlatformPrimitives() {
  return (
    <section id="platform" className="py-24 px-6 relative">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-xl mb-14"
        >
          <div className="eyebrow inline-flex items-center gap-2 text-[11px] font-medium px-3 py-1 rounded-full mb-4 border border-forsythia/30 bg-forsythia/10 text-forsythia">
            <Sparkles size={12} />
            <span>Autonomous Primitives</span>
          </div>
          <h2 className="text-3xl md:text-4xl text-arctic font-display font-bold mb-4">
            Six primitives, one fraud mesh
          </h2>
          <p className="text-mystic/60 leading-relaxed">
            Every capability below runs as an independent agent that can be composed,
            replaced, or scaled without touching the rest of your stack.
          </p>
        </motion.div>

        {/* Staggered 6-Card Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CARDS.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4, borderColor: 'rgba(255, 200, 1, 0.4)', transition: { duration: 0.2 } }}
              className="glass-panel p-6 transition-all duration-300 rounded-xl border border-surface-border group hover:shadow-[0_4px_30px_rgba(255,200,1,0.06)]"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300"
                style={{ background: 'rgba(255, 200, 1, 0.1)', border: '1px solid rgba(255, 200, 1, 0.2)' }}
              >
                <c.icon size={19} className="text-forsythia" strokeWidth={2} />
              </div>
              <h3 className="text-base font-display font-semibold text-arctic mb-2 group-hover:text-forsythia transition-colors">
                {c.title}
              </h3>
              <p className="text-sm text-mystic/55 leading-relaxed">{c.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


import { motion } from 'framer-motion';
import { Database, CheckCircle2, FileSpreadsheet } from 'lucide-react';

const DATASETS = [
  {
    id: 'transactions',
    title: '1. Transactions Stream (transactions.csv)',
    records: '20,000 Real-world Rows',
    volume: '₹239.2M+ Processed',
    states: '9 Indian States',
    highlight: 'Core Volume Layer',
    rescueDetails: [
      'Cleaned non-standard datetime stamps to ISO 8601 & normalized Indian Rupee float amounts.',
      'Validated and indexed unique 12-digit UTR references to prevent double-spending & replay attacks.',
      'Correlated gateway status flags (SUCCESS vs FAILED) against hourly failure surges.',
    ],
  },
  {
    id: 'customers',
    title: '2. Customer KYC Master (customers.csv)',
    records: '28,920 Customer Records',
    volume: '4 Behavioral Clusters',
    states: 'PAN & Aadhaar Verified',
    highlight: 'Identity Layer',
    rescueDetails: [
      'Implemented deterministic RegEx validation for 10-digit Indian Permanent Account Numbers (PAN).',
      'Audited Aadhaar compliance linkage flags to isolate high-risk synthetic identity infiltrations.',
      'Trained K-Means 4-cluster model over transaction velocity vs chargeback intensity.',
    ],
  },
  {
    id: 'merchants',
    title: '3. Merchant Directory (merchants.csv)',
    records: '4,343 Merchant Records',
    volume: '10 Business Categories',
    states: 'Settlement Status Checked',
    highlight: 'Merchant Underwriting',
    rescueDetails: [
      'Standardized noisy merchant category strings into canonical BFSI merchant buckets.',
      'Cross-verified settlement bank account linkage to detect unbacked payout destinations.',
      'Computed composite risk scores (0-100) combining chargeback ratios & velocity multipliers.',
    ],
  },
  {
    id: 'chargebacks',
    title: '4. Dispute Registry (chargebacks.csv)',
    records: '2,800 Filed Disputes',
    volume: '7-Day SLA Binned',
    states: 'Root-Cause Explained',
    highlight: 'Dispute Intelligence',
    rescueDetails: [
      'Canonicalized non-standard dispute codes into 7 regulatory reason categories.',
      'Calculated exact reporting delay in days between transaction date and dispute filing date.',
      'Demarcated statutory 7-day SLA breaches indicating potential Account Takeover (ATO).',
    ],
  },
];

export default function DatasetsSection() {
  return (
    <section id="datasets" className="py-24 px-4 sm:px-6 relative border-t border-surface-border/50">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl mb-14"
        >
          <div className="eyebrow inline-flex items-center gap-2 text-[11px] font-medium px-3 py-1 rounded-full mb-4 border border-forsythia/30 bg-forsythia/10 text-forsythia">
            <Database size={12} />
            <span>Dataset Rescue &amp; Analytics Foundation</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-arctic tracking-tight mb-4">
            Unified Across 4 FinTech Datasets
          </h2>
          <p className="text-mystic/70 leading-relaxed">
            Every transaction, customer KYC profile, merchant master record, and chargeback dispute was cleansed, standardized, and indexed into a unified query-ready analytical data model.
          </p>
        </motion.div>

        {/* 2x2 Grid with Staggered Scroll Entrances */}
        <div className="grid md:grid-cols-2 gap-6">
          {DATASETS.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="glass-panel p-6 rounded-xl border border-surface-border hover:border-forsythia/40 hover:shadow-[0_4px_30px_rgba(255,200,1,0.08)] transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <FileSpreadsheet size={18} className="text-forsythia group-hover:rotate-6 transition-transform duration-300" />
                    <h3 className="text-base font-display font-semibold text-arctic group-hover:text-forsythia transition-colors">
                      {d.title}
                    </h3>
                  </div>
                  <span className="text-[10px] mono px-2 py-0.5 rounded bg-white/[0.04] text-mystic/60 border border-white/10 shrink-0">
                    {d.highlight}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 px-3.5 my-3 rounded-lg bg-black/20 border border-white/[0.04] text-center">
                  <div>
                    <span className="text-[10px] mono text-mystic/50 block">Scale</span>
                    <span className="text-xs font-mono font-bold text-arctic">{d.records}</span>
                  </div>
                  <div>
                    <span className="text-[10px] mono text-mystic/50 block">Coverage</span>
                    <span className="text-xs font-mono font-bold text-forsythia">{d.volume}</span>
                  </div>
                  <div>
                    <span className="text-[10px] mono text-mystic/50 block">Status</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">{d.states}</span>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <p className="text-xs font-mono text-mystic/40 uppercase tracking-wider">Data Rescue &amp; Cleansing Proof:</p>
                  <ul className="space-y-1.5">
                    {d.rescueDetails.map((detail, idx) => (
                      <li key={idx} className="text-xs text-[#D9E8E2] flex items-start gap-2 leading-relaxed">
                        <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span>{detail}</span>
                      </li>
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


import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function ConversionBanner({ onLaunch }: { onLaunch: () => void }) {
  return (
    <section id="enterprise" className="py-24 px-6 relative">
      <motion.div
        initial={{ opacity: 0, y: 35, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl mx-auto glass-panel p-12 md:p-16 text-center relative overflow-hidden rounded-2xl border border-forsythia/30 shadow-[0_10px_50px_rgba(0,0,0,0.5)]"
      >
        <motion.div
          animate={{
            opacity: [0.4, 0.7, 0.4],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'var(--gradient-glow)' }}
        />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider px-3.5 py-1.5 rounded-full mb-6 border border-forsythia/30 bg-forsythia/10 text-forsythia">
            <Sparkles size={12} />
            <span>Live Security Command Center</span>
          </div>

          <h2 className="text-3xl md:text-5xl text-arctic font-display font-bold mb-5 tracking-tight">
            See your own transaction mesh, live
          </h2>
          <p className="text-mystic/70 max-w-lg mx-auto mb-9 text-base leading-relaxed">
            Log into the command center with a demo credential and walk through
            real multi-party syndicate detection, ML spike isolation, and regulatory SAR generation end-to-end.
          </p>

          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 0 35px rgba(255, 200, 1, 0.45)' }}
            whileTap={{ scale: 0.98 }}
            onClick={onLaunch}
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-lg font-semibold text-oceanic bg-gradient-to-r from-forsythia via-saffron to-forsythia bg-[length:200%_auto] hover:bg-right transition-all duration-500 shadow-glow"
          >
            Launch command center
            <ArrowRight size={18} />
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
}


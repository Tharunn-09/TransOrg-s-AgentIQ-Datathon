import { motion } from 'framer-motion';
import { ArrowRight, Play, Sparkles, ShieldCheck, Activity, Cpu } from 'lucide-react';

export default function HeroSection({ onLaunch }: { onLaunch: () => void }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 22 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <section className="relative pt-36 pb-24 px-6 overflow-hidden">
      {/* Dynamic Animated Radial Gradient Background */}
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.45, 0.65, 0.45],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-x-0 top-0 h-[640px] pointer-events-none"
        style={{ background: 'var(--gradient-glow)' }}
      />

      {/* Cyber Grid Lines & Floating Radar Rings */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none [mask-image:radial-gradient(ellipse_60%_50%_at_50%_20%,#000_70%,transparent_100%)]" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative max-w-5xl mx-auto text-center z-10"
      >
        {/* Eyebrow Pill Badge */}
        <motion.div variants={itemVariants} className="inline-block mb-7">
          <div
            className="eyebrow inline-flex items-center gap-2.5 text-[11px] font-medium px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(255,200,1,0.15)] transition-all duration-300 hover:scale-105 cursor-default"
            style={{
              border: '1px solid rgba(255, 200, 1, 0.35)',
              background: 'rgba(20, 42, 52, 0.75)',
              backdropFilter: 'blur(12px)',
              color: '#FFC801',
            }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-forsythia opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-forsythia" />
            </span>
            <Sparkles size={12} strokeWidth={2.5} />
            <span>Autonomous Graph AI · UPI Fraud Defense &amp; Merchant Risk</span>
          </div>
        </motion.div>

        {/* Main Display Headline */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-arctic leading-[1.05]"
        >
          Autonomous AI agents for your{' '}
          <span className="text-gradient drop-shadow-[0_0_35px_rgba(255,200,1,0.25)]">
            UPI payment stack
          </span>
        </motion.h1>

        {/* Subtitle Description */}
        <motion.p
          variants={itemVariants}
          className="mt-7 text-lg sm:text-xl text-mystic/70 max-w-2xl mx-auto leading-relaxed font-normal"
        >
          AgentIQ deploys autonomous graph agents across 20,000+ UPI transaction
          streams — surfacing multi-party syndicates, circular laundering hubs,
          and velocity spikes as they form in sub-12ms.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          variants={itemVariants}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(255, 200, 1, 0.4)' }}
            whileTap={{ scale: 0.98 }}
            onClick={onLaunch}
            className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-lg font-semibold text-oceanic bg-gradient-to-r from-forsythia via-saffron to-forsythia bg-[length:200%_auto] hover:bg-right transition-all duration-500 shadow-glow"
          >
            Launch command center
            <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
            whileTap={{ scale: 0.98 }}
            onClick={onLaunch}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg font-medium text-arctic border border-surface-border bg-white/[0.03] backdrop-blur-sm hover:border-forsythia/40 transition-colors duration-300"
          >
            <Play size={14} className="text-forsythia fill-forsythia/30" />
            Watch interactive demo
          </motion.button>
        </motion.div>

        {/* Floating Mini Feature Badges */}
        <motion.div
          variants={itemVariants}
          className="mt-14 pt-8 border-t border-surface-border/40 grid grid-cols-3 max-w-2xl mx-auto gap-4 text-left"
        >
          <div className="flex items-center gap-2.5 text-xs text-mystic/80">
            <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
            <span>20k Trans. Verified</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-mystic/80">
            <Activity size={16} className="text-forsythia shrink-0" />
            <span>p99 &lt; 12ms Traversal</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-mystic/80">
            <Cpu size={16} className="text-sky-400 shrink-0" />
            <span>Gemini 3.6 Flash Active</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}


import { motion } from 'framer-motion';
import { ArrowRight, Play, Sparkles, ShieldCheck, Activity, Cpu } from 'lucide-react';

export default function HeroSection({ onLaunch, onWatchDemo }: { onLaunch: () => void; onWatchDemo?: () => void }) {
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
        className="relative max-w-5xl mx-auto text-center"
      >
        {/* Release Pill Badge */}
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 mb-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-forsythia/30 bg-forsythia/10 backdrop-blur-md shadow-[0_0_20px_rgba(255,200,1,0.15)]">
            <span className="w-2 h-2 rounded-full bg-forsythia animate-ping" />
            <Sparkles size={13} className="text-forsythia" />
            <span className="text-xs font-mono font-medium tracking-wide text-forsythia uppercase">
              Autonomous Graph AI • UPI Fraud Defense &amp; Merchant Risk
            </span>
          </div>
        </motion.div>

        {/* Master Hero Headline */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-6xl md:text-7xl font-display font-extrabold tracking-tight text-arctic leading-[1.1]"
        >
          Autonomous AI agents for <br />
          your <span className="gradient-text drop-shadow-sm">UPI payment stack</span>
        </motion.h1>

        {/* Narrative Subtitle */}
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
            onClick={onWatchDemo || onLaunch}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg font-medium text-arctic border border-surface-border bg-white/[0.03] backdrop-blur-sm hover:border-forsythia/40 hover:text-forsythia transition-colors duration-300 shadow-sm cursor-pointer"
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


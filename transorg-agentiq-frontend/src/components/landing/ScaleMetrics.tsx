import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const METRICS = [
  { value: 239.2, prefix: '₹', suffix: 'M+', label: 'Processed volume tracked', decimals: 1, color: 'text-forsythia' },
  { value: 99.99, prefix: '', suffix: '%', label: 'Platform SLA reliability', decimals: 2, color: 'text-emerald-400' },
  { value: 12, prefix: 'p99 < ', suffix: 'ms', label: 'Real-time graph traversal latency', decimals: 0, color: 'text-sky-400' },
  { value: 98.4, prefix: '', suffix: '%', label: 'True-positive syndicate capture', decimals: 1, color: 'text-saffron' },
];

function Counter({ value, decimals, prefix, suffix, colorClass }: { value: number; decimals: number; prefix: string; suffix: string; colorClass: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1600;
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(value * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <span ref={ref} className={`text-4xl md:text-5xl font-display font-bold tracking-tight ${colorClass}`}>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}

export default function ScaleMetrics() {
  return (
    <section className="py-24 px-6 border-y border-surface-border relative overflow-hidden" style={{ background: 'rgba(20, 42, 52, 0.45)' }}>
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
        {METRICS.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 25, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="glass-panel p-6 rounded-xl border border-surface-border/60 hover:border-forsythia/40 transition-all duration-300 text-center md:text-left shadow-lg"
          >
            <Counter value={m.value} decimals={m.decimals} prefix={m.prefix} suffix={m.suffix} colorClass={m.color} />
            <p className="mt-3 text-sm text-mystic/65 leading-snug font-medium">{m.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}


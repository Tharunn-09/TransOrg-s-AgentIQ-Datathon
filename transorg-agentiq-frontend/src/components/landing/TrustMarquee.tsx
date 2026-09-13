import { motion } from 'framer-motion';

const PARTNERS = ['HDFC Bank', 'NPCI Switch', 'Razorpay', 'PhonePe', 'ICICI Bank', 'Pine Labs', 'CRED', 'Paytm Payments Bank'];

export default function TrustMarquee() {
  const loop = [...PARTNERS, ...PARTNERS];
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="py-12 border-y border-surface-border relative overflow-hidden bg-white/[0.01]"
    >
      <p className="text-center eyebrow text-[11px] text-mystic/50 mb-6 font-mono uppercase tracking-wider">
        Integrated Across National Payment Switches &amp; BFSI Issuers
      </p>
      <div className="relative overflow-hidden mask-fade">
        <div className="flex w-max animate-marquee gap-16 items-center">
          {loop.map((p, i) => (
            <span
              key={i}
              className="text-lg font-display font-medium text-mystic/40 hover:text-forsythia transition-colors duration-300 whitespace-nowrap cursor-default"
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    </motion.section>
  );
}


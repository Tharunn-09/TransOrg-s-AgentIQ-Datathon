import { Check } from 'lucide-react';

const TIERS = [
  {
    name: 'Starter',
    sub: 'Sandbox',
    price: '₹0',
    period: '/mo',
    features: ['Single environment', 'Community connectors', 'Sample data exploration'],
    highlight: false,
  },
  {
    name: 'Scale',
    sub: 'FinTechs & PAs',
    price: '₹49,999',
    period: '/mo',
    features: ['Unlimited agents', '200+ connectors', 'Real-time alerts', 'Priority support'],
    highlight: true,
  },
  {
    name: 'Enterprise',
    sub: 'Banks & regulators',
    price: 'Custom',
    period: '',
    features: ['On-prem / BYO-cloud', 'SOC 2 & RBI compliance', 'Dedicated solutions engineer', 'Custom SAR pipelines'],
    highlight: false,
  },
];

export default function PricingSection({ onLaunch }: { onLaunch: () => void }) {
  return (
    <section id="pricing" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-lg mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl text-arctic mb-4">Plans that scale with your mesh</h2>
          <p className="text-mystic/60 leading-relaxed">Start on the sandbox, move to production the day you need it.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className={`rounded-lg p-7 flex flex-col ${
                t.highlight
                  ? 'border-2 border-forsythia bg-gradient-to-b from-white/[0.04] to-transparent relative'
                  : 'glass-panel'
              }`}
            >
              {t.highlight && (
                <span className="absolute -top-3 left-7 text-[11px] mono font-medium px-2.5 py-1 rounded-full text-oceanic bg-gradient-to-r from-forsythia to-saffron">
                  MOST POPULAR
                </span>
              )}
              <p className="text-sm text-mystic/50 mb-1">{t.sub}</p>
              <h3 className="text-xl font-display font-semibold text-arctic mb-4">{t.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-display font-semibold text-arctic">{t.price}</span>
                <span className="text-sm text-mystic/50">{t.period}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-mystic/70">
                    <Check size={15} className="text-forsythia mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={onLaunch}
                className={`w-full py-2.5 rounded-md text-sm font-medium transition-all duration-300 ${
                  t.highlight
                    ? 'text-oceanic bg-gradient-to-r from-forsythia to-saffron hover:shadow-glow'
                    : 'text-arctic border border-surface-border hover:bg-white/5'
                }`}
              >
                {t.price === 'Custom' ? 'Talk to sales' : 'Get started'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

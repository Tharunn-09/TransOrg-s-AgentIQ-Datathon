import { useState } from 'react';

const STEPS = [
  {
    label: 'Connect',
    code: `agentiq.connect({\n  switch: "npci_upi",\n  mode: "realtime_cdc"\n})`,
  },
  {
    label: 'Compose',
    code: `pipeline.agent("syndicate_detector").match({\n  ring_size: "3+",\n  pagerank: ">0.85"\n})`,
  },
  {
    label: 'Enforce',
    code: `$ agentiq deploy --freeze-account --fiu-sar-generate\n✔ 14 hubs locked · p99 12ms`,
  },
];

export default function InteractiveWorkflow() {
  const [active, setActive] = useState(0);

  return (
    <section id="workflow" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="max-w-xl mb-12">
          <h2 className="text-3xl md:text-4xl text-arctic mb-4">From ingestion to enforcement</h2>
          <p className="text-mystic/60 leading-relaxed">
            Three stages take a raw transaction stream to a frozen account and a
            regulator-ready dossier.
          </p>
        </div>

        <div className="glass-panel overflow-hidden">
          <div className="flex border-b border-surface-border">
            {STEPS.map((s, i) => (
              <button
                key={s.label}
                onClick={() => setActive(i)}
                className={`flex-1 px-5 py-4 text-sm font-medium transition-colors duration-300 border-r border-surface-border last:border-r-0 ${
                  active === i ? 'text-forsythia bg-white/[0.03]' : 'text-mystic/50 hover:text-mystic'
                }`}
              >
                {String(i + 1).padStart(2, '0')} · {s.label}
              </button>
            ))}
          </div>
          <pre className="p-6 md:p-8 mono text-sm leading-relaxed text-mystic overflow-x-auto min-h-[140px]">
            <code>{STEPS[active].code}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}

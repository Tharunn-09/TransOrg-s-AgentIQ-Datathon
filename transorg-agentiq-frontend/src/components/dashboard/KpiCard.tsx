import type { LucideIcon } from 'lucide-react';

export default function KpiCard({
  label,
  value,
  sublabel,
  icon: Icon,
  tone = 'default',
}: {
  label: string;
  value: string;
  sublabel?: string;
  icon?: LucideIcon;
  tone?: 'default' | 'warning' | 'positive';
}) {
  const toneColor = tone === 'warning' ? 'text-saffron' : tone === 'positive' ? 'text-forsythia' : 'text-arctic';
  return (
    <div className="glass-panel p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] mono text-mystic/50 uppercase">{label}</p>
        {Icon && <Icon size={14} className="text-mystic/40" />}
      </div>
      <p className={`text-2xl font-display font-semibold ${toneColor}`}>{value}</p>
      {sublabel && <p className="text-xs text-mystic/45">{sublabel}</p>}
    </div>
  );
}

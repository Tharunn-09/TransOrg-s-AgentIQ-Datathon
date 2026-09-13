const STYLES: Record<string, string> = {
  Critical: 'bg-saffron/15 text-saffron border-saffron/30',
  High: 'bg-saffron/10 text-saffron/90 border-saffron/20',
  Medium: 'bg-forsythia/10 text-forsythia border-forsythia/25',
  Low: 'bg-mystic/10 text-mystic/70 border-mystic/20',
  Held: 'bg-saffron/15 text-saffron border-saffron/30',
  'Under Review': 'bg-forsythia/10 text-forsythia border-forsythia/25',
  Active: 'bg-nocturnal/40 text-mystic/70 border-mystic/15',
};

export default function RiskBadge({ label }: { label: string }) {
  const style = STYLES[label] ?? 'bg-mystic/10 text-mystic/70 border-mystic/20';
  return (
    <span className={`inline-flex items-center text-[11px] mono px-2 py-0.5 rounded-full border ${style}`}>
      {label}
    </span>
  );
}

export function RiskScoreBar({ score }: { score: number }) {
  const color = score >= 85 ? '#FF9932' : score >= 60 ? '#FFC801' : '#9BAEAF';
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-xs mono text-mystic/60 w-7">{score}</span>
    </div>
  );
}

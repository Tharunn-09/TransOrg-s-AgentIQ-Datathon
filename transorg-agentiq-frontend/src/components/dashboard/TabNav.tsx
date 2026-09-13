import {
  LayoutDashboard, Building2, UserRound, Scale, Share2, MapPinned, Bot, FlaskConical, ShieldCheck,
} from 'lucide-react';

export const TABS = [
  { id: 'overview', label: 'Executive overview', icon: LayoutDashboard },
  { id: 'merchant', label: 'Merchant risk', icon: Building2 },
  { id: 'customer', label: 'Customer risk', icon: UserRound },
  { id: 'disputes', label: 'Disputes', icon: Scale },
  { id: 'network', label: 'Fraud rings', icon: Share2 },
  { id: 'geo', label: 'Regional telemetry', icon: MapPinned },
  { id: 'copilot', label: 'Agentic copilot', icon: Bot },
  { id: 'sandbox', label: 'Attack sandbox', icon: FlaskConical },
  { id: 'compliance', label: 'Compliance & SAR', icon: ShieldCheck },
] as const;

export type TabId = (typeof TABS)[number]['id'];

export default function TabNav({ active, onChange }: { active: TabId; onChange: (id: TabId) => void }) {
  return (
    <nav className="flex flex-col gap-0.5 p-3">
      {TABS.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm text-left transition-colors duration-200 ${
            active === t.id
              ? 'bg-forsythia/10 text-forsythia border border-forsythia/20'
              : 'text-mystic/60 hover:text-arctic hover:bg-white/[0.03] border border-transparent'
          }`}
        >
          <t.icon size={16} strokeWidth={1.8} />
          {t.label}
        </button>
      ))}
    </nav>
  );
}

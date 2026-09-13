import { useEffect, useState } from 'react';
import { LogOut, Menu, SlidersHorizontal } from 'lucide-react';
import { roleLabel, type SessionUser } from '../../lib/useAppState';
import BrandLogo from '../common/BrandLogo';

export default function TopBar({
  user,
  onSignOut,
  onMenuToggle,
  onOpenSettings,
  activeFilterCount = 0,
}: {
  user: SessionUser;
  onSignOut: () => void;
  onMenuToggle?: () => void;
  onOpenSettings?: () => void;
  activeFilterCount?: number;
}) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const date = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <header className="h-16 border-b border-surface-border flex items-center justify-between px-4 md:px-6 sticky top-0 z-40" style={{ background: 'rgba(16, 35, 43, 0.85)', backdropFilter: 'blur(14px)' }}>
      <div className="flex items-center gap-3">
        <button onClick={onMenuToggle} className="lg:hidden text-mystic/60 hover:text-arctic">
          <Menu size={20} />
        </button>
        <BrandLogo variant="compact" size="sm" />
      </div>

      <div className="flex items-center gap-4">
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-surface-border hover:border-forsythia/50 bg-white/[0.02] hover:bg-white/[0.05] text-xs font-mono text-mystic hover:text-arctic transition-colors"
            title="Global filters and LLM key configuration"
          >
            <SlidersHorizontal size={14} className="text-forsythia" />
            <span className="hidden sm:inline">Filters &amp; Config</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-forsythia text-oceanic text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        )}

        <div className="hidden md:flex items-center gap-1.5 text-[11px] mono px-2.5 py-1 rounded-full border border-saffron/30 bg-saffron/10 text-saffron">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-saffron opacity-70" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-saffron" />
          </span>
          THREAT LEVEL: ELEVATED
        </div>

        <div className="hidden md:block text-right mono">
          <p className="text-xs text-arctic leading-tight">{time}</p>
          <p className="text-[10px] text-mystic/40 leading-tight">{date}</p>
        </div>

        <div className="flex items-center gap-2 pl-4 border-l border-surface-border">
          <div className="w-7 h-7 rounded-full bg-nocturnal flex items-center justify-center text-xs font-medium text-mystic">
            {user.displayName.charAt(0)}
          </div>
          <div className="hidden sm:block leading-tight">
            <p className="text-xs text-arctic">{user.displayName}</p>
            <p className="text-[10px] mono text-mystic/40">{roleLabel(user.role)}</p>
          </div>
          <button onClick={onSignOut} className="text-mystic/50 hover:text-saffron transition-colors ml-1" aria-label="Sign out" title="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}

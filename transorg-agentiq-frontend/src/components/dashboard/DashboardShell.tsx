import { useState, type ReactElement } from 'react';
import { X } from 'lucide-react';
import TopBar from './TopBar';
import TabNav, { TABS, type TabId } from './TabNav';
import type { SessionUser } from '../../lib/useAppState';
import BrandLogo from '../common/BrandLogo';
import OverviewTab from './tabs/OverviewTab';
import MerchantTab from './tabs/MerchantTab';
import CustomerTab from './tabs/CustomerTab';
import DisputesTab from './tabs/DisputesTab';
import NetworkTab from './tabs/NetworkTab';
import GeoTab from './tabs/GeoTab';
import CopilotTab from './tabs/CopilotTab';
import SandboxTab from './tabs/SandboxTab';
import ComplianceTab from './tabs/ComplianceTab';
import GlobalSettingsModal from './GlobalSettingsModal';
import FloatingChatbot from './FloatingChatbot';

const TAB_COMPONENTS: Record<TabId, () => ReactElement> = {
  overview: OverviewTab,
  merchant: MerchantTab,
  customer: CustomerTab,
  disputes: DisputesTab,
  network: NetworkTab,
  geo: GeoTab,
  copilot: CopilotTab,
  sandbox: SandboxTab,
  compliance: ComplianceTab,
};

export default function DashboardShell({ user, onSignOut }: { user: SessionUser; onSignOut: () => void }) {
  const [tab, setTab] = useState<TabId>('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Global Filter State
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRiskSegment, setSelectedRiskSegment] = useState('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');

  const activeFilterCount =
    (selectedCategory !== 'All' ? 1 : 0) +
    (selectedRiskSegment !== 'ALL' ? 1 : 0) +
    (selectedSeverity !== 'ALL' ? 1 : 0);

  const ActiveTab = TAB_COMPONENTS[tab];
  const activeMeta = TABS.find((t) => t.id === tab)!;

  return (
    <div className="min-h-screen flex">
      <aside className="hidden lg:flex flex-col w-64 border-r border-surface-border flex-shrink-0 sticky top-0 h-screen">
        <div className="h-16 flex items-center px-4 border-b border-surface-border">
          <BrandLogo variant="compact" size="sm" />
        </div>
        <div className="flex-1 overflow-y-auto">
          <TabNav active={tab} onChange={setTab} />
        </div>
      </aside>

      {mobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileNavOpen(false)} />
          <div className="relative w-64 h-full bg-surface border-r border-surface-border flex flex-col">
            <div className="h-16 flex items-center justify-between px-4 border-b border-surface-border">
              <BrandLogo variant="compact" size="sm" />
              <button onClick={() => setMobileNavOpen(false)} className="text-mystic/60"><X size={18} /></button>
            </div>
            <TabNav active={tab} onChange={(id) => { setTab(id); setMobileNavOpen(false); }} />
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <TopBar
          user={user}
          onSignOut={onSignOut}
          onMenuToggle={() => setMobileNavOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
          activeFilterCount={activeFilterCount}
        />
        <main className="p-4 md:p-6 max-w-[1400px] mx-auto">
          <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="eyebrow text-[11px] text-forsythia mb-1">
                TAB {String(TABS.findIndex((t) => t.id === tab) + 1).padStart(2, '0')} / {TABS.length}
              </p>
              <h1 className="text-2xl font-display font-semibold text-arctic">{activeMeta.label}</h1>
            </div>

            {activeFilterCount > 0 && (
              <div className="flex items-center gap-2 text-xs mono px-3 py-1.5 rounded-md bg-forsythia/10 border border-forsythia/30 text-forsythia">
                <span>Active Filters:</span>
                {selectedCategory !== 'All' && <span className="bg-surface px-2 py-0.5 rounded text-arctic">{selectedCategory}</span>}
                {selectedRiskSegment !== 'ALL' && <span className="bg-surface px-2 py-0.5 rounded text-arctic">{selectedRiskSegment} Risk</span>}
                {selectedSeverity !== 'ALL' && <span className="bg-surface px-2 py-0.5 rounded text-arctic">{selectedSeverity} Sev</span>}
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedRiskSegment('ALL');
                    setSelectedSeverity('ALL');
                  }}
                  className="hover:underline text-[11px] text-mystic ml-1"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
          <ActiveTab />
        </main>
      </div>

      <GlobalSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedRiskSegment={selectedRiskSegment}
        onSelectRiskSegment={setSelectedRiskSegment}
        selectedSeverity={selectedSeverity}
        onSelectSeverity={setSelectedSeverity}
      />

      <FloatingChatbot
        userName={user.displayName}
        userRole={user.role}
        onNavigateTab={(tabId: string) => setTab(tabId as TabId)}
      />
    </div>
  );
}

import BrandLogo from '../common/BrandLogo';

export default function Footer() {
  return (
    <footer className="border-t border-surface-border py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <BrandLogo variant="full" size="sm" />
        <p className="text-xs text-mystic/40 mono">
          Built for the TransOrg AgentIQ Datathon · Track 1 · FinTech &amp; BFSI
        </p>
      </div>
    </footer>
  );
}

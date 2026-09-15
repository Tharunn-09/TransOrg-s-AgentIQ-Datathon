interface BrandLogoProps {
  variant?: 'full' | 'compact' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PicklIcon({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="20" cy="20" r="19" fill="url(#picklGrad)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
      {/* P loop */}
      <path
        d="M13 28V12C13 12 17.5 12 21.5 12C25.5 12 28 14.5 28 18C28 21.5 25.5 24 21.5 24H17.5"
        stroke="#FFFFFF"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Pickl dot inside P */}
      <circle cx="20.5" cy="18" r="2.2" fill="#38BDF8" />
      <defs>
        <linearGradient id="picklGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0F3846" />
          <stop offset="1" stopColor="#0B1A24" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function TransOrgIcon({ size = 26, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Blue Arc */}
      <path
        d="M6 26A14 14 0 0 1 30 18"
        stroke="#0284C7"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Middle Green Arc */}
      <path
        d="M10 26A10 10 0 0 1 27 22"
        stroke="#84CC16"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      {/* Inner Cyan/Yellow Arc */}
      <path
        d="M14 26A6 6 0 0 1 24 25"
        stroke="#38BDF8"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function BrandLogo({ variant = 'full', size = 'md', className = '' }: BrandLogoProps) {
  const isLg = size === 'lg';
  const isSm = size === 'sm';

  if (variant === 'icon') {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <PicklIcon size={isLg ? 36 : isSm ? 24 : 30} />
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2.5 select-none ${className}`}>
        <PicklIcon size={isLg ? 34 : isSm ? 22 : 28} />
        <div className="flex items-center gap-1.5 font-display">
          <span className="font-bold tracking-tight text-arctic text-base sm:text-lg">Pickl<span className="text-[#38BDF8]">.ai</span></span>
          <span className="text-mystic/30">|</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-forsythia">AgentIQ</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Pickl.ai brand */}
      <div className="flex items-center gap-2">
        <PicklIcon size={isLg ? 34 : isSm ? 22 : 28} />
        <div className="leading-none">
          <span className="font-display font-bold tracking-tight text-arctic text-lg sm:text-xl">
            Pickl<span className="text-[#38BDF8]">.ai</span>
          </span>
        </div>
      </div>

      {/* Vertical Divider */}
      <div className="h-6 w-[1px] bg-white/15 mx-0.5 hidden sm:block" />

      {/* TransOrg Analytics Powered By */}
      <div className="hidden sm:flex items-center gap-2">
        <TransOrgIcon size={isLg ? 28 : isSm ? 20 : 24} />
        <div className="flex flex-col leading-none">
          <span className="text-[8px] font-mono tracking-widest text-mystic/50 uppercase font-semibold">
            POWERED BY
          </span>
          <div className="flex items-center gap-1">
            <span className="font-display font-bold text-xs tracking-wider text-arctic uppercase">
              TRANSORG
            </span>
            <span className="font-mono text-[9px] tracking-widest text-[#38BDF8] uppercase font-medium">
              ANALYTICS
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}

import { useEffect, useState } from 'react';

export default function CountdownRing({ periodSeconds = 30 }: { periodSeconds?: number }) {
  const [remaining, setRemaining] = useState(periodSeconds - (Math.floor(Date.now() / 1000) % periodSeconds));

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(periodSeconds - (Math.floor(Date.now() / 1000) % periodSeconds));
    }, 1000);
    return () => clearInterval(id);
  }, [periodSeconds]);

  const radius = 15;
  const circumference = 2 * Math.PI * radius;
  const progress = remaining / periodSeconds;
  const low = remaining <= 5;

  return (
    <div className="relative w-9 h-9 flex-shrink-0">
      <svg width="36" height="36" viewBox="0 0 36 36" className="-rotate-90">
        <circle cx="18" cy="18" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke={low ? '#FF9932' : '#FFC801'}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] mono text-mystic">
        {remaining}
      </span>
    </div>
  );
}

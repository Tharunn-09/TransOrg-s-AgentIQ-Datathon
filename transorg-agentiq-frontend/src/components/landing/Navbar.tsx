import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import BrandLogo from '../common/BrandLogo';

const LINKS = [
  { label: 'Architecture', href: '#architecture' },
  { label: 'Datasets', href: '#datasets' },
  { label: 'Workflow Canvas', href: '#workflow' },
  { label: 'Capabilities', href: '#platform' },
  { label: 'Metrics', href: '#metrics' },
];

export default function Navbar({ onSignIn, onLaunch }: { onSignIn: () => void; onLaunch: () => void }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'py-3' : 'py-5'
        }`}
    >
      <div
        className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between rounded-xl transition-all duration-500 ${scrolled ? 'glass-panel py-2.5 px-5' : ''
          }`}
      >
        <BrandLogo variant="full" size="md" />

        <nav className="hidden lg:flex items-center gap-8">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-mystic/80 hover:text-arctic transition-colors duration-300"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={onSignIn}
            className="hidden sm:inline-flex text-sm text-mystic hover:text-arctic px-4 py-2 rounded-md transition-colors duration-300 hover:bg-white/5"
          >
            Sign in
          </button>
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ y: 0 }}
            onClick={onLaunch}
            className="text-sm font-medium px-4 py-2.5 rounded-md text-oceanic bg-gradient-to-r from-forsythia to-saffron shadow-[0_0_0_0_rgba(255,200,1,0)] hover:shadow-glow transition-shadow duration-500"
          >
            Launch platform →
          </motion.button>
        </div>
      </div>
    </header>
  );
}

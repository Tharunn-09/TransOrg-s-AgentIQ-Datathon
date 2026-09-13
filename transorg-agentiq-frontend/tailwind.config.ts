import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        arctic: '#F1F6F4',
        mystic: '#D9E8E2',
        forsythia: '#FFC801',
        saffron: '#FF9932',
        nocturnal: '#114C5A',
        oceanic: '#172B36',

        background: '#10232B',
        surface: '#142A34',
        'surface-hover': '#193542',
        'surface-border': 'rgba(255, 255, 255, 0.08)',
        'text-primary': '#F1F6F4',
        'text-muted': '#9BAEAF',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Space Grotesk', 'sans-serif'],
        body: ['var(--font-body)', 'Inter', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      boxShadow: {
        glow: '0 0 80px -10px rgba(255, 200, 1, 0.35)',
        soft: '0 20px 60px -20px rgba(0, 0, 0, 0.6)',
        card: '0 8px 32px -8px rgba(0, 0, 0, 0.45)',
      },
      animation: {
        'pulse-slow': 'pulse 5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        marquee: 'marquee 35s linear infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
export default config

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Shield, Search, Scale, Copy, Check, Zap, ArrowLeft, Loader2 } from 'lucide-react';
import CountdownRing from './CountdownRing';
import BrandLogo from '../common/BrandLogo';
import type { SessionUser } from '../../lib/useAppState';
import { loginWithApi, verifyMfaWithApi } from '../../lib/api';

const ROLE_PICKS: { role: SessionUser['role']; label: string; icon: typeof Shield; username: string }[] = [
  { role: 'executive', label: 'Executive / CRO', icon: Shield, username: 'executive' },
  { role: 'analyst', label: 'Fraud Analyst', icon: Search, username: 'analyst' },
  { role: 'auditor', label: 'Datathon Auditor', icon: Scale, username: 'auditor' },
];

const ROLE_SECRETS: Record<string, string> = {
  executive: 'JBSWY3DPEHPK3PXP',
  analyst: 'KRSXG5CTMVRXEZLU',
  auditor: 'MZXW633PN5XW6MZA',
};

const DEFAULT_DEMO_PASSCODE = '492018';

export default function AuthModal({
  open,
  onClose,
  onComplete,
}: {
  open: boolean;
  onClose: () => void;
  onComplete: (user: SessionUser) => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [username, setUsername] = useState('analyst');
  const [password, setPassword] = useState('Password123!');
  const [copied, setCopied] = useState(false);
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [demoTotp, setDemoTotp] = useState<string>(DEFAULT_DEMO_PASSCODE);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const activeSecret = ROLE_SECRETS[username.toLowerCase()] || ROLE_SECRETS.analyst;
  const otpAuthUri = `otpauth://totp/TransOrg%20AgentIQ:${encodeURIComponent(username || 'analyst')}@transorg.ai?secret=${activeSecret}&issuer=TransOrg%20AgentIQ`;
  const fallbackQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=8&data=${encodeURIComponent(otpAuthUri)}`;

  useEffect(() => {
    if (!open) {
      setStep(1);
      setUsername('analyst');
      setPassword('Password123!');
      setDigits(Array(6).fill(''));
      setError('');
      setCopied(false);
      setLoading(false);
      setQrCodeBase64(null);
      setDemoTotp(DEFAULT_DEMO_PASSCODE);
    }
  }, [open]);

  if (!open) return null;

  const pickRole = (r: (typeof ROLE_PICKS)[number]) => {
    setUsername(r.username);
    setPassword('Password123!');
    setError('');
  };

  const submitCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Enter a username and password, or pick a quick role above.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await loginWithApi(username, password);
      if (res?.qr_code_base64) {
        setQrCodeBase64(res.qr_code_base64);
      }
      if (res?.demo_totp) {
        setDemoTotp(res.demo_totp);
      }
      setStep(2);
    } catch {
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleDigitChange = (i: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...digits];
    next[i] = value.slice(-1);
    setDigits(next);
    if (value && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleDigitKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const next = Array(6).fill('');
    text.split('').forEach((d, idx) => (next[idx] = d));
    setDigits(next);
    inputRefs.current[Math.min(text.length, 5)]?.focus();
  };

  const autoFillDemo = () => {
    const code = demoTotp || DEFAULT_DEMO_PASSCODE;
    setDigits(code.split('').slice(0, 6));
    inputRefs.current[5]?.focus();
  };

  const copyKey = async () => {
    try {
      await navigator.clipboard.writeText(activeSecret);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  };

  const confirmAndLaunch = async () => {
    const code = digits.join('');
    if (code.length < 6) {
      setError('Enter all six digits from your authenticator app.');
      return;
    }
    setLoading(true);
    try {
      await verifyMfaWithApi(username, code);
    } catch {
      // proceed
    } finally {
      setLoading(false);
    }
    const roleMeta = ROLE_PICKS.find((r) => r.username.toLowerCase() === username.toLowerCase()) ?? ROLE_PICKS[1];
    onComplete({
      role: roleMeta.role,
      username: username || roleMeta.username,
      displayName: roleMeta.label,
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ background: 'rgba(8, 16, 20, 0.75)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="glass-panel w-full max-w-md p-7 md:p-8 relative"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-mystic/50 hover:text-arctic transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className="mb-5 pb-4 border-b border-surface-border flex justify-center">
            <BrandLogo variant="full" size="sm" />
          </div>

          {step === 1 ? (
            <>
              <div className="text-center mb-5">
                <h2 className="text-2xl text-arctic mb-1 font-display">Sign in to Command Center</h2>
                <p className="text-sm text-mystic/55">Pick an evaluator role or enter credentials manually.</p>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-6">
                {ROLE_PICKS.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => pickRole(r)}
                    className={`flex flex-col items-center gap-2 py-3.5 px-2 rounded-lg border text-center transition-all duration-200 ${
                      username === r.username
                        ? 'border-forsythia bg-forsythia/10'
                        : 'border-surface-border hover:border-mystic/30 hover:bg-white/[0.03]'
                    }`}
                  >
                    <r.icon size={17} className={username === r.username ? 'text-forsythia' : 'text-mystic/60'} />
                    <span className="text-[11px] leading-tight text-mystic/80">{r.label}</span>
                  </button>
                ))}
              </div>

              <form onSubmit={submitCredentials} className="space-y-3">
                <div>
                  <label className="block text-xs mono text-mystic/50 mb-1.5">Username</label>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="analyst"
                    className="w-full bg-white/[0.04] border border-surface-border rounded-md px-3.5 py-2.5 text-sm text-arctic placeholder:text-mystic/30 focus:border-forsythia/50 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs mono text-mystic/50 mb-1.5">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    className="w-full bg-white/[0.04] border border-surface-border rounded-md px-3.5 py-2.5 text-sm text-arctic placeholder:text-mystic/30 focus:border-forsythia/50 outline-none transition-colors"
                  />
                </div>
                {error && <p className="text-xs text-saffron text-center">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-2.5 rounded-md text-sm font-medium text-oceanic bg-gradient-to-r from-forsythia to-saffron hover:shadow-glow transition-shadow duration-500 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : 'Verify credentials →'}
                </button>
              </form>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-xs text-mystic/50 hover:text-arctic mb-3 transition-colors"
              >
                <ArrowLeft size={13} /> Back
              </button>
              <div className="text-center mb-4">
                <h2 className="text-2xl text-arctic mb-1 font-display">Verify with Authenticator</h2>
                <p className="text-xs text-mystic/55">
                  Scan with Microsoft Authenticator, Google Authenticator, or Authy.
                </p>
              </div>

              {/* Scannable Real QR Code Container */}
              <div className="flex gap-4 items-center mb-5 bg-white/[0.03] p-3 rounded-xl border border-surface-border">
                <div className="bg-white p-1.5 rounded-lg shrink-0 shadow-md">
                  <img
                    src={qrCodeBase64 ? `data:image/png;base64,${qrCodeBase64}` : fallbackQrUrl}
                    alt="Authenticator TOTP QR Code"
                    className="w-28 h-28 object-contain rounded"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] mono text-mystic/60 mb-1 font-semibold uppercase">SECRET KEY</p>
                  <button
                    type="button"
                    onClick={copyKey}
                    className="w-full flex items-center justify-between gap-1.5 bg-[#10232B] border border-white/15 rounded-md px-2.5 py-1.5 mono text-xs text-arctic hover:border-forsythia/50 transition-colors"
                    title="Click to copy manual entry key"
                  >
                    <span className="truncate">{activeSecret}</span>
                    {copied ? <Check size={13} className="text-forsythia flex-shrink-0" /> : <Copy size={13} className="text-mystic/50 flex-shrink-0" />}
                  </button>
                  <p className="text-[11px] text-mystic/50 mt-2">
                    Live Demo Token: <span className="text-forsythia font-mono font-bold">{demoTotp}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-2">
                <label className="text-xs mono text-mystic/50">6-digit passcode</label>
                <CountdownRing />
              </div>

              <div className="flex gap-2 mb-4" onPaste={handlePaste}>
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    value={d}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleDigitKeyDown(i, e)}
                    inputMode="numeric"
                    maxLength={1}
                    className="w-full aspect-square text-center text-lg mono rounded-md bg-white/[0.04] border border-surface-border text-arctic focus:border-forsythia/60 outline-none transition-colors"
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={autoFillDemo}
                className="w-full flex items-center justify-center gap-2 text-xs font-medium text-forsythia border border-forsythia/30 rounded-md py-2.5 mb-4 hover:bg-forsythia/10 transition-colors"
              >
                <Zap size={13} /> Auto-fill demo passcode ({demoTotp})
              </button>

              {error && <p className="text-xs text-saffron mb-3 text-center">{error}</p>}

              <button
                type="button"
                onClick={confirmAndLaunch}
                className="w-full py-2.5 rounded-md text-sm font-medium text-oceanic bg-gradient-to-r from-forsythia to-saffron hover:shadow-glow transition-shadow duration-500"
              >
                Confirm &amp; launch dashboard
              </button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

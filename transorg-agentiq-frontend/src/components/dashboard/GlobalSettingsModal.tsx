import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SlidersHorizontal, Key, Check, Sparkles, Filter, RefreshCw } from 'lucide-react';
import { saveLlmConfig, getFilterOptions } from '../../lib/api';

interface GlobalSettingsModalProps {
  open: boolean;
  onClose: () => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedRiskSegment: string;
  onSelectRiskSegment: (seg: string) => void;
  selectedSeverity: string;
  onSelectSeverity: (sev: string) => void;
}

export default function GlobalSettingsModal({
  open,
  onClose,
  selectedCategory,
  onSelectCategory,
  selectedRiskSegment,
  onSelectRiskSegment,
  selectedSeverity,
  onSelectSeverity,
}: GlobalSettingsModalProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [llmProvider, setLlmProvider] = useState<'groq' | 'gemini' | 'openai'>('groq');
  const [apiKey, setApiKey] = useState('');
  const [keySaved, setKeySaved] = useState(false);
  const [savingKey, setSavingKey] = useState(false);

  useEffect(() => {
    getFilterOptions().then((opts) => {
      if (opts?.categories) setCategories(['All', ...opts.categories]);
    });
  }, []);

  if (!open) return null;

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) return;
    setSavingKey(true);
    try {
      await saveLlmConfig(llmProvider, apiKey);
      setKeySaved(true);
      setTimeout(() => setKeySaved(false), 3000);
    } catch {
      // fallback
    } finally {
      setSavingKey(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-surface border border-surface-border rounded-xl p-6 shadow-2xl space-y-5"
        >
          <div className="flex items-center justify-between pb-3 border-b border-surface-border">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={18} className="text-forsythia" />
              <h2 className="text-base font-display font-semibold text-arctic">Global Telemetry Filters &amp; LLM Config</h2>
            </div>
            <button onClick={onClose} className="text-mystic/50 hover:text-arctic">
              <X size={18} />
            </button>
          </div>

          {/* 1. Global Filters */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-mono text-forsythia">
              <Filter size={13} />
              <span>PORTFOLIO FILTERS</span>
            </div>

            <div>
              <label className="block text-xs mono text-mystic/60 mb-1">Merchant Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => onSelectCategory(e.target.value)}
                className="w-full bg-white/[0.04] border border-surface-border rounded-md px-3 py-2 text-sm text-arctic outline-none focus:border-forsythia/50"
              >
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-oceanic">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs mono text-mystic/60 mb-1">Customer Risk Segment</label>
                <select
                  value={selectedRiskSegment}
                  onChange={(e) => onSelectRiskSegment(e.target.value)}
                  className="w-full bg-white/[0.04] border border-surface-border rounded-md px-3 py-2 text-sm text-arctic outline-none focus:border-forsythia/50"
                >
                  {['ALL', 'LOW', 'MEDIUM', 'HIGH', 'UNKNOWN'].map((s) => (
                    <option key={s} value={s} className="bg-oceanic">
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs mono text-mystic/60 mb-1">Dispute Severity</label>
                <select
                  value={selectedSeverity}
                  onChange={(e) => onSelectSeverity(e.target.value)}
                  className="w-full bg-white/[0.04] border border-surface-border rounded-md px-3 py-2 text-sm text-arctic outline-none focus:border-forsythia/50"
                >
                  {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((s) => (
                    <option key={s} value={s} className="bg-oceanic">
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 2. LLM Engine Keys */}
          <div className="pt-3 border-t border-surface-border space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-mono text-forsythia">
              <Key size={13} />
              <span>AGENTIC COPILOT LLM PROVIDER</span>
            </div>

            <div className="flex gap-2">
              {[
                { id: 'groq', label: 'Groq (Llama 3.3)' },
                { id: 'gemini', label: 'Gemini 3.6 Flash' },
                { id: 'openai', label: 'GPT-4o' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setLlmProvider(p.id as any)}
                  className={`flex-1 py-1.5 text-xs rounded-md border font-mono transition-colors ${
                    llmProvider === p.id
                      ? 'border-forsythia text-forsythia bg-forsythia/10 font-medium'
                      : 'border-surface-border text-mystic/60 hover:text-mystic'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSaveKey} className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`Paste ${llmProvider.toUpperCase()} API Key...`}
                className="flex-1 bg-white/[0.04] border border-surface-border rounded-md px-3 py-2 text-xs text-arctic outline-none focus:border-forsythia/50 font-mono"
              />
              <button
                type="submit"
                disabled={savingKey || !apiKey}
                className="px-4 py-2 bg-gradient-to-r from-forsythia to-saffron text-oceanic text-xs font-medium rounded-md flex items-center gap-1 hover:shadow-glow transition-shadow"
              >
                {keySaved ? <Check size={14} /> : savingKey ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                <span>{keySaved ? 'Saved!' : 'Activate'}</span>
              </button>
            </form>
            <p className="text-[11px] text-mystic/40">
              Optional: Enables live multi-LLM reasoning for Agentic Graph AI queries over UPI telemetry.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-md bg-white/[0.05] hover:bg-white/[0.08] text-xs font-mono text-arctic transition-colors"
            >
              Close &amp; Apply
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

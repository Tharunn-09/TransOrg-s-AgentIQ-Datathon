import { useState, useCallback } from 'react';

export type ViewState = 'landing' | 'dashboard';

export interface SessionUser {
  role: 'executive' | 'analyst' | 'auditor';
  displayName: string;
  username: string;
}

const ROLE_LABELS: Record<SessionUser['role'], string> = {
  executive: 'Executive / CRO',
  analyst: 'Fraud Analyst',
  auditor: 'Datathon Auditor',
};

export function roleLabel(role: SessionUser['role']) {
  return ROLE_LABELS[role];
}

export function useAppState() {
  const [view, setView] = useState<ViewState>('landing');
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);

  const openAuth = useCallback(() => setAuthOpen(true), []);
  const closeAuth = useCallback(() => setAuthOpen(false), []);

  const completeLogin = useCallback((u: SessionUser) => {
    setUser(u);
    setAuthOpen(false);
    setView('dashboard');
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    setView('landing');
  }, []);

  return { view, setView, authOpen, openAuth, closeAuth, user, completeLogin, signOut };
}

import LandingPage from './components/landing/LandingPage';
import AuthModal from './components/auth/AuthModal';
import DashboardShell from './components/dashboard/DashboardShell';
import { useAppState } from './lib/useAppState';

function App() {
  const { view, authOpen, openAuth, closeAuth, user, completeLogin, signOut } = useAppState();

  if (view === 'dashboard' && user) {
    return <DashboardShell user={user} onSignOut={signOut} />;
  }

  return (
    <>
      <LandingPage onSignIn={openAuth} onLaunch={openAuth} />
      <AuthModal open={authOpen} onClose={closeAuth} onComplete={completeLogin} />
    </>
  );
}

export default App;

import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, GraduationCap, LoaderCircle } from 'lucide-react';
import { PrimaryButton, Toast } from './components';
import {
  CommunityPage, DashboardPage, DiscoveryPage, EventsPage, OpportunitiesPage,
  StudentWorkspacePage, ToolsPage,
} from './pages';
import { StudentProfilePage } from './profile';
import { RoleDashboard } from './role-dashboards/RoleDashboard';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { AccountProfilePage, PendingPage } from './auth/AccountPages';
import { LoginPage } from './auth/LoginPage';
import { RoleSiteHeader } from './auth/RoleSiteHeader';
import { AccountUtilityPage } from './auth/UtilityPages';
import { canRoleAccessPath, roleHome } from './roles';
import type { RoleDashboardSnapshot, RoleAction } from './auth/types';
import type { AppActions } from './types';

const EMPTY_SNAPSHOT: RoleDashboardSnapshot = { metrics: [], records: {} };

function readStoredList(key: string): string[] {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as string[] : [];
  } catch {
    return [];
  }
}

function AuthenticatedApp() {
  const {
    loading, user, signOut, runAction,
    saveAccountProfile, saveOrganizationProfile,
  } = useAuth();
  const [path, setPath] = useState(window.location.pathname || '/');
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [appliedIds, setAppliedIds] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [snapshot, setSnapshot] = useState<RoleDashboardSnapshot>(EMPTY_SNAPSHOT);
  const accountKey = user?.openId || 'signed-out';

  const navigate = useCallback((nextPath: string) => {
    if (!nextPath.startsWith('/')) return;
    if (window.location.pathname !== nextPath) window.history.pushState({}, '', nextPath);
    setPath(nextPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname || '/');
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    setSavedIds(readStoredList(`unihub-saved:${accountKey}`));
    setAppliedIds(readStoredList(`unihub-applied:${accountKey}`));
  }, [accountKey]);
  useEffect(() => { localStorage.setItem(`unihub-saved:${accountKey}`, JSON.stringify(savedIds)); }, [accountKey, savedIds]);
  useEffect(() => { localStorage.setItem(`unihub-applied:${accountKey}`, JSON.stringify(appliedIds)); }, [accountKey, appliedIds]);
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(''), 3200);
    return () => window.clearTimeout(timer);
  }, [message]);

  const refreshDashboard = useCallback(async () => {
    if (!user || user.roleStatus !== 'active' || user.role === 'student') {
      setSnapshot(EMPTY_SNAPSHOT);
      return;
    }
    const response = await fetch('/api/dashboard', { credentials: 'same-origin', headers: { Accept: 'application/json' } });
    if (!response.ok) {
      let errorMessage = 'Workspace information could not be loaded.';
      try { const body = await response.json() as { error?: string }; if (body.error) errorMessage = body.error; } catch { /* Keep safe message. */ }
      throw new Error(errorMessage);
    }
    setSnapshot(await response.json() as RoleDashboardSnapshot);
  }, [user?.openId, user?.role, user?.roleStatus]);

  useEffect(() => {
    let mounted = true;
    void refreshDashboard().catch(() => { if (mounted) setSnapshot(EMPTY_SNAPSHOT); });
    return () => { mounted = false; };
  }, [refreshDashboard]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      if (path !== '/login') navigate('/login');
      return;
    }
    if (user.roleStatus === 'pending') {
      if (!['/pending', '/account/profile', '/settings'].includes(path)) navigate('/pending');
      return;
    }
    if (user.roleStatus === 'suspended') {
      if (!['/account/profile', '/settings'].includes(path)) navigate('/settings');
      return;
    }
    if (path === '/' || path === '/login' || !canRoleAccessPath(user.role, user.roleStatus, path)) navigate(roleHome(user.role));
  }, [loading, user, path, navigate]);

  const toggleSaved = (id: string) => {
    setSavedIds((current) => {
      const exists = current.includes(id);
      setMessage(exists ? 'Removed from your saved list' : 'Saved to your opportunities');
      return exists ? current.filter((item) => item !== id) : [...current, id];
    });
  };
  const apply = (id: string, title: string) => {
    setAppliedIds((current) => current.includes(id) ? current : [...current, id]);
    setMessage(`Added “${title}” to your application tracker`);
  };
  const actions: AppActions = { navigate, toast: setMessage, toggleSaved, apply, savedIds, appliedIds };

  const executeRoleAction = useCallback(async (action: RoleAction) => {
    await runAction(action);
    try { await refreshDashboard(); } catch { /* Successful writes remain successful if a read refresh is temporarily unavailable. */ }
  }, [runAction, refreshDashboard]);

  const doSignOut = async () => {
    try {
      await signOut();
      setMessage('You have signed out.');
      navigate('/login');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Sign out could not be completed.');
    }
  };

  if (loading) return <div className="auth-loading-screen"><LoaderCircle className="auth-loading-spin" size={27}/><b>Checking your UniHub session…</b><span>Role access is verified securely before your workspace opens.</span></div>;
  if (!user) return <LoginPage />;

  const pending = user.roleStatus === 'pending';
  const suspended = user.roleStatus === 'suspended';
  let visiblePath = path;
  if (pending && !['/pending', '/account/profile', '/settings'].includes(path)) visiblePath = '/pending';
  else if (suspended && !['/account/profile', '/settings'].includes(path)) visiblePath = '/settings';
  else if (!pending && !suspended && (path === '/' || path === '/login' || !canRoleAccessPath(user.role, user.roleStatus, path))) visiblePath = roleHome(user.role);

  if (visiblePath === '/login' || visiblePath === '/') visiblePath = pending ? '/pending' : roleHome(user.role);
  let page: React.ReactNode;
  if (pending && visiblePath !== '/account/profile' && visiblePath !== '/settings') {
    page = <PendingPage user={user} onNavigate={navigate} onSignOut={() => void doSignOut()} />;
  } else if (visiblePath === '/account/profile') {
    page = <AccountProfilePage user={user} onSaveAccount={saveAccountProfile} onSaveOrganization={saveOrganizationProfile} onNavigate={navigate} onToast={setMessage} />;
  } else if (visiblePath === '/notifications' || visiblePath === '/settings') {
    if (user.role === 'student' && !pending && !suspended) page = <StudentWorkspacePage {...actions} path={visiblePath} />;
    else page = <AccountUtilityPage path={visiblePath} user={user} onSave={saveAccountProfile} onNavigate={navigate} onToast={setMessage} />;
  } else if (user.role === 'student') {
    if (visiblePath === '/dashboard' || visiblePath.startsWith('/dashboard/')) page = <DashboardPage {...actions} path={visiblePath} user={user} saveProfile={saveAccountProfile} />;
    else if (visiblePath === '/profile') page = <StudentProfilePage {...actions} user={user} saveProfile={saveAccountProfile} />;
    else if (visiblePath.startsWith('/events')) page = <EventsPage {...actions} path={visiblePath} />;
    else if (['/opportunities', '/internships', '/jobs', '/hackathons', '/scholarships', '/courses', '/government-portals'].includes(visiblePath)) page = <OpportunitiesPage {...actions} path={visiblePath} />;
    else if (visiblePath === '/ai-tools' || visiblePath === '/ai-hub') page = <ToolsPage {...actions} path={visiblePath} />;
    else if (visiblePath === '/colleges' || visiblePath === '/organizations') page = <DiscoveryPage {...actions} path={visiblePath} />;
    else if (['/community', '/posts', '/connections', '/followers', '/messages'].includes(visiblePath)) page = <CommunityPage {...actions} path={visiblePath} />;
    else if (['/applications', '/saved', '/rewards'].includes(visiblePath)) page = <StudentWorkspacePage {...actions} path={visiblePath} />;
    else page = <div className="not-found"><span><GraduationCap size={28}/></span><h1>That page is taking a study break.</h1><p>Explore your student dashboard or find your next opportunity.</p><PrimaryButton onClick={() => navigate(roleHome(user.role))}>Back to dashboard <ArrowRight size={17}/></PrimaryButton></div>;
  } else if (user.role === 'job_seeker' && visiblePath === '/messages') {
    page = <CommunityPage {...actions} path={visiblePath} />;
  } else {
    page = <RoleDashboard user={user} path={visiblePath} snapshot={snapshot} onNavigate={navigate} onAction={executeRoleAction} onToast={setMessage} />;
  }

  return <div className="app-shell">
    <RoleSiteHeader path={visiblePath} role={user.role} status={user.roleStatus} displayName={user.displayName} navigate={navigate} onSignOut={doSignOut}/>
    <main className="page-container">{page}</main>
    <footer className="site-footer"><span>© 2026 UniHub AI</span><span>{user.role === 'student' ? 'One hub for everything you’re becoming.' : `${user.displayName} · ${user.role.replace('_', ' ')} workspace`}</span><button onClick={() => navigate('/settings')}>Privacy & settings</button></footer>
    <Toast message={message} onClose={() => setMessage('')} />
  </div>;
}

export default function App() {
  return <AuthProvider><AuthenticatedApp /></AuthProvider>;
}

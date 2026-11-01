import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, GraduationCap } from 'lucide-react';
import { SiteHeader, PrimaryButton, Toast } from './components';
import {
  DashboardPage, EventsPage, LoginPage, OpportunitiesPage, DiscoveryPage,
  CommunityPage, StudentWorkspacePage, ToolsPage, OrganizationDashboardPage,
} from './pages';
import { StudentProfilePage } from './profile';
import type { AppActions } from './types';

function readStoredList(key: string): string[] {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as string[] : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [path, setPath] = useState(window.location.pathname || '/dashboard');
  const [savedIds, setSavedIds] = useState<string[]>(() => readStoredList('unihub-saved'));
  const [appliedIds, setAppliedIds] = useState<string[]>(() => readStoredList('unihub-applied'));
  const [message, setMessage] = useState('');

  const navigate = useCallback((nextPath: string) => {
    if (!nextPath.startsWith('/')) return;
    if (window.location.pathname !== nextPath) window.history.pushState({}, '', nextPath);
    setPath(nextPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname || '/dashboard');
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => { localStorage.setItem('unihub-saved', JSON.stringify(savedIds)); }, [savedIds]);
  useEffect(() => { localStorage.setItem('unihub-applied', JSON.stringify(appliedIds)); }, [appliedIds]);
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(''), 3200);
    return () => window.clearTimeout(timer);
  }, [message]);

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

  if (path === '/login') return <LoginPage {...actions} />;

  let page;
  if (path === '/' || path === '/dashboard') page = <DashboardPage {...actions} path={path} />;
  else if (path === '/profile') page = <StudentProfilePage {...actions} />;
  else if (path.startsWith('/events')) page = <EventsPage {...actions} path={path} />;
  else if (['/opportunities', '/internships', '/jobs', '/hackathons', '/scholarships', '/courses', '/government-portals'].includes(path)) page = <OpportunitiesPage {...actions} path={path} />;
  else if (path === '/ai-tools' || path === '/ai-hub') page = <ToolsPage {...actions} path={path} />;
  else if (path === '/colleges' || path === '/organizations') page = <DiscoveryPage {...actions} path={path} />;
  else if (['/community', '/posts', '/connections', '/messages'].includes(path)) page = <CommunityPage {...actions} path={path} />;
  else if (['/applications', '/saved', '/rewards', '/notifications', '/settings'].includes(path)) page = <StudentWorkspacePage {...actions} path={path} />;
  else if (['/organization/college', '/organization/company', '/organization/events', '/admin'].includes(path)) page = <OrganizationDashboardPage key={path} {...actions} path={path} />;
  else page = <div className="not-found"><span><GraduationCap size={28} /></span><h1>That page is taking a study break.</h1><p>Explore your dashboard or find your next opportunity from the navigation.</p><PrimaryButton onClick={() => navigate('/dashboard')}>Back to dashboard <ArrowRight size={17} /></PrimaryButton></div>;

  return <div className="app-shell">
    <SiteHeader path={path} navigate={navigate} />
    <main className="page-container">{page}</main>
    <footer className="site-footer"><span>© 2026 UniHub AI</span><span>One hub for everything you’re becoming.</span><button onClick={() => navigate('/settings')}>Privacy & settings</button></footer>
    <Toast message={message} onClose={() => setMessage('')} />
  </div>;
}

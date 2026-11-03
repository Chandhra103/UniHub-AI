import { useState } from 'react';
import {
  Bell, BookOpen, BriefcaseBusiness, Building2, CalendarDays, ChartNoAxesColumnIncreasing,
  ChevronDown, Code2, FileText, GraduationCap, Heart, Landmark, LogOut, Menu,
  MoreHorizontal, Search, ShieldCheck, Sparkles, Star, Target, UserRound, Users, Wrench, X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { roleDefinition } from '../roles';
import type { AccountRole, AccountStatus } from '../roles';

type Props = {
  path: string;
  role: AccountRole;
  status: AccountStatus;
  displayName: string;
  navigate: (path: string) => void;
  onSignOut: () => void;
};

type Link = { label: string; path: string; icon?: string };
const icons: Record<string, LucideIcon> = {
  calendar: CalendarDays,
  briefcase: BriefcaseBusiness,
  code: Code2,
  tools: Wrench,
  book: BookOpen,
  users: Users,
  file: FileText,
  landmark: Landmark,
  building: Building2,
  heart: Heart,
  compass: Target,
  user: UserRound,
  chart: ChartNoAxesColumnIncreasing,
  target: Target,
  search: Search,
  star: Star,
  shield: ShieldCheck,
};

function secondaryLinks(role: AccountRole): Link[] {
  const global: Link[] = [
    { label: 'Account profile', path: '/account/profile', icon: 'user' },
    { label: 'Notifications', path: '/notifications', icon: 'file' },
    { label: 'Settings', path: '/settings', icon: 'tools' },
  ];
  if (role === 'student') return [
    { label: 'Government portals', path: '/government-portals', icon: 'landmark' },
    { label: 'Scholarships', path: '/scholarships', icon: 'book' },
    { label: 'College festivals', path: '/events/festivals', icon: 'calendar' },
    { label: 'Company meetups', path: '/events/meetups', icon: 'calendar' },
    { label: 'AI Hub', path: '/ai-hub', icon: 'tools' },
    { label: 'Discover colleges', path: '/colleges', icon: 'chart' },
    { label: 'Organizations', path: '/organizations', icon: 'users' },
    { label: 'Applications', path: '/applications', icon: 'file' },
    { label: 'Saved opportunities', path: '/saved', icon: 'heart' },
    { label: 'Rewards', path: '/rewards', icon: 'star' },
    { label: 'Messages', path: '/messages', icon: 'users' },
    ...global,
  ];
  if (role === 'job_seeker') return [
    { label: 'Career guidance', path: '/job-seeker/guidance', icon: 'compass' },
    { label: 'Messages', path: '/messages', icon: 'users' },
    ...global,
  ];
  if (role === 'college') return [
    { label: 'Campus opportunities', path: '/college/opportunities', icon: 'briefcase' },
    { label: 'Student engagement', path: '/college/analytics', icon: 'chart' },
    ...global,
  ];
  if (role === 'company') return [
    { label: 'Company analytics', path: '/company/analytics', icon: 'chart' },
    ...global,
  ];
  if (role === 'recruiter') return [
    { label: 'Recruitment activity', path: '/recruiter/activities', icon: 'target' },
    ...global,
  ];
  if (role === 'event_organizer') return [
    { label: 'Participants', path: '/organizer/participants', icon: 'users' },
    { label: 'Event analytics', path: '/organizer/analytics', icon: 'chart' },
    ...global,
  ];
  if (role === 'teacher_researcher') return [
    { label: 'Academic community', path: '/academic/community', icon: 'users' },
    ...global,
  ];
  if (role === 'ngo_training') return [
    { label: 'Cohorts', path: '/ngo/cohorts', icon: 'users' },
    { label: 'Engagement', path: '/ngo/engagement', icon: 'chart' },
    ...global,
  ];
  return [
    { label: 'Users & roles', path: '/admin/users', icon: 'users' },
    { label: 'Moderation', path: '/admin/moderation', icon: 'shield' },
    { label: 'Analytics', path: '/admin/analytics', icon: 'chart' },
    { label: 'Audit log', path: '/admin/audit', icon: 'file' },
    ...global,
  ];
}

export function RoleSiteHeader({ path, role, status, displayName, navigate, onSignOut }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const definition = roleDefinition(role);
  const navItems: Link[] = status === 'pending'
    ? [{ label: 'Verification status', path: '/pending', icon: 'shield' }]
    : definition.nav;
  const secondary = (status === 'pending'
    ? [{ label: 'Organization profile', path: '/account/profile', icon: 'building' }, { label: 'Settings', path: '/settings', icon: 'tools' }]
    : secondaryLinks(role)).filter((item) => !navItems.some((nav) => nav.path === item.path));
  const isActive = (target: string) => path === target || (target !== '/' && path.startsWith(`${target}/`));
  const go = (target: string) => {
    navigate(target);
    setMobileOpen(false);
    setMoreOpen(false);
  };
  const initials = displayName.trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase() || 'U';
  const headerHome = status === 'pending' ? '/pending' : definition.home;
  const renderLink = (item: Link) => {
    const Icon = icons[item.icon || 'file'] || FileText;
    return <button key={item.path} className={`category-link ${isActive(item.path) ? 'active' : ''}`} onClick={() => go(item.path)}><Icon size={22} strokeWidth={2.2}/><span>{item.label}</span></button>;
  };

  return <header className="site-header role-site-header">
    <div className="masthead">
      <button className="brand-lockup" onClick={() => go(headerHome)} aria-label="UniHub AI home">
        <span className="brand-mark"><GraduationCap size={31} strokeWidth={2.1}/></span>
        <span className="brand-name">UniHub <b>AI</b></span>
      </button>
      <div className="masthead-message"><span className="sparkle-dot"><Sparkles size={14}/></span>{role === 'student' ? 'Opportunities, learning and community — all in one place' : `${definition.label} workspace`}</div>
      <div className="masthead-actions">
        {status === 'active' && <button className="icon-button header-notification" aria-label="Notifications" onClick={() => go('/notifications')}><Bell size={19}/></button>}
        <button className="profile-shortcut role-profile-shortcut" onClick={() => go('/account/profile')} aria-label={`Edit ${displayName}'s account profile`}><span className="role-avatar">{initials}</span><span>{displayName.split(/\s+/)[0] || 'Profile'}</span></button>
        <button className="mobile-menu-button" aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} onClick={() => setMobileOpen((open) => !open)}>{mobileOpen ? <X size={22}/> : <Menu size={22}/>}</button>
      </div>
    </div>
    <nav className={`category-nav ${mobileOpen ? 'mobile-open' : ''}`} aria-label={`${definition.label} navigation`}>
      <div className="category-nav-inner">
        {navItems.map(renderLink)}
        <div className="more-menu-wrap">
          <button className={`category-link more-link ${moreOpen || secondary.some((item) => isActive(item.path)) ? 'active' : ''}`} onClick={() => setMoreOpen((open) => !open)} aria-expanded={moreOpen}>
            <MoreHorizontal size={25} strokeWidth={2.6}/><span>{status === 'pending' ? 'Account' : 'Others'}</span><ChevronDown size={15} className="more-chevron"/>
          </button>
          {moreOpen && <div className="more-dropdown" role="menu">
            {secondary.map((item) => <button role="menuitem" key={item.path} onClick={() => go(item.path)}>{item.label}<span>›</span></button>)}
            <button role="menuitem" onClick={() => { setMoreOpen(false); void onSignOut(); }}><span className="role-signout-label"><LogOut size={14}/> Sign out</span><span>›</span></button>
          </div>}
        </div>
      </div>
    </nav>
  </header>;
}

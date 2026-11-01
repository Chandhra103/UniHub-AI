import { useState } from 'react';
import {
  Bell, BriefcaseBusiness, CalendarDays, ChevronDown, Code2, GraduationCap,
  Landmark, Menu, MoreHorizontal, Search, Sparkles, UserRound, Wrench, X,
} from 'lucide-react';

type Navigate = (path: string) => void;

const primaryLinks = [
  { label: 'Events', path: '/events', icon: CalendarDays },
  { label: 'Internships & jobs', path: '/opportunities', icon: BriefcaseBusiness },
  { label: 'Hackathons', path: '/hackathons', icon: Code2 },
  { label: 'AI tools', path: '/ai-tools', icon: Wrench },
  { label: 'Govt portals', path: '/government-portals', icon: Landmark },
  { label: 'Scholarships', path: '/scholarships', icon: GraduationCap },
];

const moreLinks = [
  { label: 'College festivals', path: '/events/festivals' },
  { label: 'Company meetups', path: '/events/meetups' },
  { label: 'Courses', path: '/courses' },
  { label: 'AI Hub', path: '/ai-hub' },
  { label: 'Discover colleges', path: '/colleges' },
  { label: 'Organizations', path: '/organizations' },
  { label: 'Community', path: '/community' },
  { label: 'My applications', path: '/applications' },
  { label: 'Saved opportunities', path: '/saved' },
  { label: 'Rewards', path: '/rewards' },
  { label: 'Messages', path: '/messages' },
  { label: 'Notifications', path: '/notifications' },
  { label: 'Settings', path: '/settings' },
  { label: 'College portal', path: '/organization/college' },
  { label: 'Company portal', path: '/organization/company' },
  { label: 'Event organizer portal', path: '/organization/events' },
  { label: 'Administrator', path: '/admin' },
];

export function SiteHeader({ path, navigate }: { path: string; navigate: Navigate }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const isActive = (target: string) => path === target || (target !== '/' && path.startsWith(`${target}/`));
  const go = (target: string) => {
    navigate(target);
    setMobileOpen(false);
    setMoreOpen(false);
  };

  return (
    <header className="site-header">
      <div className="masthead">
        <button className="brand-lockup" onClick={() => go('/dashboard')} aria-label="UniHub AI home">
          <span className="brand-mark"><GraduationCap size={31} strokeWidth={2.1} /></span>
          <span className="brand-name">UniHub <b>AI</b></span>
        </button>
        <div className="masthead-message"><span className="sparkle-dot"><Sparkles size={14} /></span> Hackathon season: register free until Nov 15</div>
        <div className="masthead-actions">
          <button className="icon-button header-notification" aria-label="Notifications" onClick={() => go('/notifications')}><Bell size={19} /><span className="notification-pip" /></button>
          <button className="profile-shortcut" onClick={() => go('/profile')}>
            <img src="/assets/ananya-avatar.png" alt="" />
            <span>Profile</span>
          </button>
          <button className="mobile-menu-button" aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} onClick={() => setMobileOpen((open) => !open)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      <nav className={`category-nav ${mobileOpen ? 'mobile-open' : ''}`} aria-label="Main navigation">
        <div className="category-nav-inner">
          {primaryLinks.map(({ label, path: target, icon: Icon }) => (
            <button key={target} className={`category-link ${isActive(target) ? 'active' : ''}`} onClick={() => go(target)}>
              <Icon size={23} strokeWidth={2.35} /><span>{label}</span>
            </button>
          ))}
          <div className="more-menu-wrap">
            <button className={`category-link more-link ${moreOpen || moreLinks.some((item) => isActive(item.path)) ? 'active' : ''}`} onClick={() => setMoreOpen((open) => !open)} aria-expanded={moreOpen}>
              <MoreHorizontal size={26} strokeWidth={2.6} /><span>Others</span><ChevronDown size={15} className="more-chevron" />
            </button>
            {moreOpen && <div className="more-dropdown" role="menu">{moreLinks.map((item) => <button role="menuitem" key={item.path} onClick={() => go(item.path)}>{item.label}<span>›</span></button>)}</div>}
          </div>
        </div>
      </nav>
    </header>
  );
}

export function PageHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode }) {
  return <div className="page-heading">
    <div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1>{description && <p>{description}</p>}</div>
    {action && <div className="page-heading-action">{action}</div>}
  </div>;
}

export function SectionHeader({ title, action, subtitle }: { title: string; action?: React.ReactNode; subtitle?: string }) {
  return <div className="section-header"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action && <div>{action}</div>}</div>;
}

export function TextButton({ children, onClick, className = '' }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return <button className={`text-button ${className}`} onClick={onClick}>{children}</button>;
}

export function PrimaryButton({ children, onClick, className = '', type = 'button', disabled = false }: { children: React.ReactNode; onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void; className?: string; type?: 'button' | 'submit'; disabled?: boolean }) {
  return <button type={type} disabled={disabled} className={`primary-button ${className}`} onClick={onClick}>{children}</button>;
}

export function SoftButton({ children, onClick, className = '', type = 'button' }: { children: React.ReactNode; onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void; className?: string; type?: 'button' | 'submit' }) {
  return <button type={type} className={`soft-button ${className}`} onClick={onClick}>{children}</button>;
}

export function Chip({ children, tone = 'neutral', className = '' }: { children: React.ReactNode; tone?: string; className?: string }) {
  return <span className={`chip chip-${tone} ${className}`}>{children}</span>;
}

export function BrandMark({ label, tone = 'blue', large = false }: { label: string; tone?: string; large?: boolean }) {
  return <span className={`brand-mark-tile tone-${tone} ${large ? 'brand-mark-large' : ''}`}>{label}</span>;
}

export function SearchField({ value, onChange, placeholder, label }: { value: string; onChange: (value: string) => void; placeholder: string; label: string }) {
  return <label className="search-field"><Search size={18} aria-hidden="true" /><span className="sr-only">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></label>;
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return <div className="empty-state"><span className="empty-icon"><Search size={21} /></span><h3>{title}</h3><p>{body}</p>{action}</div>;
}

export function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  if (!message) return null;
  return <div className="toast" role="status"><span className="toast-check">✓</span><span>{message}</span><button aria-label="Dismiss message" onClick={onClose}><X size={16} /></button></div>;
}

export function Modal({ title, subtitle, children, onClose }: { title: string; subtitle?: string; children: React.ReactNode; onClose: () => void }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="modal-card" role="dialog" aria-modal="true" aria-label={title}>
      <button className="modal-close" onClick={onClose} aria-label="Close dialog"><X size={19} /></button>
      <div className="modal-title"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div></div>
      {children}
    </section>
  </div>;
}

export function StatCard({ icon, value, label, trend, tone }: { icon: React.ReactNode; value: string; label: string; trend?: string; tone: string }) {
  return <div className="stat-card"><span className={`stat-icon stat-icon-${tone}`}>{icon}</span><div className="stat-copy"><span className="stat-label">{label}</span><strong>{value}</strong>{trend && <span className="stat-trend">▲ <b>{trend}</b></span>}</div></div>;
}

export function Breadcrumb({ items }: { items: string[] }) {
  return <div className="breadcrumb"><UserRound size={14} /> {items.map((item, index) => <span key={`${item}-${index}`}>{index > 0 && <b>›</b>}{item}</span>)}</div>;
}

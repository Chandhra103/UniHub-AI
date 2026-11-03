import { useState } from 'react';
import { Bell, Check, Settings, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { Chip, EmptyState, PageHeading, PrimaryButton, SectionHeader, SoftButton } from '../components';
import type { AuthenticatedUser } from './types';

type Props = {
  path: string;
  user: AuthenticatedUser;
  onSave: (patch: { displayName: string; profile: Record<string, unknown> }) => Promise<void>;
  onNavigate: (path: string) => void;
  onToast: (message: string) => void;
};

const notifications = [
  { id: 'opportunity-match', title: 'A new opportunity matches your interests', detail: 'A frontend internship has been posted in your selected location.', time: 'Today · 10:42 AM', category: 'Opportunities' },
  { id: 'community-reply', title: 'Your community has a new update', detail: 'A peer shared a resource connected to your latest activity.', time: 'Yesterday · 4:18 PM', category: 'Community' },
  { id: 'profile-tip', title: 'Keep your account profile current', detail: 'A complete profile helps your role workspace stay useful.', time: 'Oct 29 · 9:20 AM', category: 'Account' },
];

function readReadIds(openId: string) {
  try { return JSON.parse(localStorage.getItem(`unihub-notification-read:${openId}`) || '[]') as string[]; } catch { return []; }
}

export function AccountUtilityPage({ path, user, onSave, onNavigate, onToast }: Props) {
  const isNotifications = path === '/notifications';
  const [readIds, setReadIds] = useState<string[]>(() => readReadIds(user.openId));
  const [filter, setFilter] = useState('All');
  const [emailUpdates, setEmailUpdates] = useState(Boolean((user.profile.notificationPreferences as Record<string, unknown> | undefined)?.emailUpdates));
  const [opportunityAlerts, setOpportunityAlerts] = useState((user.profile.notificationPreferences as Record<string, unknown> | undefined)?.opportunityAlerts !== false);
  const [communityAlerts, setCommunityAlerts] = useState((user.profile.notificationPreferences as Record<string, unknown> | undefined)?.communityAlerts !== false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const setRead = (id: string) => {
    setReadIds((current) => {
      const next = current.includes(id) ? current : [...current, id];
      localStorage.setItem(`unihub-notification-read:${user.openId}`, JSON.stringify(next));
      return next;
    });
  };
  const markAllRead = () => {
    const next = notifications.map((item) => item.id);
    setReadIds(next);
    localStorage.setItem(`unihub-notification-read:${user.openId}`, JSON.stringify(next));
    onToast('All notifications marked as read.');
  };
  const shown = notifications.filter((item) => filter === 'All' || (filter === 'Unread' ? !readIds.includes(item.id) : readIds.includes(item.id)));

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true); setError('');
    try {
      await onSave({ displayName: user.displayName, profile: { notificationPreferences: { emailUpdates, opportunityAlerts, communityAlerts } } });
      onToast('Notification preferences saved.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Settings could not be saved.');
    } finally { setSaving(false); }
  };

  if (isNotifications) return <div className="account-utility-page">
    <PageHeading eyebrow="Your workspace" title="Notifications" description="Updates selected for your account role and interests." action={<SoftButton onClick={() => onNavigate('/settings')}><Settings size={15}/> Notification settings</SoftButton>}/>
    <section className="utility-panel"><SectionHeader title="Your updates" subtitle="These notices are sample frontend content until your workspace activity creates live notifications." action={<SoftButton onClick={markAllRead}><Check size={15}/> Mark all read</SoftButton>}/>
      <div className="utility-filter-tabs">{['All','Unread','Read'].map((tab) => <button className={filter===tab?'active':''} key={tab} onClick={() => setFilter(tab)}>{tab}</button>)}</div>
      {shown.length ? <div className="utility-notification-list">{shown.map((item) => <article className={`utility-notification ${readIds.includes(item.id)?'is-read':''}`} key={item.id} onClick={() => setRead(item.id)}><span className="utility-notification-icon"><Bell size={18}/></span><div><div className="utility-notification-heading"><b>{item.title}</b><Chip tone="blue">{item.category}</Chip></div><p>{item.detail}</p><small>{item.time}</small></div>{!readIds.includes(item.id)&&<i aria-label="Unread"/>}</article>)}</div> : <EmptyState title={`No ${filter.toLowerCase()} notifications`} body="You’re all caught up. Updates relevant to this account will appear here."/>}
    </section>
  </div>;

  return <div className="account-utility-page">
    <PageHeading eyebrow="Your workspace" title="Settings" description={`Manage account preferences for your ${user.role.replace('_',' ')} workspace.`}/>
    {error&&<div className="account-error" role="alert">{error}</div>}
    <form className="utility-panel utility-settings" onSubmit={(event) => void save(event)}>
      <SectionHeader title="Notifications & privacy" subtitle="These preferences are saved to your account and do not replace your profile data."/>
      <label className="utility-toggle-row"><span><b>Opportunity alerts</b><small>Show role-specific opportunity and application updates.</small></span><input type="checkbox" checked={opportunityAlerts} onChange={(event) => setOpportunityAlerts(event.target.checked)}/></label>
      <label className="utility-toggle-row"><span><b>Community updates</b><small>Show relevant learning and community activity.</small></span><input type="checkbox" checked={communityAlerts} onChange={(event) => setCommunityAlerts(event.target.checked)}/></label>
      <label className="utility-toggle-row"><span><b>Email summaries</b><small>Enable a periodic summary preference for account notices.</small></span><input type="checkbox" checked={emailUpdates} onChange={(event) => setEmailUpdates(event.target.checked)}/></label>
      <div className="utility-account-callout"><ShieldCheck size={18}/><span>Account permissions are assigned by your verified UniHub role. Changing a preference cannot grant access to another workspace.</span></div>
      <div className="utility-actions"><SoftButton onClick={() => onNavigate('/account/profile')}><SlidersHorizontal size={15}/> Account profile</SoftButton><PrimaryButton type="submit" disabled={saving}>{saving?'Saving…':'Save preferences'}</PrimaryButton></div>
    </form>
  </div>;
}

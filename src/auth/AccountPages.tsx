import { useEffect, useState } from 'react';
import { AlertCircle, ArrowRight, Building2, ShieldCheck } from 'lucide-react';
import { PageHeading, PrimaryButton, SoftButton, Chip } from '../components';
import { roleDefinition } from '../roles';
import type { AuthenticatedUser } from './types';

type Props = {
  user: AuthenticatedUser;
  onSaveAccount: (patch: { displayName: string; profile: Record<string, unknown> }) => Promise<void>;
  onSaveOrganization: (patch: { name: string; category: string; profile: Record<string, unknown> }) => Promise<void>;
  onNavigate: (path: string) => void;
  onToast: (message: string) => void;
};

function initialText(value: unknown) {
  if (Array.isArray(value)) return value.join(', ');
  return typeof value === 'string' ? value : '';
}

export function AccountProfilePage({ user, onSaveAccount, onSaveOrganization, onNavigate, onToast }: Props) {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [headline, setHeadline] = useState(initialText(user.profile.headline));
  const [summary, setSummary] = useState(initialText(user.profile.summary));
  const [phone, setPhone] = useState(initialText(user.profile.phone));
  const [location, setLocation] = useState(initialText(user.profile.location));
  const [university, setUniversity] = useState(initialText(user.profile.university));
  const [skills, setSkills] = useState(initialText(user.profile.skills));
  const [visibility, setVisibility] = useState(user.profileVisibility || 'private');
  const [organizationName, setOrganizationName] = useState(user.organization?.name || '');
  const [organizationCategory, setOrganizationCategory] = useState(user.organization?.category || '');
  const [organizationDescription, setOrganizationDescription] = useState(initialText(user.organization?.profile.description));
  const [organizationWebsite, setOrganizationWebsite] = useState(initialText(user.organization?.profile.website));
  const [organizationLocation, setOrganizationLocation] = useState(initialText(user.organization?.profile.location));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const organizationRole = roleDefinition(user.role).requiresVerification;

  useEffect(() => {
    setDisplayName(user.displayName);
    setHeadline(initialText(user.profile.headline));
    setSummary(initialText(user.profile.summary));
    setPhone(initialText(user.profile.phone));
    setLocation(initialText(user.profile.location));
    setUniversity(initialText(user.profile.university));
    setSkills(initialText(user.profile.skills));
    setVisibility(user.profileVisibility || 'private');
    setOrganizationName(user.organization?.name || '');
    setOrganizationCategory(user.organization?.category || '');
    setOrganizationDescription(initialText(user.organization?.profile.description));
    setOrganizationWebsite(initialText(user.organization?.profile.website));
    setOrganizationLocation(initialText(user.organization?.profile.location));
  }, [user]);

  const accountSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true); setError('');
    try {
      await onSaveAccount({ displayName, profile: { headline, summary, phone, location, university, skills: skills.split(',').map((item) => item.trim()).filter(Boolean), profileVisibility: visibility } });
      onToast('Account profile updated. Existing profile fields were preserved.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Account profile could not be saved.');
    } finally { setSaving(false); }
  };

  const organizationSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true); setError('');
    try {
      await onSaveOrganization({ name: organizationName, category: organizationCategory, profile: { description: organizationDescription, website: organizationWebsite, location: organizationLocation } });
      onToast('Organization profile saved. Existing organization data was preserved.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Organization profile could not be saved.');
    } finally { setSaving(false); }
  };

  return <div className="account-page">
    {user.roleStatus === 'pending' && <div className="account-pending-banner" role="status"><AlertCircle size={19}/><div><b>Verification in progress</b><span>Finish your organization profile below. Your requested workspace remains limited until an administrator approves it.</span></div><Chip tone="orange">Pending</Chip></div>}
    <PageHeading eyebrow="Account settings" title="Your profile & workspace" description="Update your details without replacing saved profile or organization information." action={<SoftButton onClick={() => onNavigate(user.roleStatus === 'pending' ? '/pending' : roleDefinition(user.role).home)}>Back to workspace <ArrowRight size={15}/></SoftButton>}/>
    {error && <div className="account-error" role="alert"><AlertCircle size={17}/>{error}</div>}
    <div className="account-profile-grid">
      <section className="account-panel">
        <div className="account-panel-heading"><div className="account-icon"><ShieldCheck size={20}/></div><div><h2>Account profile</h2><p>Your verified identity and profile information.</p></div></div>
        <form onSubmit={(event) => void accountSubmit(event)}>
          <label>Display name<input required maxLength={160} value={displayName} onChange={(event) => setDisplayName(event.target.value)}/></label>
          <label>Verified email<input value={user.email} readOnly aria-readonly="true"/></label>
          <label>Account type<input value={roleDefinition(user.role).label} readOnly aria-readonly="true"/></label>
          <label>Professional headline<input maxLength={180} value={headline} onChange={(event) => setHeadline(event.target.value)} placeholder="e.g. Computer science student | Product designer"/></label>
          <label>About you<textarea maxLength={2000} rows={4} value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="A short introduction and your goals"/></label>
          <div className="account-form-row"><label>Phone<input maxLength={40} value={phone} onChange={(event) => setPhone(event.target.value)}/></label><label>Location<input maxLength={160} value={location} onChange={(event) => setLocation(event.target.value)}/></label></div>
          <label>College / institution<input maxLength={200} value={university} onChange={(event) => setUniversity(event.target.value)}/></label>
          <label>Skills <small>Separate skills with commas.</small><input maxLength={1000} value={skills} onChange={(event) => setSkills(event.target.value)} placeholder="React, Python, SQL"/></label>
          <label>Profile visibility<select value={visibility} onChange={(event) => setVisibility(event.target.value as 'private'|'public')}><option value="private">Private — only you can view your profile</option><option value="public">Discoverable — recruiters can find your profile</option></select></label>
          <PrimaryButton type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save account profile'}</PrimaryButton>
        </form>
      </section>
      {organizationRole && <section className="account-panel">
        <div className="account-panel-heading"><div className="account-icon account-org-icon"><Building2 size={20}/></div><div><h2>Organization profile</h2><p>Update your organization details without resetting verification progress.</p></div></div>
        {user.organization?.verificationStatus && <div className="account-verification-state"><span>Verification status</span><Chip tone={user.organization.verificationStatus === 'verified' ? 'green' : 'orange'}>{user.organization.verificationStatus === 'verified' ? 'Verified' : user.organization.verificationStatus}</Chip></div>}
        <form onSubmit={(event) => void organizationSubmit(event)}>
          <label>Organization name<input required maxLength={200} value={organizationName} onChange={(event) => setOrganizationName(event.target.value)} placeholder="e.g. Westbridge Institute"/></label>
          <label>Organization type<input maxLength={100} value={organizationCategory} onChange={(event) => setOrganizationCategory(event.target.value)} placeholder="University, technology, recruitment…"/></label>
          <label>About the organization<textarea maxLength={4000} rows={4} value={organizationDescription} onChange={(event) => setOrganizationDescription(event.target.value)} placeholder="What your organization does and who it serves"/></label>
          <label>Website<input maxLength={500} type="url" value={organizationWebsite} onChange={(event) => setOrganizationWebsite(event.target.value)} placeholder="https://example.org"/></label>
          <label>Location<input maxLength={160} value={organizationLocation} onChange={(event) => setOrganizationLocation(event.target.value)} placeholder="City, state"/></label>
          <PrimaryButton type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save organization profile'}</PrimaryButton>
        </form>
        {!user.organization && <p className="account-form-note">Your organization will remain unverified until an administrator reviews the role request.</p>}
      </section>}
    </div>
  </div>;
}

export function PendingPage({ user, onNavigate, onSignOut }: { user: AuthenticatedUser; onNavigate: (path: string) => void; onSignOut: () => void }) {
  return <div className="pending-page"><div className="pending-card"><span className="pending-icon"><AlertCircle size={26}/></span><span className="auth-kicker">{roleDefinition(user.role).label} account</span><h1>Verification is underway.</h1><p>We’re checking the organization details connected to <b>{user.displayName}</b>. Your account and existing profile data are safe while review is in progress.</p><div className="pending-status"><span>Requested workspace</span><b>{roleDefinition(user.requestedRole || user.role).label}</b><Chip tone="orange">Pending review</Chip></div><div className="pending-actions"><PrimaryButton onClick={() => onNavigate('/account/profile')}>Review your organization profile <ArrowRight size={16}/></PrimaryButton><SoftButton onClick={onSignOut}>Sign out</SoftButton></div><small>Publishing roles, managing applicants and reviewing other users remain unavailable until verification is complete.</small></div></div>;
}

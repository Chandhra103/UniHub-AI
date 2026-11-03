import { useMemo, useState } from 'react';
import { ArrowRight, Building2, GraduationCap, ShieldCheck, Sparkles } from 'lucide-react';
import type { AccountRole } from '../roles';
import { roleDefinitions } from '../roles';
import { useAuth } from './AuthContext';

const orgRoles: AccountRole[] = ['college', 'company', 'recruiter', 'event_organizer', 'teacher_researcher', 'ngo_training'];
const errorCopy: Record<string, string> = {
  'admin-not-authorized': 'This Manus account is not on the administrator allowlist. Contact your platform administrator.',
  'role-locked': 'This account is registered for a different UniHub workspace. Sign in with its registered account type, or use a separate Manus account for another role.',
  'oauth-denied': 'Sign-in was cancelled. You can try again when you are ready.',
  'state-invalid': 'The secure sign-in request expired or could not be verified. Please start again.',
  'oauth-code-missing': 'The account provider did not return a sign-in code. Please try again.',
  'auth-not-configured': 'Sign-in is not configured on this deployment. Ask the administrator to add the Manus OAuth settings and session secret in Vercel.',
  'database-not-configured': 'Account storage is not configured. Ask the administrator to add DATABASE_URL and apply the UniHub database migration.',
  'oauth-failed': 'Sign-in could not be completed. Please try again or contact support.',
};

export function LoginPage() {
  const { startSignIn, authError, clearAuthError } = useAuth();
  const [orgRole, setOrgRole] = useState<AccountRole>('college');
  const [organizationName, setOrganizationName] = useState('');
  const [busyRole, setBusyRole] = useState<AccountRole | null>(null);
  const [localError, setLocalError] = useState('');
  const queryError = useMemo(() => errorCopy[new URLSearchParams(window.location.search).get('error') || ''] || '', []);
  const orgDefinition = roleDefinitions.find((role) => role.id === orgRole);

  const continueWith = async (role: AccountRole) => {
    setLocalError('');
    clearAuthError();
    if (role === orgRole && orgDefinition?.requiresVerification && !organizationName.trim()) {
      setLocalError('Add your organization name before continuing.');
      return;
    }
    setBusyRole(role);
    try {
      await startSignIn({ role, organizationName: role === orgRole ? organizationName.trim() : '' });
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Secure sign-in could not be started.');
      setBusyRole(null);
    }
  };

  return <div className="auth-login-page">
    <header className="auth-login-header"><a className="auth-wordmark" href="/login" aria-label="UniHub AI"><span className="auth-logo-mark"><GraduationCap size={25}/></span><span>UniHub <b>AI</b></span></a><span className="auth-login-tagline">Opportunity, learning and community — together.</span></header>
    <main className="auth-login-main">
      <div className="auth-login-intro"><span className="auth-kicker"><Sparkles size={14}/> Your next step, in one place</span><h1>Choose your UniHub space.</h1><p>Sign in with your Manus account. Your account type determines the workspace, tools and access you receive.</p></div>
      {(queryError || authError || localError) && <div className="auth-login-error" role="alert">{localError || authError || queryError}</div>}
      <div className="auth-role-panels">
        <section className="auth-role-card auth-student-card">
          <div className="auth-card-icon"><GraduationCap size={22}/></div><span className="auth-card-label">For learners & job seekers</span><h2>Student account</h2><p>Discover opportunities, events, AI tools, learning and rewards in your personal workspace.</p>
          <button className="auth-role-cta" disabled={busyRole !== null} onClick={() => void continueWith('student')}>{busyRole === 'student' ? 'Connecting securely…' : 'Continue as a student'}<ArrowRight size={17}/></button>
          <div className="auth-divider"><span>or choose a different path</span></div>
          <button className="auth-outline-cta" disabled={busyRole !== null} onClick={() => void continueWith('job_seeker')}>Continue as a job seeker<ArrowRight size={16}/></button>
          <div className="auth-trust"><ShieldCheck size={16}/> Identity verified by Manus. UniHub never asks for your password.</div>
        </section>
        <section className="auth-role-card auth-org-card">
          <div className="auth-card-icon"><Building2 size={21}/></div><span className="auth-card-label">For organizations & educators</span><h2>Organization account</h2><p>Manage students, hiring, candidate pipelines, events or learning programmes.</p>
          <label className="auth-field-label">Choose your account type<select value={orgRole} disabled={busyRole !== null} onChange={(event) => setOrgRole(event.target.value as AccountRole)}>{orgRoles.map((role) => <option key={role} value={role}>{roleDefinitions.find((item) => item.id === role)?.label}</option>)}</select></label>
          {orgDefinition?.requiresVerification && <label className="auth-field-label">Organization name<input value={organizationName} onChange={(event) => setOrganizationName(event.target.value)} maxLength={200} placeholder="e.g. Westbridge Institute" /></label>}
          <button className="auth-role-cta" disabled={busyRole !== null} onClick={() => void continueWith(orgRole)}>{busyRole === orgRole ? 'Connecting securely…' : 'Continue securely'}<ArrowRight size={17}/></button>
          <button className="auth-admin-link" disabled={busyRole !== null} onClick={() => void continueWith('admin')}><ShieldCheck size={15}/> Administrator sign-in</button>
          <small className="auth-review-note">Organization publishing and recruitment actions unlock after verification.</small>
        </section>
      </div>
      <div className="auth-privacy-note">By continuing, you agree to the UniHub AI terms and privacy notice. Your account data remains connected to your verified identity.</div>
    </main>
    <footer className="auth-login-footer"><span>© 2026 UniHub AI</span><span>Made for the people shaping what comes next.</span></footer>
  </div>;
}

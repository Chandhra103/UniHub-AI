import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import type { AuthSessionResponse, AuthenticatedUser, RoleAction } from './types';
import type { AccountRole } from '../roles';

type SignInArgs = { role: AccountRole; organizationName?: string };
type AuthContextValue = {
  loading: boolean;
  user: AuthenticatedUser | null;
  csrfToken: string;
  authError: string;
  clearAuthError: () => void;
  refreshSession: () => Promise<AuthenticatedUser | null>;
  startSignIn: (args: SignInArgs) => Promise<void>;
  signOut: () => Promise<void>;
  runAction: (action: RoleAction) => Promise<unknown>;
  saveAccountProfile: (patch: { displayName: string; profile: Record<string, unknown> }) => Promise<void>;
  saveOrganizationProfile: (patch: { name: string; category: string; profile: Record<string, unknown> }) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function responseError(response: Response): Promise<Error> {
  let message = 'The request could not be completed. Please try again.';
  try {
    const body = await response.json() as { error?: string; message?: string };
    if (typeof body.error === 'string') message = body.error;
    else if (typeof body.message === 'string') message = body.message;
  } catch {
    // Keep a safe generic message if the server response is not JSON.
  }
  return new Error(message);
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [csrfToken, setCsrfToken] = useState('');
  const [authError, setAuthError] = useState('');

  const refreshSession = useCallback(async () => {
    const response = await fetch('/api/auth/session', { credentials: 'same-origin', headers: { Accept: 'application/json' } });
    if (!response.ok) throw await responseError(response);
    const result = await response.json() as AuthSessionResponse;
    const nextUser = result.authenticated ? result.user : null;
    setUser(nextUser);
    setCsrfToken(nextUser ? result.csrfToken || '' : '');
    return nextUser;
  }, []);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        await refreshSession();
      } catch (error) {
        if (mounted) setAuthError(error instanceof Error ? error.message : 'Unable to verify your session.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [refreshSession]);

  const startSignIn = useCallback(async ({ role, organizationName = '' }: SignInArgs) => {
    setAuthError('');
    const response = await fetch('/api/auth/start', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ role, organizationName }),
    });
    if (!response.ok) throw await responseError(response);
    const result = await response.json() as { authorizationUrl?: string };
    if (!result.authorizationUrl) throw new Error('The secure sign-in address was not returned.');
    window.location.assign(result.authorizationUrl);
  }, []);

  const csrfFetch = useCallback(async (url: string, body: unknown, method: 'POST' | 'PATCH') => {
    if (!csrfToken) throw new Error('Your secure session is still loading. Refresh and try again.');
    const response = await fetch(url, {
      method,
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-Token': csrfToken },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw await responseError(response);
    if (response.status === 204) return undefined;
    return response.json() as Promise<unknown>;
  }, [csrfToken]);

  const runAction = useCallback(async (action: RoleAction) => {
    const response = await csrfFetch('/api/actions', action, 'POST');
    if (action.action === 'account.profile.update' || action.action === 'organization.profile.update') await refreshSession();
    return response;
  }, [csrfFetch, refreshSession]);

  const saveAccountProfile = useCallback(async (patch: { displayName: string; profile: Record<string, unknown> }) => {
    await csrfFetch('/api/account/profile', patch, 'PATCH');
    await refreshSession();
  }, [csrfFetch, refreshSession]);

  const saveOrganizationProfile = useCallback(async (patch: { name: string; category: string; profile: Record<string, unknown> }) => {
    await csrfFetch('/api/account/organization', patch, 'PATCH');
    await refreshSession();
  }, [csrfFetch, refreshSession]);

  const signOut = useCallback(async () => {
    setAuthError('');
    try {
      await csrfFetch('/api/auth/logout', {}, 'POST');
    } finally {
      setUser(null);
      setCsrfToken('');
    }
  }, [csrfFetch]);

  const value = useMemo<AuthContextValue>(() => ({
    loading, user, csrfToken, authError,
    clearAuthError: () => setAuthError(''),
    refreshSession, startSignIn, signOut, runAction, saveAccountProfile, saveOrganizationProfile,
  }), [loading, user, csrfToken, authError, refreshSession, startSignIn, signOut, runAction, saveAccountProfile, saveOrganizationProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}

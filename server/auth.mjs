import { randomBytes, timingSafeEqual } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { ensureUserForOAuth } from './user-store.mjs';
import { roleHome } from './permissions.mjs';

const SESSION_COOKIE = 'webdev_app_session';
const OAUTH_STATE_COOKIE = 'unihub_oauth_state';
const PREVIEW_ORIGIN = 'https://8328-ixljuwijnisa6109lx7qx-70870a65.sg2.manus.computer';
const LOCAL_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000'];

function projectId() {
  if (!process.env.MANUS_PROJECT_ID) throw new Error('Manus project authentication is not configured.');
  return process.env.MANUS_PROJECT_ID;
}

function jwtSecret() {
  if (!process.env.MANUS_JWT_SECRET) throw new Error('Manus session signing is not configured.');
  return process.env.MANUS_JWT_SECRET;
}

export function parseCookies(header = '') {
  const cookies = {};
  for (const part of header.split(';')) {
    const separator = part.indexOf('=');
    if (separator < 1) continue;
    const key = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    try { cookies[key] = decodeURIComponent(value); } catch { cookies[key] = value; }
  }
  return cookies;
}

function allowedOrigins() {
  const configured = (process.env.UNIHUB_ALLOWED_ORIGINS || process.env.PUBLIC_APP_URL || '')
    .split(',').map((item) => item.trim()).filter(Boolean);
  const vercel = [process.env.VERCEL_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL]
    .filter((host) => typeof host === 'string' && /^[a-z0-9.-]+$/i.test(host))
    .map((host) => `https://${host.toLowerCase()}`);
  return new Set([...configured, ...vercel, PREVIEW_ORIGIN, ...LOCAL_ORIGINS]);
}

export function validatePublicOrigin(rawOrigin) {
  if (typeof rawOrigin !== 'string' || !rawOrigin) return null;
  try {
    const parsed = new URL(rawOrigin);
    if (!['https:', 'http:'].includes(parsed.protocol) || parsed.origin !== rawOrigin) return null;
    if (!allowedOrigins().has(parsed.origin)) return null;
    return parsed.origin;
  } catch {
    return null;
  }
}

function cookieString(name, value, { secure = true, httpOnly = true, maxAge = 28800, path = '/', sameSite = secure ? 'None' : 'Lax' } = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`, `Path=${path}`, `Max-Age=${maxAge}`, `SameSite=${sameSite}`];
  if (httpOnly) parts.push('HttpOnly');
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

export function clearSessionCookie(res, secure = true) {
  res.append('Set-Cookie', cookieString(SESSION_COOKIE, '', { secure, maxAge: 0, path: '/' }));
}

function setSessionCookie(res, openId, csrfToken, secure = true) {
  const token = jwt.sign(
    { appId: projectId(), openId, csrf: csrfToken },
    jwtSecret(),
    { algorithm: 'HS256', expiresIn: '8h' },
  );
  res.append('Set-Cookie', cookieString(SESSION_COOKIE, token, { secure, maxAge: 28800, path: '/' }));
}

function setOAuthStateCookie(res, token, secure) {
  res.append('Set-Cookie', cookieString(OAUTH_STATE_COOKIE, token, {
    secure,
    maxAge: 300,
    path: '/api/auth/callback',
  }));
}

function clearOAuthStateCookie(res, secure = true) {
  res.append('Set-Cookie', cookieString(OAUTH_STATE_COOKIE, '', {
    secure,
    maxAge: 0,
    path: '/api/auth/callback',
  }));
}

function sessionClaims(token) {
  if (!token) return null;
  try {
    const claims = jwt.verify(token, jwtSecret(), { algorithms: ['HS256'] });
    if (!claims || typeof claims !== 'object' || claims.appId !== projectId()) return null;
    if (typeof claims.openId !== 'string' || !claims.openId || !Number.isFinite(claims.exp) || claims.exp <= Math.floor(Date.now() / 1000)) return null;
    return claims;
  } catch {
    return null;
  }
}

export function cookieIsSecureForRequest(req) {
  const origin = validatePublicOrigin(req.get('origin'));
  if (origin) return origin.startsWith('https://');
  const referer = req.get('referer');
  if (referer) {
    try {
      const parsed = new URL(referer);
      if (validatePublicOrigin(parsed.origin)) return parsed.protocol === 'https:';
    } catch {
      // Fall through to the configured Preview origin.
    }
  }
  return PREVIEW_ORIGIN.startsWith('https://');
}

export function assertMutationOrigin(req) {
  const origin = validatePublicOrigin(req.get('origin'));
  if (!origin) {
    const error = new Error('Request origin is not allowed.');
    error.status = 403;
    throw error;
  }
  return origin;
}

export function assertCsrf(session, req) {
  const expected = session?.csrfToken;
  const received = req.get('x-csrf-token');
  if (!expected || !received) {
    const error = new Error('A valid CSRF token is required. Refresh your session and try again.');
    error.status = 403;
    throw error;
  }
  const a = Buffer.from(String(expected));
  const b = Buffer.from(String(received));
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    const error = new Error('The CSRF token is invalid. Refresh your session and try again.');
    error.status = 403;
    throw error;
  }
}

export function startOAuth(req, res) {
  const origin = validatePublicOrigin(req.get('origin'));
  if (!origin) {
    const error = new Error('This application origin is not configured for sign-in.');
    error.status = 403;
    throw error;
  }
  const portal = process.env.MANUS_OAUTH_PORTAL_URL;
  if (!portal) throw new Error('Manus sign-in is not configured.');
  const redirectUri = new URL('/api/auth/callback', origin).toString();
  const nonce = randomBytes(32).toString('base64url');
  const requestedRole = typeof req.body?.role === 'string' ? req.body.role : 'student';
  const organizationName = typeof req.body?.organizationName === 'string' ? req.body.organizationName.trim().slice(0, 200) : '';
  const stateCookie = jwt.sign(
    { nonce, redirectUri, origin, requestedRole, organizationName },
    jwtSecret(),
    { algorithm: 'HS256', expiresIn: '5m' },
  );
  setOAuthStateCookie(res, stateCookie, origin.startsWith('https://'));
  const state = Buffer.from(JSON.stringify({ redirectUri, nonce }), 'utf8').toString('base64');
  const authorizationUrl = new URL(`${portal.replace(/\/+$/, '')}/app-auth`);
  authorizationUrl.searchParams.set('appId', projectId());
  authorizationUrl.searchParams.set('redirectUri', redirectUri);
  authorizationUrl.searchParams.set('state', state);
  authorizationUrl.searchParams.set('responseType', 'code');
  return authorizationUrl.toString();
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Manus authentication service returned status ${response.status}.`);
  return response.json();
}

async function exchangeCode(code, redirectUri) {
  const api = process.env.MANUS_OAUTH_API_URL?.replace(/\/+$/, '');
  if (!api) throw new Error('Manus OAuth API is not configured.');
  const tokenResult = await postJson(
    `${api}/webdev.v1.WebDevAuthPublicService/ExchangeToken`,
    { clientId: projectId(), grantType: 'authorization_code', code, redirectUri },
  );
  if (typeof tokenResult.accessToken !== 'string' || !tokenResult.accessToken) throw new Error('Manus sign-in did not return an access token.');
  const identity = await postJson(
    `${api}/webdev.v1.WebDevAuthPublicService/GetUserInfo`,
    { accessToken: tokenResult.accessToken },
  );
  if (typeof identity.openId !== 'string' || !identity.openId) throw new Error('Manus sign-in did not return an account identity.');
  return identity;
}

function safeState(state) {
  if (typeof state !== 'string' || state.length > 4096) return null;
  try {
    const decoded = Buffer.from(state, 'base64').toString('utf8');
    const value = JSON.parse(decoded);
    if (typeof value.redirectUri !== 'string' || typeof value.nonce !== 'string') return null;
    return value;
  } catch {
    return null;
  }
}

export async function finishOAuth(req, res, ensureUserForOAuth) {
  const cookies = parseCookies(req.headers.cookie || '');
  const stateCookie = cookies[OAUTH_STATE_COOKIE];
  clearOAuthStateCookie(res, cookieIsSecureForRequest(req));
  if (req.query?.error) {
    return res.redirect(303, '/login?error=oauth-denied');
  }
  const state = safeState(req.query?.state);
  let binding;
  try {
    if (stateCookie) binding = jwt.verify(stateCookie, jwtSecret(), { algorithms: ['HS256'] });
  } catch {
    binding = null;
  }
  if (!state || !binding || typeof binding.nonce !== 'string' || binding.redirectUri !== state.redirectUri) {
    return res.redirect(303, '/login?error=state-invalid');
  }
  const nonceA = Buffer.from(binding.nonce);
  const nonceB = Buffer.from(state.nonce);
  if (nonceA.length !== nonceB.length || !timingSafeEqual(nonceA, nonceB)) {
    return res.redirect(303, '/login?error=state-invalid');
  }
  const expectedRedirect = new URL('/api/auth/callback', binding.origin).toString();
  if (state.redirectUri !== expectedRedirect || !validatePublicOrigin(binding.origin)) {
    return res.redirect(303, '/login?error=state-invalid');
  }
  const code = typeof req.query?.code === 'string' ? req.query.code : '';
  if (!code) return res.redirect(303, '/login?error=oauth-code-missing');
  try {
    const identity = await exchangeCode(code, state.redirectUri);
    const result = await ensureUserForOAuth({
      identity,
      requestedRole: binding.requestedRole,
      organizationName: binding.organizationName,
    });
    if (result.adminDenied) return res.redirect(303, '/login?error=admin-not-authorized');
    if (result.roleMismatch) return res.redirect(303, '/login?error=role-locked');
    const csrfToken = randomBytes(32).toString('base64url');
    setSessionCookie(res, result.user.openId, csrfToken, binding.origin.startsWith('https://'));
    const destination = result.user.roleStatus === 'pending' ? '/pending' : roleHome(result.user.role);
    return res.redirect(303, destination);
  } catch (error) {
    console.error(`OAuth completion failed: ${error instanceof Error ? error.message : 'unknown error'}`);
    return res.redirect(303, '/login?error=oauth-failed');
  }
}

export async function resolveSession(req, res, getUserByOpenId, ensureUserForOAuth) {
  const cookies = parseCookies(req.headers.cookie || '');
  const claims = sessionClaims(cookies[SESSION_COOKIE]);
  if (!claims) return null;
  let user = await getUserByOpenId(claims.openId);
  if (!user) {
    const ensured = await ensureUserForOAuth({
      identity: { openId: claims.openId, name: '', email: '' },
      requestedRole: 'student',
      organizationName: '',
    });
    user = ensured.user;
  }
  let csrfToken = typeof claims.csrf === 'string' ? claims.csrf : '';
  if (!csrfToken) {
    csrfToken = randomBytes(32).toString('base64url');
    setSessionCookie(res, claims.openId, csrfToken, cookieIsSecureForRequest(req));
  }
  return { user, csrfToken };
}

export function logoutSession(req, res) {
  clearSessionCookie(res, cookieIsSecureForRequest(req));
}

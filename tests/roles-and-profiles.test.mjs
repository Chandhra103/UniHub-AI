import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import catalog from '../shared/roles.json' with { type: 'json' };
import { startOAuth, validatePublicOrigin } from '../server/auth.mjs';
import {
  assertPermission,
  canRoleAccessPath,
  getRoleDefinition,
  hasPermission,
} from '../server/permissions.mjs';
import { assertOrganizationOwnerMembership, mergeAllowedFields, isAllowlistedAdminEmail } from '../server/user-store.mjs';

const activeUser = (role) => ({
  openId: `fixture-${role}`,
  role,
  roleStatus: 'active',
  organization: getRoleDefinition(role)?.requiresVerification
    ? { id: `fixture-org-${role}`, verificationStatus: 'verified' }
    : null,
});

test('all nine account types have unique homes and their own home route access', () => {
  assert.equal(catalog.roles.length, 9);
  assert.equal(new Set(catalog.roles.map((role) => role.home)).size, 9);
  for (const role of catalog.roles) {
    assert.equal(canRoleAccessPath(activeUser(role.id), role.home), true, `${role.id} home should be accessible`);
    assert.ok(role.nav.length > 0, `${role.id} should have its own navigation`);
    for (const item of role.nav) {
      assert.equal(canRoleAccessPath(activeUser(role.id), item.path), true, `${role.id} should reach ${item.path}`);
    }
  }
});

test('role dashboards cannot cross into another role private workspace', () => {
  for (const role of catalog.roles) {
    for (const other of catalog.roles) {
      if (other.id === role.id) continue;
      assert.equal(
        canRoleAccessPath(activeUser(role.id), other.home),
        false,
        `${role.id} must not open ${other.id} workspace`,
      );
    }
  }
});

test('account role verification gates privileged permissions and routes', () => {
  const pendingCollege = { ...activeUser('college'), roleStatus: 'pending', organization: { id: 'org-pending', verificationStatus: 'pending' } };
  assert.equal(canRoleAccessPath(pendingCollege, '/college/dashboard'), false);
  assert.equal(canRoleAccessPath(pendingCollege, '/account/profile'), true);
  assert.equal(hasPermission(pendingCollege, 'opportunities.manage_org'), false);
  assert.equal(hasPermission(activeUser('college'), 'opportunities.manage_org'), true);
  assert.equal(hasPermission(activeUser('college'), 'roles.manage'), false);
  assert.throws(() => assertPermission(activeUser('company'), 'users.verify'), { status: 403 });
  assert.equal(hasPermission(activeUser('admin'), 'roles.manage'), true);
});

test('each role menu exposes unique links inside that role\u2019s authorized route set', () => {
  for (const role of catalog.roles) {
    const paths = role.nav.map((item) => item.path);
    assert.equal(new Set(paths).size, paths.length, `${role.id} navigation should not duplicate links`);
    for (const item of role.nav) {
      assert.equal(canRoleAccessPath(activeUser(role.id), item.path), true, `${role.id} is permitted its ${item.path} link`);
      assert.ok(role.allowedPrefixes.some((prefix) => item.path === prefix || item.path.startsWith(`${prefix}/`)), `${item.path} is declared for ${role.id}`);
    }
  }
});

test('pending and suspended accounts are limited to their account recovery paths', () => {
  const pendingStudent = { ...activeUser('student'), roleStatus: 'pending' };
  assert.equal(canRoleAccessPath(pendingStudent, '/pending'), true);
  assert.equal(canRoleAccessPath(pendingStudent, '/dashboard'), false);
  const suspendedCompany = { ...activeUser('company'), roleStatus: 'suspended' };
  assert.equal(canRoleAccessPath(suspendedCompany, '/settings'), true);
  assert.equal(canRoleAccessPath(suspendedCompany, '/company/applicants'), false);
});

test('profile merge preserves omitted fields and ignores identity or permission fields', () => {
  const existing = { headline: 'Engineer', phone: '555-0100', skills: ['React'], privateNote: 'retain' };
  const merged = mergeAllowedFields(existing, {
    headline: 'Senior engineer',
    skills: ['React', 'TypeScript'],
    role: 'admin',
    openId: 'attacker',
    organizationId: 'other-org',
    privateNote: 'replace',
  }, new Set(['headline', 'phone', 'skills']));
  assert.deepEqual(merged, {
    headline: 'Senior engineer',
    phone: '555-0100',
    skills: ['React', 'TypeScript'],
    privateNote: 'retain',
  });
});

test('organization profile writes require owner membership', () => {
  assert.doesNotThrow(() => assertOrganizationOwnerMembership({ membership_role: 'owner' }));
  assert.throws(() => assertOrganizationOwnerMembership({ membership_role: 'member' }), { status: 403 });
  assert.throws(() => assertOrganizationOwnerMembership(undefined), { status: 403 });
});

test('administrator bootstrap is granted only to an explicitly allowlisted email', () => {
  const previous = process.env.UNIHUB_ADMIN_EMAILS;
  process.env.UNIHUB_ADMIN_EMAILS = 'ops@example.test, OWNER@example.test';
  try {
    assert.equal(isAllowlistedAdminEmail('owner@example.test'), true);
    assert.equal(isAllowlistedAdminEmail('intruder@example.test'), false);
  } finally {
    if (previous === undefined) delete process.env.UNIHUB_ADMIN_EMAILS;
    else process.env.UNIHUB_ADMIN_EMAILS = previous;
  }
});

test('OAuth accepts exact HTTPS Vercel deployment origins and sets iframe-safe cookies', () => {
  const env = ['MANUS_PROJECT_ID', 'MANUS_JWT_SECRET', 'MANUS_OAUTH_PORTAL_URL', 'VERCEL_URL'];
  const previous = Object.fromEntries(env.map((key) => [key, process.env[key]]));
  process.env.MANUS_PROJECT_ID = 'fixture-project';
  process.env.MANUS_JWT_SECRET = 'test-only-secret-not-used-outside-this-process';
  process.env.MANUS_OAUTH_PORTAL_URL = 'https://auth.example.test';
  process.env.VERCEL_URL = 'unihub-preview.vercel.app';
  try {
    assert.equal(validatePublicOrigin('https://unihub-preview.vercel.app'), 'https://unihub-preview.vercel.app');
    assert.equal(validatePublicOrigin('http://unihub-preview.vercel.app'), null);
    assert.equal(validatePublicOrigin('https://untrusted.vercel.app'), null);
    const cookies = [];
    const req = { get: (key) => key === 'origin' ? 'https://unihub-preview.vercel.app' : undefined, body: { role: 'company', organizationName: 'Fixture Inc.' } };
    const res = { append: (_key, value) => cookies.push(value) };
    const authorizationUrl = new URL(startOAuth(req, res));
    assert.equal(authorizationUrl.origin, 'https://auth.example.test');
    assert.equal(authorizationUrl.searchParams.get('redirectUri'), 'https://unihub-preview.vercel.app/api/auth/callback');
    assert.ok(cookies.some((cookie) => cookie.includes('unihub_oauth_state=') && cookie.includes('Secure') && cookie.includes('SameSite=None')));
  } finally {
    for (const key of env) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  }
});

test('all UI page routes are declared and manifest has no duplicate entries', async () => {
  const manifest = JSON.parse(await readFile(new URL('../public/manus-routes.json', import.meta.url), 'utf8'));
  const declared = new Set(manifest.routes.map((route) => route.path));
  assert.equal(declared.size, manifest.routes.length);
  const studentLinks = ['/dashboard/status', '/dashboard/connections', '/dashboard/followers', '/dashboard/posts', '/dashboard/rewards', '/followers'];
  for (const path of studentLinks) {
    assert.ok(declared.has(path), `route manifest omits ${path}`);
    assert.equal(canRoleAccessPath(activeUser('student'), path), true, `students should reach ${path}`);
  }
  assert.equal(canRoleAccessPath(activeUser('company'), '/followers'), false);
  for (const role of catalog.roles) {
    assert.ok(declared.has(role.home), `route manifest omits ${role.home}`);
    for (const item of role.nav) assert.ok(declared.has(item.path), `route manifest omits ${item.path}`);
  }
});

test('student status, rewards, posts and followers shortcuts stay reachable across routes', async () => {
  const [app, pages, header] = await Promise.all([
    readFile(new URL('../src/App.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/pages.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/auth/RoleSiteHeader.tsx', import.meta.url), 'utf8'),
  ]);
  assert.ok(app.includes("visiblePath.startsWith('/dashboard/')"), 'nested status dashboard links must render the dashboard');
  assert.ok(app.includes("'/followers',"), 'Followers must be routed to the community view');
  assert.ok(pages.includes('onClick={() => navigate(tab.path)}'), 'dashboard tabs must navigate through stable paths');
  assert.ok(pages.includes("path: '/followers'"), 'the Followers summary action must open the Followers route');
  assert.ok(header.includes("label: 'Status', path: '/dashboard/status'"));
  assert.ok(header.includes("label: 'Followers', path: '/followers'"));
  assert.ok(header.includes("label: 'Posts', path: '/posts'"));
  assert.ok(header.includes("label: 'Rewards', path: '/rewards'"));
});

test('Vercel configuration selects Express and avoids unmatched root function patterns', async () => {
  const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
  assert.equal(config.framework, 'express');
  assert.equal(config.buildCommand, 'npm run build');
  for (const pattern of Object.keys(config.functions || {})) {
    assert.ok(pattern.startsWith('api/'), `Vercel function pattern ${pattern} must match an api/ function`);
  }
});

test('Vercel build pins a supported Node major and approves only the pinned esbuild install script', async () => {
  const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(manifest.engines.node, '22.x');
  assert.equal(manifest.allowScripts?.['esbuild@0.25.12'], true);
});

test('Vercel root entrypoint exports the Express handler without opening a local listener', async () => {
  const entry = await import('../index.mjs');
  assert.equal(typeof entry.default, 'function');
});

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const catalogUrl = new URL('../shared/roles.json', import.meta.url);
const catalog = JSON.parse(readFileSync(fileURLToPath(catalogUrl), 'utf8'));
const roles = new Map(catalog.roles.map((role) => [role.id, role]));

export function isAccountRole(role) {
  return roles.has(role);
}

export function getRoleDefinition(role) {
  return roles.get(role) ?? null;
}

export function roleHome(role) {
  return getRoleDefinition(role)?.home ?? '/dashboard';
}

export function hasPermission(user, permission) {
  if (!user || user.roleStatus !== 'active') return false;
  const role = getRoleDefinition(user.role);
  if (!role || !role.permissions.includes(permission)) return false;
  if (role.requiresVerification && user.organization?.verificationStatus !== 'verified') return false;
  return true;
}

export function assertPermission(user, permission) {
  if (!hasPermission(user, permission)) {
    const error = new Error('Your active account role does not have permission to perform this action.');
    error.status = 403;
    throw error;
  }
}

export function canRoleAccessPath(user, rawPath) {
  if (!user) return rawPath === '/login';
  const path = String(rawPath).split(/[?#]/, 1)[0].replace(/\/$/, '') || '/';
  if (user.roleStatus === 'suspended') return ['/account/profile', '/settings'].includes(path);
  if (user.roleStatus === 'pending') {
    return catalog.pendingPaths.some((allowed) => path === allowed || path.startsWith(`${allowed}/`));
  }
  if (catalog.sharedPaths.some((allowed) => path === allowed || path.startsWith(`${allowed}/`))) return true;
  const role = getRoleDefinition(user.role);
  return Boolean(role?.allowedPrefixes.some((allowed) => path === allowed || path.startsWith(`${allowed}/`)));
}

export function assertActiveOrganization(user) {
  if (!user || user.roleStatus !== 'active' || !user.organization?.id || user.organization.verificationStatus !== 'verified') {
    const error = new Error('This workspace must be verified before organization actions are enabled.');
    error.status = 403;
    throw error;
  }
  return user.organization.id;
}

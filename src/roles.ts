import catalog from '../shared/roles.json';

export const accountRoleIds = [
  'student',
  'job_seeker',
  'college',
  'company',
  'recruiter',
  'event_organizer',
  'teacher_researcher',
  'ngo_training',
  'admin',
] as const;

export type AccountRole = (typeof accountRoleIds)[number];
export type AccountStatus = 'active' | 'pending' | 'suspended';
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export type RoleNavItem = { label: string; path: string; icon: string };
export type RoleDefinition = {
  id: AccountRole;
  label: string;
  home: string;
  requiresVerification: boolean;
  adminAllowlistOnly?: boolean;
  nav: RoleNavItem[];
  allowedPrefixes: string[];
  permissions: string[];
};

export const roleDefinitions = catalog.roles as RoleDefinition[];
export const sharedRolePaths = catalog.sharedPaths as string[];
export const pendingRolePaths = catalog.pendingPaths as string[];

export function roleDefinition(role: AccountRole): RoleDefinition {
  const definition = roleDefinitions.find((item) => item.id === role);
  if (!definition) throw new Error(`Unknown account role: ${role}`);
  return definition;
}

export function roleHome(role: AccountRole): string {
  return roleDefinition(role).home;
}

export function canRoleAccessPath(role: AccountRole, status: AccountStatus, rawPath: string): boolean {
  const path = rawPath.split(/[?#]/, 1)[0].replace(/\/$/, '') || '/';
  if (path === '/' || path === '/login') return true;
  if (status === 'suspended') return path === '/settings' || path === '/account/profile';
  if (status === 'pending') return pendingRolePaths.some((allowed) => path === allowed || path.startsWith(`${allowed}/`));
  if (sharedRolePaths.some((allowed) => path === allowed || path.startsWith(`${allowed}/`))) return true;
  return roleDefinition(role).allowedPrefixes.some((allowed) => path === allowed || path.startsWith(`${allowed}/`));
}

export function routeTitle(role: AccountRole): string {
  return roleDefinition(role).label;
}

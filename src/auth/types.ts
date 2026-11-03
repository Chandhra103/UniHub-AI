import type { AccountRole, AccountStatus, VerificationStatus } from '../roles';

export type AccountProfile = Record<string, unknown>;

export type OrganizationAccount = {
  id: string;
  name: string;
  category: string;
  verificationStatus: VerificationStatus;
  profile: AccountProfile;
};

export type AuthenticatedUser = {
  openId: string;
  email: string;
  displayName: string;
  role: AccountRole;
  roleStatus: AccountStatus;
  requestedRole?: AccountRole | null;
  profile: AccountProfile;
  profileVisibility?: 'private' | 'public';
  organization?: OrganizationAccount | null;
};

export type AuthSessionResponse = {
  authenticated: boolean;
  user: AuthenticatedUser | null;
  csrfToken?: string;
};

export type DashboardMetric = { label: string; value: string; trend?: string };
export type DashboardRecord = { id: string; title: string; description?: string; status?: string; date?: string; value?: string; organizationId?: string };
export type RoleDashboardSnapshot = {
  metrics: DashboardMetric[];
  records: Record<string, DashboardRecord[]>;
};

export type RoleAction =
  | { action: 'opportunity.create'; payload: { title: string; description: string; category: string; location?: string } }
  | { action: 'event.create'; payload: { title: string; description: string; date?: string; location?: string } }
  | { action: 'programme.create'; payload: { title: string; description: string; audience?: string } }
  | { action: 'application.create'; payload: { opportunityId: string } }
  | { action: 'application.update'; payload: { applicationId: string; status: string } }
  | { action: 'event.register'; payload: { eventId: string } }
  | { action: 'event.registration.update'; payload: { registrationId: string; status: string } }
  | { action: 'saved-item.toggle'; payload: { itemId: string; itemType: string; title?: string } }
  | { action: 'role.request.review'; payload: { requestId: string; decision: 'verified' | 'rejected'; note?: string } }
  | { action: 'content.moderate'; payload: { contentId: string; decision: 'approved' | 'removed'; note?: string } }
  | { action: 'organization.invite'; payload: { email: string; memberRole?: string } }
  | { action: 'account.profile.update'; payload: AccountProfile }
  | { action: 'organization.profile.update'; payload: { name?: string; category?: string; profile?: AccountProfile } }
  | { action: 'recruitment.shortlist'; payload: { candidateId: string; opportunityId?: string } }
  | { action: 'community.post.create'; payload: { body: string } };

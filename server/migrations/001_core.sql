CREATE TABLE IF NOT EXISTS unihub_users (
  open_id VARCHAR(191) NOT NULL PRIMARY KEY,
  email VARCHAR(320) NOT NULL DEFAULT '',
  display_name VARCHAR(160) NOT NULL DEFAULT '',
  role VARCHAR(40) NOT NULL,
  role_status VARCHAR(20) NOT NULL DEFAULT 'active',
  requested_role VARCHAR(40) NULL,
  profile_json JSON NOT NULL,
  profile_visibility VARCHAR(20) NOT NULL DEFAULT 'private',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_unihub_users_role_status (role, role_status),
  KEY idx_unihub_users_visibility (profile_visibility)
);

CREATE TABLE IF NOT EXISTS unihub_organizations (
  id CHAR(36) NOT NULL PRIMARY KEY,
  owner_open_id VARCHAR(191) NOT NULL,
  org_type VARCHAR(40) NOT NULL,
  name VARCHAR(200) NOT NULL DEFAULT '',
  category VARCHAR(100) NOT NULL DEFAULT '',
  verification_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  profile_json JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_unihub_organizations_owner (owner_open_id),
  KEY idx_unihub_organizations_type_status (org_type, verification_status)
);

CREATE TABLE IF NOT EXISTS unihub_organization_memberships (
  organization_id CHAR(36) NOT NULL,
  open_id VARCHAR(191) NOT NULL,
  membership_role VARCHAR(40) NOT NULL DEFAULT 'owner',
  membership_status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (organization_id, open_id),
  KEY idx_unihub_memberships_user (open_id, membership_status)
);

CREATE TABLE IF NOT EXISTS unihub_role_requests (
  id CHAR(36) NOT NULL PRIMARY KEY,
  open_id VARCHAR(191) NOT NULL,
  requested_role VARCHAR(40) NOT NULL,
  previous_role VARCHAR(40) NOT NULL,
  organization_id CHAR(36) NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  review_note VARCHAR(2000) NOT NULL DEFAULT '',
  reviewed_by VARCHAR(191) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_unihub_role_requests_status (status, created_at),
  KEY idx_unihub_role_requests_user (open_id, status)
);

CREATE TABLE IF NOT EXISTS unihub_opportunities (
  id CHAR(36) NOT NULL PRIMARY KEY,
  organization_id CHAR(36) NULL,
  created_by_open_id VARCHAR(191) NOT NULL,
  title VARCHAR(240) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(40) NOT NULL,
  location VARCHAR(160) NOT NULL DEFAULT '',
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_unihub_opportunities_org_status (organization_id, status, created_at),
  KEY idx_unihub_opportunities_category_status (category, status)
);

CREATE TABLE IF NOT EXISTS unihub_applications (
  id CHAR(36) NOT NULL PRIMARY KEY,
  opportunity_id CHAR(36) NOT NULL,
  applicant_open_id VARCHAR(191) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_unihub_applicant_opportunity (opportunity_id, applicant_open_id),
  KEY idx_unihub_applications_applicant (applicant_open_id, created_at),
  KEY idx_unihub_applications_status (status, created_at)
);

CREATE TABLE IF NOT EXISTS unihub_events (
  id CHAR(36) NOT NULL PRIMARY KEY,
  organization_id CHAR(36) NULL,
  created_by_open_id VARCHAR(191) NOT NULL,
  title VARCHAR(240) NOT NULL,
  description TEXT NOT NULL,
  event_date DATETIME NULL,
  location VARCHAR(200) NOT NULL DEFAULT '',
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_unihub_events_org_status (organization_id, status, event_date),
  KEY idx_unihub_events_creator (created_by_open_id, created_at)
);

CREATE TABLE IF NOT EXISTS unihub_event_registrations (
  id CHAR(36) NOT NULL PRIMARY KEY,
  event_id CHAR(36) NOT NULL,
  participant_open_id VARCHAR(191) NOT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'registered',
  registered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_unihub_event_participant (event_id, participant_open_id),
  KEY idx_unihub_registrations_participant (participant_open_id, registered_at),
  KEY idx_unihub_registrations_event (event_id, status)
);

CREATE TABLE IF NOT EXISTS unihub_programmes (
  id CHAR(36) NOT NULL PRIMARY KEY,
  organization_id CHAR(36) NULL,
  created_by_open_id VARCHAR(191) NOT NULL,
  title VARCHAR(240) NOT NULL,
  description TEXT NOT NULL,
  audience VARCHAR(160) NOT NULL DEFAULT '',
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_unihub_programmes_org_status (organization_id, status, created_at),
  KEY idx_unihub_programmes_creator (created_by_open_id, created_at)
);

CREATE TABLE IF NOT EXISTS unihub_programme_enrolments (
  id CHAR(36) NOT NULL PRIMARY KEY,
  programme_id CHAR(36) NOT NULL,
  participant_open_id VARCHAR(191) NOT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'enrolled',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_unihub_programme_participant (programme_id, participant_open_id),
  KEY idx_unihub_enrolments_participant (participant_open_id, created_at),
  KEY idx_unihub_enrolments_programme (programme_id, status)
);

CREATE TABLE IF NOT EXISTS unihub_shortlists (
  id CHAR(36) NOT NULL PRIMARY KEY,
  recruiter_open_id VARCHAR(191) NOT NULL,
  organization_id CHAR(36) NULL,
  candidate_open_id VARCHAR(191) NOT NULL,
  opportunity_id CHAR(36) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_unihub_shortlist (recruiter_open_id, candidate_open_id, opportunity_id),
  KEY idx_unihub_shortlists_candidate (candidate_open_id)
);

CREATE TABLE IF NOT EXISTS unihub_saved_items (
  open_id VARCHAR(191) NOT NULL,
  item_id VARCHAR(191) NOT NULL,
  item_type VARCHAR(40) NOT NULL,
  title VARCHAR(240) NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (open_id, item_id, item_type),
  KEY idx_unihub_saved_user (open_id, created_at)
);

CREATE TABLE IF NOT EXISTS unihub_community_posts (
  id CHAR(36) NOT NULL PRIMARY KEY,
  author_open_id VARCHAR(191) NOT NULL,
  body TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'published',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_unihub_posts_author (author_open_id, created_at),
  KEY idx_unihub_posts_status (status, created_at)
);

CREATE TABLE IF NOT EXISTS unihub_moderation_items (
  id CHAR(36) NOT NULL PRIMARY KEY,
  content_type VARCHAR(40) NOT NULL,
  content_id VARCHAR(191) NOT NULL,
  reported_by_open_id VARCHAR(191) NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'pending',
  note VARCHAR(2000) NOT NULL DEFAULT '',
  reviewed_by VARCHAR(191) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_unihub_moderation_status (status, created_at)
);

CREATE TABLE IF NOT EXISTS unihub_invitations (
  id CHAR(36) NOT NULL PRIMARY KEY,
  organization_id CHAR(36) NOT NULL,
  created_by_open_id VARCHAR(191) NOT NULL,
  email VARCHAR(320) NOT NULL,
  membership_role VARCHAR(40) NOT NULL DEFAULT 'member',
  status VARCHAR(20) NOT NULL DEFAULT 'prepared',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_unihub_invitations_org (organization_id, created_at)
);

CREATE TABLE IF NOT EXISTS unihub_audit_log (
  id CHAR(36) NOT NULL PRIMARY KEY,
  actor_open_id VARCHAR(191) NOT NULL,
  action VARCHAR(120) NOT NULL,
  target_type VARCHAR(60) NOT NULL DEFAULT '',
  target_id VARCHAR(191) NOT NULL DEFAULT '',
  details_json JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_unihub_audit_created (created_at),
  KEY idx_unihub_audit_actor (actor_open_id, created_at)
);

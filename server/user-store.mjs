import { randomUUID } from 'node:crypto';
import { getPool, getUserByOpenId, parseJson } from './db.mjs';
import { getRoleDefinition, isAccountRole } from './permissions.mjs';

const USER_PROFILE_FIELDS = new Set([
  'headline', 'summary', 'phone', 'location', 'university', 'fieldOfStudy',
  'graduationYear', 'skills', 'careerGoal', 'links', 'profileVisibility',
  'notificationPreferences',
]);
const ORGANIZATION_PROFILE_FIELDS = new Set([
  'description', 'website', 'location', 'size', 'contactEmail', 'focusAreas', 'logoUrl',
]);

export function mergeAllowedFields(existing, patch, allowedFields) {
  const merged = { ...(existing && typeof existing === 'object' ? existing : {}) };
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return merged;
  for (const [key, value] of Object.entries(patch)) {
    if (!allowedFields.has(key) || value === undefined) continue;
    if (typeof value === 'function' || typeof value === 'symbol') continue;
    try {
      const encoded = JSON.stringify(value);
      if (encoded === undefined || encoded.length > 8000) continue;
      merged[key] = JSON.parse(encoded);
    } catch {
      // Ignore non-JSON values while retaining all existing profile fields.
    }
  }
  return merged;
}

function text(value, limit) {
  return typeof value === 'string'
    ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, limit)
    : '';
}

function adminAllowlist() {
  return new Set((process.env.UNIHUB_ADMIN_EMAILS || '').split(',').map((email) => email.trim().toLowerCase()).filter(Boolean));
}

export function isAllowlistedAdminEmail(email) {
  return Boolean(email && adminAllowlist().has(email.trim().toLowerCase()));
}

export function assertOrganizationOwnerMembership(membership) {
  if (membership?.membership_role !== 'owner') {
    const error = new Error('Only the organization owner can update this profile.');
    error.status = 403;
    throw error;
  }
}

async function createOrganizationForRequest(connection, { openId, role, name }) {
  if (!name) return null;
  const organizationId = randomUUID();
  await connection.execute(
    `INSERT INTO unihub_organizations (id, owner_open_id, org_type, name, category, verification_status, profile_json)
     VALUES (?, ?, ?, ?, '', 'pending', ?)`,
    [organizationId, openId, role, name, JSON.stringify({})],
  );
  await connection.execute(
    `INSERT INTO unihub_organization_memberships (organization_id, open_id, membership_role, membership_status)
     VALUES (?, ?, 'owner', 'active')`,
    [organizationId, openId],
  );
  return organizationId;
}

async function createPendingRoleRequest(connection, { openId, requestedRole, previousRole, organizationId = null }) {
  const [existing] = await connection.execute(
    `SELECT id FROM unihub_role_requests WHERE open_id = ? AND requested_role = ? AND status = 'pending' LIMIT 1`,
    [openId, requestedRole],
  );
  if (existing.length) {
    if (organizationId) await connection.execute('UPDATE unihub_role_requests SET organization_id = ? WHERE id = ?', [organizationId, existing[0].id]);
    return existing[0].id;
  }
  const id = randomUUID();
  await connection.execute(
    `INSERT INTO unihub_role_requests (id, open_id, requested_role, previous_role, organization_id, status)
     VALUES (?, ?, ?, ?, ?, 'pending')`,
    [id, openId, requestedRole, previousRole, organizationId],
  );
  return id;
}

export async function ensureUserForOAuth({ identity, requestedRole = 'student', organizationName = '' }) {
  const openId = text(identity?.openId, 191);
  if (!openId) throw new Error('The account provider did not return a usable identity.');
  const email = text(identity?.email, 320).toLowerCase();
  const displayName = text(identity?.name, 160) || 'UniHub member';
  const roleChoice = isAccountRole(requestedRole) ? requestedRole : 'student';
  const adminAllowed = isAllowlistedAdminEmail(email);
  const adminDenied = roleChoice === 'admin' && !adminAllowed;
  let roleMismatch = false;
  const requested = adminDenied ? 'student' : roleChoice;
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute(
      'SELECT open_id, email, display_name, role, role_status, requested_role FROM unihub_users WHERE open_id = ? FOR UPDATE',
      [openId],
    );
    const existing = rows[0];
    if (existing) {
      await connection.execute(
        `UPDATE unihub_users
            SET email = CASE WHEN ? <> '' THEN ? ELSE email END,
                display_name = CASE WHEN display_name = '' OR display_name = 'UniHub member' THEN ? ELSE display_name END
          WHERE open_id = ?`,
        [email, email, displayName, openId],
      );
      if (adminAllowed && existing.role !== 'admin') {
        await connection.execute(
          `UPDATE unihub_users SET role = 'admin', role_status = 'active', requested_role = NULL WHERE open_id = ?`,
          [openId],
        );
        await connection.execute(
          `INSERT INTO unihub_audit_log (id, actor_open_id, action, target_type, target_id, details_json)
           VALUES (?, ?, 'admin.bootstrap', 'user', ?, ?)`,
          [randomUUID(), openId, openId, JSON.stringify({ source: 'configured_email_allowlist' })],
        );
      } else if (!adminDenied && requested !== 'admin' && requested !== existing.role) {
        roleMismatch = true;
      }
    } else {
      const assignedRole = adminAllowed ? 'admin' : requested;
      const definition = getRoleDefinition(assignedRole);
      const roleStatus = definition?.requiresVerification ? 'pending' : 'active';
      await connection.execute(
        `INSERT INTO unihub_users (open_id, email, display_name, role, role_status, requested_role, profile_json)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [openId, email, displayName, assignedRole, roleStatus, roleStatus === 'pending' ? assignedRole : null, JSON.stringify({})],
      );
      if (roleStatus === 'pending') {
        const orgId = await createOrganizationForRequest(connection, {
          openId,
          role: assignedRole,
          name: text(organizationName, 200),
        });
        await createPendingRoleRequest(connection, {
          openId,
          requestedRole: assignedRole,
          previousRole: 'student',
          organizationId: orgId,
        });
      }
      if (assignedRole === 'admin') {
        await connection.execute(
          `INSERT INTO unihub_audit_log (id, actor_open_id, action, target_type, target_id, details_json)
           VALUES (?, ?, 'admin.bootstrap', 'user', ?, ?)`,
          [randomUUID(), openId, openId, JSON.stringify({ source: 'configured_email_allowlist' })],
        );
      }
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  const user = await getUserByOpenId(openId);
  if (!user) throw new Error('The signed-in account could not be initialized.');
  return { user, adminDenied, roleMismatch };
}

export async function updateUserProfile(openId, patch) {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute('SELECT profile_json FROM unihub_users WHERE open_id = ? FOR UPDATE', [openId]);
    if (!rows.length) {
      const error = new Error('Account profile not found.');
      error.status = 404;
      throw error;
    }
    const profile = mergeAllowedFields(parseJson(rows[0].profile_json), patch?.profile, USER_PROFILE_FIELDS);
    const displayName = patch?.displayName === undefined ? null : text(patch.displayName, 160);
    const visibility = profile.profileVisibility === 'public' ? 'public' : 'private';
    await connection.execute(
      `UPDATE unihub_users
          SET profile_json = ?,
              display_name = COALESCE(?, display_name),
              profile_visibility = ?
        WHERE open_id = ?`,
      [JSON.stringify(profile), displayName, visibility, openId],
    );
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  return getUserByOpenId(openId);
}

export async function updateOrganizationProfile(user, patch) {
  const role = getRoleDefinition(user.role);
  if (!role?.requiresVerification || !['college', 'company', 'recruiter', 'event_organizer', 'ngo_training'].includes(user.role)) {
    const error = new Error('This account does not have an organization profile.');
    error.status = 403;
    throw error;
  }
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [membershipRows] = await connection.execute(
      `SELECT o.id, o.name, o.category, o.profile_json, o.verification_status,
              m.membership_role
         FROM unihub_organization_memberships m
         JOIN unihub_organizations o ON o.id = m.organization_id
        WHERE m.open_id = ? AND m.membership_status = 'active'
        ORDER BY m.created_at ASC LIMIT 1 FOR UPDATE`,
      [user.openId],
    );
    const suppliedName = text(patch?.name, 200);
    const category = text(patch?.category, 100);
    let organizationId;
    if (membershipRows.length) assertOrganizationOwnerMembership(membershipRows[0]);
    if (!membershipRows.length) {
      if (!suppliedName) {
        const error = new Error('Add an organization name before saving the organization profile.');
        error.status = 400;
        throw error;
      }
      organizationId = randomUUID();
      const profile = mergeAllowedFields({}, patch?.profile, ORGANIZATION_PROFILE_FIELDS);
      await connection.execute(
        `INSERT INTO unihub_organizations (id, owner_open_id, org_type, name, category, verification_status, profile_json)
         VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
        [organizationId, user.openId, user.role, suppliedName, category, JSON.stringify(profile)],
      );
      await connection.execute(
        `INSERT INTO unihub_organization_memberships (organization_id, open_id, membership_role, membership_status)
         VALUES (?, ?, 'owner', 'active')`,
        [organizationId, user.openId],
      );
      await connection.execute(
        `UPDATE unihub_role_requests SET organization_id = ?
          WHERE open_id = ? AND requested_role = ? AND status = 'pending' AND organization_id IS NULL`,
        [organizationId, user.openId, user.role],
      );
    } else {
      const current = membershipRows[0];
      organizationId = current.id;
      const profile = mergeAllowedFields(parseJson(current.profile_json), patch?.profile, ORGANIZATION_PROFILE_FIELDS);
      await connection.execute(
        `UPDATE unihub_organizations
            SET name = COALESCE(NULLIF(?, ''), name),
                category = COALESCE(NULLIF(?, ''), category),
                profile_json = ?
          WHERE id = ? AND owner_open_id = ?`,
        [suppliedName, category, JSON.stringify(profile), organizationId, user.openId],
      );
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  return getUserByOpenId(user.openId);
}

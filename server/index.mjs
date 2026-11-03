import express from 'express';
import http from 'node:http';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPool, getUserByOpenId } from './db.mjs';
import { assertActiveOrganization, assertPermission } from './permissions.mjs';
import {
  assertCsrf, assertMutationOrigin, clearSessionCookie, finishOAuth,
  logoutSession, resolveSession, startOAuth,
} from './auth.mjs';
import {
  ensureUserForOAuth, updateOrganizationProfile, updateUserProfile,
} from './user-store.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const isDev = process.argv.includes('--dev');
const isMainModule = Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
const isVercel = process.env.VERCEL === '1';
const port = Number(process.env.PORT || 3000);
const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '1mb', type: ['application/json', 'application/*+json'] }));

function httpError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function apiErrorMessage(error) {
  if (error?.code === 'AUTH_CONFIGURATION') {
    return 'Sign-in is not configured on this deployment. Ask the administrator to add the Manus OAuth settings and session secret in Vercel.';
  }
  if (error?.code === 'DATABASE_CONFIGURATION') {
    return 'Account storage is not configured. Ask the administrator to add DATABASE_URL and apply the UniHub database migration.';
  }
  return error?.status && error.status < 500 ? error.message : 'The request could not be completed.';
}

async function sessionFor(req, res) {
  return resolveSession(req, res, getUserByOpenId, ensureUserForOAuth);
}

async function authenticated(req, res) {
  const session = await sessionFor(req, res);
  if (!session) throw httpError('Sign in to continue.', 401);
  return session;
}

function requireMutation(req, session) {
  assertMutationOrigin(req);
  assertCsrf(session, req);
}

function text(value, limit) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, limit);
}

function validStatus(value, allowed) {
  return typeof value === 'string' && allowed.includes(value) ? value : null;
}

async function audit(user, action, targetType, targetId, details = {}) {
  const pool = getPool();
  await pool.execute(
    `INSERT INTO unihub_audit_log (id, actor_open_id, action, target_type, target_id, details_json)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [randomUUID(), user.openId, action, targetType, String(targetId || ''), JSON.stringify(details)],
  );
}

async function getDashboardSnapshot(user) {
  const pool = getPool();
  const metrics = [];
  const records = {};
  const count = async (sql, params = []) => {
    const [rows] = await pool.execute(sql, params);
    return Number(rows[0]?.total || 0);
  };
  const list = async (key, sql, params = []) => {
    const [rows] = await pool.execute(sql, params);
    records[key] = rows.map((row) => ({
      id: String(row.id || row.open_id || ''),
      title: String(row.title || row.display_name || row.name || 'Record'),
      description: String(row.description || row.meta || ''),
      status: row.status ? String(row.status) : undefined,
      date: row.event_date ? new Date(row.event_date).toISOString().slice(0, 10) : row.created_at ? new Date(row.created_at).toISOString().slice(0, 10) : undefined,
      value: row.value ? String(row.value) : undefined,
      organizationId: row.organization_id ? String(row.organization_id) : undefined,
    }));
  };

  if (user.role === 'student' || user.role === 'job_seeker') {
    const [applications, saved] = await Promise.all([
      count('SELECT COUNT(*) AS total FROM unihub_applications WHERE applicant_open_id = ?', [user.openId]),
      count('SELECT COUNT(*) AS total FROM unihub_saved_items WHERE open_id = ?', [user.openId]),
    ]);
    metrics.push({ label: 'Applications', value: String(applications) }, { label: 'Saved items', value: String(saved) });
    await list('applications',
      `SELECT a.id, o.title, a.status, a.created_at, o.organization_id
         FROM unihub_applications a JOIN unihub_opportunities o ON o.id = a.opportunity_id
        WHERE a.applicant_open_id = ? ORDER BY a.created_at DESC LIMIT 12`, [user.openId]);
    await list('opportunities',
      `SELECT id, title, description, status, created_at, organization_id FROM unihub_opportunities
        WHERE status = 'published' ORDER BY created_at DESC LIMIT 12`);
    await list('saved',
      `SELECT item_id AS id, title, item_type AS status, created_at FROM unihub_saved_items
        WHERE open_id = ? ORDER BY created_at DESC LIMIT 12`, [user.openId]);
    return { metrics, records };
  }

  if (user.role === 'teacher_researcher') {
    const [research, programmes] = await Promise.all([
      count("SELECT COUNT(*) AS total FROM unihub_opportunities WHERE created_by_open_id = ? AND category = 'research'", [user.openId]),
      count('SELECT COUNT(*) AS total FROM unihub_programmes WHERE created_by_open_id = ?', [user.openId]),
    ]);
    metrics.push({ label: 'Research listings', value: String(research) }, { label: 'Learning programmes', value: String(programmes) });
    await list('research',
      `SELECT id, title, description, status, created_at FROM unihub_opportunities
        WHERE category = 'research' AND (created_by_open_id = ? OR status = 'published') ORDER BY created_at DESC LIMIT 12`, [user.openId]);
    await list('academicEvents',
      `SELECT id, title, description, status, event_date, created_at FROM unihub_events
        WHERE status = 'published' ORDER BY event_date ASC LIMIT 12`);
    await list('community',
      `SELECT id, body AS title, status, created_at FROM unihub_community_posts
        WHERE author_open_id = ? ORDER BY created_at DESC LIMIT 8`, [user.openId]);
    return { metrics, records };
  }

  if (user.role === 'admin') {
    const [users, requests, moderation, opportunities] = await Promise.all([
      count('SELECT COUNT(*) AS total FROM unihub_users'),
      count("SELECT COUNT(*) AS total FROM unihub_role_requests WHERE status = 'pending'"),
      count("SELECT COUNT(*) AS total FROM unihub_moderation_items WHERE status = 'pending'"),
      count('SELECT COUNT(*) AS total FROM unihub_opportunities'),
    ]);
    metrics.push({ label: 'Platform accounts', value: String(users) }, { label: 'Role verifications', value: String(requests) }, { label: 'Moderation queue', value: String(moderation) }, { label: 'Opportunity listings', value: String(opportunities) });
    await list('verificationQueue',
      `SELECT r.id, CONCAT(u.display_name, ' · ', r.requested_role) AS title,
              CONCAT(u.email, ' · ', COALESCE(o.name, 'Organization profile pending')) AS description,
              r.status, r.created_at
         FROM unihub_role_requests r JOIN unihub_users u ON u.open_id = r.open_id
         LEFT JOIN unihub_organizations o ON o.id = r.organization_id
        WHERE r.status = 'pending' ORDER BY r.created_at ASC LIMIT 30`);
    await list('moderationQueue',
      `SELECT id, CONCAT(content_type, ' · ', content_id) AS title, note AS description, status, created_at
         FROM unihub_moderation_items WHERE status = 'pending' ORDER BY created_at ASC LIMIT 30`);
    await list('recentUsers',
      `SELECT open_id, display_name AS title, CONCAT(email, ' · ', role) AS description, role_status AS status, created_at
         FROM unihub_users ORDER BY created_at DESC LIMIT 15`);
    return { metrics, records };
  }

  const organizationId = user.organization?.id;
  if (!organizationId) throw httpError('Complete your organization profile before opening this workspace.', 409);

  if (user.role === 'college') {
    const [students, opportunities, events, programmes] = await Promise.all([
      count("SELECT COUNT(*) AS total FROM unihub_organization_memberships WHERE organization_id = ? AND membership_role = 'student' AND membership_status = 'active'", [organizationId]),
      count('SELECT COUNT(*) AS total FROM unihub_opportunities WHERE organization_id = ?', [organizationId]),
      count('SELECT COUNT(*) AS total FROM unihub_events WHERE organization_id = ?', [organizationId]),
      count('SELECT COUNT(*) AS total FROM unihub_programmes WHERE organization_id = ?', [organizationId]),
    ]);
    metrics.push({ label: 'Connected students', value: String(students) }, { label: 'Campus opportunities', value: String(opportunities) }, { label: 'Campus events', value: String(events) }, { label: 'Learning programmes', value: String(programmes) });
    await list('students',
      `SELECT u.open_id, u.display_name, u.email, m.membership_role AS status, m.created_at
         FROM unihub_organization_memberships m JOIN unihub_users u ON u.open_id = m.open_id
        WHERE m.organization_id = ? AND m.membership_role = 'student' AND m.membership_status = 'active'
        ORDER BY m.created_at DESC LIMIT 30`, [organizationId]);
    await list('opportunities', 'SELECT id, title, description, status, created_at FROM unihub_opportunities WHERE organization_id = ? ORDER BY created_at DESC LIMIT 12', [organizationId]);
    await list('events', 'SELECT id, title, description, status, event_date, created_at FROM unihub_events WHERE organization_id = ? ORDER BY event_date ASC LIMIT 12', [organizationId]);
    await list('programmes', 'SELECT id, title, description, status, created_at FROM unihub_programmes WHERE organization_id = ? ORDER BY created_at DESC LIMIT 12', [organizationId]);
    return { metrics, records };
  }

  if (user.role === 'company') {
    const [opportunities, applicants, interviews, hired] = await Promise.all([
      count('SELECT COUNT(*) AS total FROM unihub_opportunities WHERE organization_id = ?', [organizationId]),
      count('SELECT COUNT(*) AS total FROM unihub_applications a JOIN unihub_opportunities o ON o.id = a.opportunity_id WHERE o.organization_id = ?', [organizationId]),
      count("SELECT COUNT(*) AS total FROM unihub_applications a JOIN unihub_opportunities o ON o.id = a.opportunity_id WHERE o.organization_id = ? AND a.status = 'interview'", [organizationId]),
      count("SELECT COUNT(*) AS total FROM unihub_applications a JOIN unihub_opportunities o ON o.id = a.opportunity_id WHERE o.organization_id = ? AND a.status = 'offer'", [organizationId]),
    ]);
    metrics.push({ label: 'Open roles', value: String(opportunities) }, { label: 'Applicants', value: String(applicants) }, { label: 'In interview', value: String(interviews) }, { label: 'Offers', value: String(hired) });
    await list('opportunities', 'SELECT id, title, description, status, created_at FROM unihub_opportunities WHERE organization_id = ? ORDER BY created_at DESC LIMIT 12', [organizationId]);
    await list('applicants',
      `SELECT a.id, u.display_name AS title, CONCAT(o.title, ' · ', u.email) AS description,
              a.status, a.created_at, o.organization_id
         FROM unihub_applications a JOIN unihub_opportunities o ON o.id = a.opportunity_id
         JOIN unihub_users u ON u.open_id = a.applicant_open_id
        WHERE o.organization_id = ? ORDER BY a.created_at DESC LIMIT 30`, [organizationId]);
    return { metrics, records };
  }

  if (user.role === 'recruiter') {
    const [candidates, applicants, shortlisted] = await Promise.all([
      count("SELECT COUNT(*) AS total FROM unihub_users WHERE profile_visibility = 'public' AND role IN ('student','job_seeker') AND role_status = 'active'"),
      count('SELECT COUNT(*) AS total FROM unihub_applications a JOIN unihub_opportunities o ON o.id = a.opportunity_id WHERE o.organization_id = ?', [organizationId]),
      count('SELECT COUNT(*) AS total FROM unihub_shortlists WHERE organization_id = ?', [organizationId]),
    ]);
    metrics.push({ label: 'Discoverable candidates', value: String(candidates) }, { label: 'Applicants', value: String(applicants) }, { label: 'Shortlisted', value: String(shortlisted) });
    await list('candidates',
      `SELECT open_id, display_name AS title, CONCAT(role, ' · ', COALESCE(JSON_UNQUOTE(JSON_EXTRACT(profile_json, '$.headline')), 'Profile available')) AS description,
              profile_visibility AS status, updated_at AS created_at
         FROM unihub_users WHERE profile_visibility = 'public' AND role IN ('student','job_seeker') AND role_status = 'active'
        ORDER BY updated_at DESC LIMIT 30`);
    await list('applicants',
      `SELECT a.id, u.display_name AS title, CONCAT(o.title, ' · ', a.status) AS description, a.status, a.created_at
         FROM unihub_applications a JOIN unihub_opportunities o ON o.id = a.opportunity_id
         JOIN unihub_users u ON u.open_id = a.applicant_open_id
        WHERE o.organization_id = ? ORDER BY a.created_at DESC LIMIT 30`, [organizationId]);
    return { metrics, records };
  }

  if (user.role === 'event_organizer') {
    const [eventCount, registrations, participants] = await Promise.all([
      count('SELECT COUNT(*) AS total FROM unihub_events WHERE organization_id = ?', [organizationId]),
      count('SELECT COUNT(*) AS total FROM unihub_event_registrations r JOIN unihub_events e ON e.id = r.event_id WHERE e.organization_id = ?', [organizationId]),
      count("SELECT COUNT(DISTINCT r.participant_open_id) AS total FROM unihub_event_registrations r JOIN unihub_events e ON e.id = r.event_id WHERE e.organization_id = ? AND r.status = 'checked_in'", [organizationId]),
    ]);
    metrics.push({ label: 'Events', value: String(eventCount) }, { label: 'Registrations', value: String(registrations) }, { label: 'Participants checked in', value: String(participants) });
    await list('events', 'SELECT id, title, description, status, event_date, created_at FROM unihub_events WHERE organization_id = ? ORDER BY event_date ASC LIMIT 20', [organizationId]);
    await list('registrations',
      `SELECT r.id, u.display_name AS title, CONCAT(e.title, ' · ', u.email) AS description, r.status, r.registered_at AS created_at
         FROM unihub_event_registrations r JOIN unihub_events e ON e.id = r.event_id
         JOIN unihub_users u ON u.open_id = r.participant_open_id
        WHERE e.organization_id = ? ORDER BY r.registered_at DESC LIMIT 30`, [organizationId]);
    return { metrics, records };
  }

  if (user.role === 'ngo_training') {
    const [programmes, participants, completed] = await Promise.all([
      count('SELECT COUNT(*) AS total FROM unihub_programmes WHERE organization_id = ?', [organizationId]),
      count('SELECT COUNT(*) AS total FROM unihub_programme_enrolments e JOIN unihub_programmes p ON p.id = e.programme_id WHERE p.organization_id = ?', [organizationId]),
      count("SELECT COUNT(*) AS total FROM unihub_programme_enrolments e JOIN unihub_programmes p ON p.id = e.programme_id WHERE p.organization_id = ? AND e.status = 'completed'", [organizationId]),
    ]);
    metrics.push({ label: 'Programmes', value: String(programmes) }, { label: 'Participants', value: String(participants) }, { label: 'Completed pathways', value: String(completed) });
    await list('programmes', 'SELECT id, title, description, status, created_at FROM unihub_programmes WHERE organization_id = ? ORDER BY created_at DESC LIMIT 20', [organizationId]);
    await list('participants',
      `SELECT e.id, u.display_name AS title, CONCAT(p.title, ' · ', e.status) AS description, e.status, e.created_at
         FROM unihub_programme_enrolments e JOIN unihub_programmes p ON p.id = e.programme_id
         JOIN unihub_users u ON u.open_id = e.participant_open_id
        WHERE p.organization_id = ? ORDER BY e.created_at DESC LIMIT 30`, [organizationId]);
    return { metrics, records };
  }

  throw httpError('No dashboard is available for this role.', 403);
}

async function handleAction(user, action, payload = {}) {
  const pool = getPool();
  const id = randomUUID();
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw httpError('Action details are invalid.');

  if (action === 'opportunity.create') {
    const category = text(payload.category || 'job', 40);
    const researchPermission = category === 'research' && user.role === 'teacher_researcher';
    if (researchPermission) assertPermission(user, 'research.create');
    else assertPermission(user, 'opportunities.manage_org');
    const organizationId = researchPermission ? null : assertActiveOrganization(user);
    const title = text(payload.title, 240);
    const description = text(payload.description, 8000);
    if (title.length < 4 || description.length < 10) throw httpError('Add a clear title and description before publishing.');
    await pool.execute(
      `INSERT INTO unihub_opportunities (id, organization_id, created_by_open_id, title, description, category, location, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'published')`,
      [id, organizationId, user.openId, title, description, category, text(payload.location, 160)],
    );
    await audit(user, 'opportunity.create', 'opportunity', id, { category });
    return { id, status: 'published' };
  }

  if (action === 'event.create') {
    assertPermission(user, 'events.manage_org');
    const organizationId = assertActiveOrganization(user);
    const title = text(payload.title, 240);
    const description = text(payload.description, 8000);
    if (title.length < 4 || description.length < 10) throw httpError('Add an event title and description.');
    const eventDate = text(payload.date, 32) || null;
    await pool.execute(
      `INSERT INTO unihub_events (id, organization_id, created_by_open_id, title, description, event_date, location, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'published')`,
      [id, organizationId, user.openId, title, description, eventDate, text(payload.location, 200)],
    );
    await audit(user, 'event.create', 'event', id);
    return { id, status: 'published' };
  }

  if (action === 'programme.create') {
    assertPermission(user, 'programmes.manage_org');
    const organizationId = assertActiveOrganization(user);
    const title = text(payload.title, 240);
    const description = text(payload.description, 8000);
    if (title.length < 4 || description.length < 10) throw httpError('Add a programme title and description.');
    await pool.execute(
      `INSERT INTO unihub_programmes (id, organization_id, created_by_open_id, title, description, audience, status)
       VALUES (?, ?, ?, ?, ?, ?, 'published')`,
      [id, organizationId, user.openId, title, description, text(payload.audience, 160)],
    );
    await audit(user, 'programme.create', 'programme', id);
    return { id, status: 'published' };
  }

  if (action === 'application.create') {
    assertPermission(user, 'applications.create_own');
    const opportunityId = text(payload.opportunityId, 36);
    const [opportunities] = await pool.execute("SELECT id FROM unihub_opportunities WHERE id = ? AND status = 'published'", [opportunityId]);
    if (!opportunities.length) throw httpError('This opportunity is no longer available.', 404);
    try {
      await pool.execute("INSERT INTO unihub_applications (id, opportunity_id, applicant_open_id, status) VALUES (?, ?, ?, 'submitted')", [id, opportunityId, user.openId]);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') throw httpError('You have already applied to this opportunity.', 409);
      throw error;
    }
    return { id, status: 'submitted' };
  }

  if (action === 'application.update') {
    assertPermission(user, 'applications.update_org');
    const organizationId = assertActiveOrganization(user);
    const applicationId = text(payload.applicationId, 36);
    const status = validStatus(payload.status, ['reviewing', 'shortlisted', 'interview', 'rejected', 'offer']);
    if (!status) throw httpError('Choose a valid application status.');
    const [result] = await pool.execute(
      `UPDATE unihub_applications a JOIN unihub_opportunities o ON o.id = a.opportunity_id
          SET a.status = ? WHERE a.id = ? AND o.organization_id = ?`,
      [status, applicationId, organizationId],
    );
    if (!result.affectedRows) throw httpError('Application not found in your organization.', 404);
    await audit(user, 'application.update', 'application', applicationId, { status });
    return { id: applicationId, status };
  }

  if (action === 'event.register') {
    assertPermission(user, 'events.register_own');
    const eventId = text(payload.eventId, 36);
    const [events] = await pool.execute("SELECT id FROM unihub_events WHERE id = ? AND status = 'published'", [eventId]);
    if (!events.length) throw httpError('This event is no longer open for registration.', 404);
    const registrationId = randomUUID();
    try {
      await pool.execute("INSERT INTO unihub_event_registrations (id, event_id, participant_open_id, status) VALUES (?, ?, ?, 'registered')", [registrationId, eventId, user.openId]);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') throw httpError('You are already registered for this event.', 409);
      throw error;
    }
    return { id: registrationId, status: 'registered' };
  }

  if (action === 'event.registration.update') {
    assertPermission(user, 'registrations.read_org');
    const organizationId = assertActiveOrganization(user);
    const registrationId = text(payload.registrationId, 36);
    const status = validStatus(payload.status, ['registered', 'waitlisted', 'checked_in', 'cancelled']);
    if (!status) throw httpError('Choose a valid registration status.');
    const [result] = await pool.execute(
      `UPDATE unihub_event_registrations r JOIN unihub_events e ON e.id = r.event_id
          SET r.status = ? WHERE r.id = ? AND e.organization_id = ?`,
      [status, registrationId, organizationId],
    );
    if (!result.affectedRows) throw httpError('Registration not found in your organization.', 404);
    await audit(user, 'event.registration.update', 'registration', registrationId, { status });
    return { id: registrationId, status };
  }

  if (action === 'saved-item.toggle') {
    assertPermission(user, 'profile.update_own');
    const itemId = text(payload.itemId, 191);
    const itemType = text(payload.itemType, 40);
    if (!itemId || !itemType) throw httpError('Choose an item to save.');
    const [rows] = await pool.execute('SELECT item_id FROM unihub_saved_items WHERE open_id = ? AND item_id = ? AND item_type = ?', [user.openId, itemId, itemType]);
    if (rows.length) {
      await pool.execute('DELETE FROM unihub_saved_items WHERE open_id = ? AND item_id = ? AND item_type = ?', [user.openId, itemId, itemType]);
      return { saved: false };
    }
    await pool.execute('INSERT INTO unihub_saved_items (open_id, item_id, item_type, title) VALUES (?, ?, ?, ?)', [user.openId, itemId, itemType, text(payload.title, 240)]);
    return { saved: true };
  }

  if (action === 'role.request.review') {
    assertPermission(user, 'roles.manage');
    const requestId = text(payload.requestId, 36);
    const decision = validStatus(payload.decision, ['verified', 'rejected']);
    if (!decision) throw httpError('Choose a valid verification decision.');
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [requests] = await connection.execute("SELECT * FROM unihub_role_requests WHERE id = ? AND status = 'pending' FOR UPDATE", [requestId]);
      if (!requests.length) throw httpError('Pending role request not found.', 404);
      const request = requests[0];
      if (decision === 'verified') {
        const definition = (await import('./permissions.mjs')).getRoleDefinition(request.requested_role);
        if (definition?.requiresVerification && !request.organization_id) throw httpError('The applicant must complete an organization profile before verification.', 409);
        await connection.execute(
          `UPDATE unihub_users SET role = ?, role_status = 'active', requested_role = NULL WHERE open_id = ?`,
          [request.requested_role, request.open_id],
        );
        if (request.organization_id) await connection.execute("UPDATE unihub_organizations SET verification_status = 'verified' WHERE id = ?", [request.organization_id]);
        await connection.execute("UPDATE unihub_role_requests SET status = 'verified', reviewed_by = ?, review_note = ? WHERE id = ?", [user.openId, text(payload.note, 2000), requestId]);
      } else {
        await connection.execute(
          `UPDATE unihub_users SET role = ?, role_status = 'active', requested_role = NULL WHERE open_id = ?`,
          [request.previous_role || 'student', request.open_id],
        );
        if (request.organization_id) await connection.execute("UPDATE unihub_organizations SET verification_status = 'rejected' WHERE id = ?", [request.organization_id]);
        await connection.execute("UPDATE unihub_role_requests SET status = 'rejected', reviewed_by = ?, review_note = ? WHERE id = ?", [user.openId, text(payload.note, 2000), requestId]);
      }
      await connection.execute(
        `INSERT INTO unihub_audit_log (id, actor_open_id, action, target_type, target_id, details_json)
         VALUES (?, ?, ?, 'role_request', ?, ?)`,
        [randomUUID(), user.openId, `role.request.${decision}`, requestId, JSON.stringify({ requestedRole: request.requested_role })],
      );
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    return { id: requestId, status: decision };
  }

  if (action === 'content.moderate') {
    assertPermission(user, 'content.moderate');
    const contentId = text(payload.contentId, 191);
    const decision = validStatus(payload.decision, ['approved', 'removed']);
    if (!decision) throw httpError('Choose a valid moderation decision.');
    const [result] = await pool.execute(
      `UPDATE unihub_moderation_items SET status = ?, note = ?, reviewed_by = ? WHERE id = ? AND status = 'pending'`,
      [decision, text(payload.note, 2000), user.openId, contentId],
    );
    if (!result.affectedRows) throw httpError('Moderation item not found or already resolved.', 404);
    await audit(user, 'content.moderate', 'moderation_item', contentId, { decision });
    return { id: contentId, status: decision };
  }

  if (action === 'organization.invite') {
    assertPermission(user, 'profile.update_org');
    const organizationId = assertActiveOrganization(user);
    const email = text(payload.email, 320).toLowerCase();
    if (!email.includes('@')) throw httpError('Enter a valid teammate email.');
    const invitationId = randomUUID();
    await pool.execute(
      `INSERT INTO unihub_invitations (id, organization_id, created_by_open_id, email, membership_role, status)
       VALUES (?, ?, ?, ?, ?, 'prepared')`,
      [invitationId, organizationId, user.openId, email, text(payload.memberRole || 'member', 40)],
    );
    await audit(user, 'organization.invite.prepare', 'invitation', invitationId);
    return { id: invitationId, status: 'prepared' };
  }

  if (action === 'account.profile.update') {
    const updated = await updateUserProfile(user.openId, { profile: payload.profile || payload, displayName: payload.displayName });
    return { profile: updated.profile, displayName: updated.displayName };
  }

  if (action === 'organization.profile.update') {
    const updated = await updateOrganizationProfile(user, payload);
    return { organization: updated.organization };
  }

  if (action === 'recruitment.shortlist') {
    assertPermission(user, 'candidates.search');
    const organizationId = assertActiveOrganization(user);
    const candidateId = text(payload.candidateId, 191);
    const [candidates] = await pool.execute(
      "SELECT open_id FROM unihub_users WHERE open_id = ? AND profile_visibility = 'public' AND role IN ('student','job_seeker') AND role_status = 'active'",
      [candidateId],
    );
    if (!candidates.length) throw httpError('This profile is not available for candidate discovery.', 404);
    const shortlistId = randomUUID();
    try {
      await pool.execute(
        'INSERT INTO unihub_shortlists (id, recruiter_open_id, organization_id, candidate_open_id, opportunity_id) VALUES (?, ?, ?, ?, ?)',
        [shortlistId, user.openId, organizationId, candidateId, text(payload.opportunityId, 36) || null],
      );
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') throw httpError('This candidate is already on your shortlist.', 409);
      throw error;
    }
    await audit(user, 'recruitment.shortlist', 'candidate', candidateId);
    return { id: shortlistId, status: 'shortlisted' };
  }

  if (action === 'community.post.create') {
    assertPermission(user, 'community.create_own');
    const body = text(payload.body, 4000);
    if (body.length < 2) throw httpError('Write a little more before posting.');
    await pool.execute("INSERT INTO unihub_community_posts (id, author_open_id, body, status) VALUES (?, ?, ?, 'published')", [id, user.openId, body]);
    return { id, status: 'published' };
  }

  throw httpError('Unknown or unavailable action.', 404);
}

app.get('/_app/health', async (_req, res) => {
  try {
    const pool = getPool();
    await pool.query('SELECT 1');
    const [migrations] = await pool.execute("SELECT migration_id FROM unihub_schema_migrations WHERE migration_id = '001_core.sql'");
    if (!migrations.length) return res.status(503).json({ status: 'not-ready' });
    return res.status(200).json({ status: 'ok' });
  } catch {
    return res.status(503).json({ status: 'unavailable' });
  }
});

app.get('/api/auth/session', async (req, res, next) => {
  try {
    const session = await sessionFor(req, res);
    if (!session) return res.json({ authenticated: false, user: null });
    return res.json({ authenticated: true, user: session.user, csrfToken: session.csrfToken });
  } catch (error) { return next(error); }
});

app.post('/api/auth/start', (req, res, next) => {
  try {
    const authorizationUrl = startOAuth(req, res);
    return res.json({ authorizationUrl });
  } catch (error) { return next(error); }
});

app.get('/api/auth/callback', async (req, res, next) => {
  try {
    return await finishOAuth(req, res, ensureUserForOAuth);
  } catch (error) { return next(error); }
});

app.post('/api/auth/logout', async (req, res, next) => {
  try {
    const session = await authenticated(req, res);
    requireMutation(req, session);
    logoutSession(req, res);
    return res.status(204).end();
  } catch (error) { return next(error); }
});

app.get('/api/account/profile', async (req, res, next) => {
  try {
    const session = await authenticated(req, res);
    return res.json({ user: session.user, csrfToken: session.csrfToken });
  } catch (error) { return next(error); }
});

app.patch('/api/account/profile', async (req, res, next) => {
  try {
    const session = await authenticated(req, res);
    requireMutation(req, session);
    const user = await updateUserProfile(session.user.openId, req.body || {});
    return res.json({ user });
  } catch (error) { return next(error); }
});

app.patch('/api/account/organization', async (req, res, next) => {
  try {
    const session = await authenticated(req, res);
    requireMutation(req, session);
    const user = await updateOrganizationProfile(session.user, req.body || {});
    return res.json({ user });
  } catch (error) { return next(error); }
});

app.get('/api/dashboard', async (req, res, next) => {
  try {
    const session = await authenticated(req, res);
    if (session.user.roleStatus !== 'active') return res.status(403).json({ error: 'Account verification is pending.', user: session.user });
    return res.json(await getDashboardSnapshot(session.user));
  } catch (error) { return next(error); }
});

app.post('/api/actions', async (req, res, next) => {
  try {
    const session = await authenticated(req, res);
    requireMutation(req, session);
    const result = await handleAction(session.user, req.body?.action, req.body?.payload || {});
    return res.json({ ok: true, result });
  } catch (error) { return next(error); }
});

app.use('/api', (_req, res) => res.status(404).json({ error: 'API route not found.' }));

if (isDev) {
  const { createServer: createViteServer } = await import('vite');
  const httpServer = http.createServer(app);
  const vite = await createViteServer({
    root: projectRoot,
    configFile: path.join(projectRoot, 'vite.config.ts'),
    server: { middlewareMode: true, hmr: { server: httpServer } },
    appType: 'spa',
  });
  app.use(vite.middlewares);
  app.use((error, _req, res, _next) => {
    vite.ssrFixStacktrace(error);
    console.error(error);
    if (res.headersSent) return;
    return res.status(error.status || 500).json({ error: apiErrorMessage(error) });
  });
  httpServer.listen(port, '0.0.0.0', () => console.info(`UniHub development server listening on ${port}.`));
  const shutdown = async () => { await vite.close(); httpServer.close(() => process.exit(0)); };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
} else {
  const staticDirectory = path.join(projectRoot, isVercel ? 'public' : 'dist');
  app.use(express.static(staticDirectory, { index: false, fallthrough: true }));
  app.get(/.*/, (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/_app/')) return next();
    return res.sendFile(path.join(staticDirectory, 'index.html'));
  });
  app.use((error, _req, res, _next) => {
    console.error(`Request failed: ${error instanceof Error ? error.message : 'unknown error'}`);
    if (res.headersSent) return;
    return res.status(error.status || 500).json({ error: apiErrorMessage(error) });
  });
  if (isMainModule) {
    const httpServer = http.createServer(app);
    httpServer.listen(port, '0.0.0.0', () => console.info(`UniHub server listening on ${port}.`));
    const shutdown = () => httpServer.close(() => process.exit(0));
    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
  }
}

export default app;

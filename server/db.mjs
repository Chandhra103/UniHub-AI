import mysql from 'mysql2/promise';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const databaseUrl = process.env.DATABASE_URL || process.env.DRIZZLE_DATABASE_URL;
let pool;

export function getPool() {
  if (!databaseUrl) throw new Error('Managed database connection is not configured.');
  if (!pool) {
    // The managed DSN supplies its connection/transport parameters; never log the DSN.
    pool = mysql.createPool(databaseUrl);
  }
  return pool;
}

export function parseJson(value, fallback = {}) {
  if (value && typeof value === 'object') return value;
  if (typeof value !== 'string' || value.length === 0) return fallback;
  try { return JSON.parse(value); } catch { return fallback; }
}

export async function getUserByOpenId(openId, executor = getPool()) {
  const [rows] = await executor.execute(
    `SELECT u.open_id, u.email, u.display_name, u.role, u.role_status,
            u.requested_role, u.profile_json, u.profile_visibility,
            m.organization_id, o.org_type, o.name AS organization_name,
            o.category AS organization_category, o.verification_status,
            o.profile_json AS organization_profile
       FROM unihub_users u
       LEFT JOIN unihub_organization_memberships m
         ON m.open_id = u.open_id AND m.membership_status = 'active'
       LEFT JOIN unihub_organizations o ON o.id = m.organization_id
      WHERE u.open_id = ?
      ORDER BY m.created_at ASC LIMIT 1`,
    [openId],
  );
  const row = rows[0];
  if (!row) return null;
  const user = {
    openId: row.open_id,
    email: row.email,
    displayName: row.display_name,
    role: row.role,
    roleStatus: row.role_status,
    requestedRole: row.requested_role || null,
    profile: parseJson(row.profile_json),
    profileVisibility: row.profile_visibility,
    organization: null,
  };
  if (row.organization_id) {
    user.organization = {
      id: row.organization_id,
      name: row.organization_name,
      category: row.organization_category,
      type: row.org_type,
      verificationStatus: row.verification_status,
      profile: parseJson(row.organization_profile),
    };
  }
  return user;
}

export async function runMigrations() {
  const connection = await getPool().getConnection();
  try {
    await connection.query(
      `CREATE TABLE IF NOT EXISTS unihub_schema_migrations (
        migration_id VARCHAR(120) NOT NULL PRIMARY KEY,
        applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
    );
    const directory = path.dirname(fileURLToPath(import.meta.url));
    const migrationDirectory = path.join(directory, 'migrations');
    const files = (await readdir(migrationDirectory)).filter((file) => file.endsWith('.sql')).sort();
    for (const file of files) {
      const [applied] = await connection.execute(
        'SELECT migration_id FROM unihub_schema_migrations WHERE migration_id = ?',
        [file],
      );
      if (applied.length) continue;
      const sql = await readFile(path.join(migrationDirectory, file), 'utf8');
      const statements = sql.split(/;\s*(?:\r?\n|$)/).map((statement) => statement.trim()).filter(Boolean);
      for (const statement of statements) await connection.query(statement);
      await connection.execute('INSERT IGNORE INTO unihub_schema_migrations (migration_id) VALUES (?)', [file]);
      console.info(`Applied additive database migration: ${file}`);
    }
  } finally {
    connection.release();
  }
}

export async function closePool() {
  if (!pool) return;
  await pool.end();
  pool = undefined;
}

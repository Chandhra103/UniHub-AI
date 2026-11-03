import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

const testDatabaseUrl = process.env.UNIHUB_TEST_DATABASE_URL;

test('MySQL migrations are repeatable and user profiles persist', { skip: !testDatabaseUrl }, async () => {
  const parsed = new URL(testDatabaseUrl);
  assert.ok(
    ['127.0.0.1', 'localhost', '::1'].includes(parsed.hostname),
    'UNIHUB_TEST_DATABASE_URL must point to a loopback-only test database; never use a shared/production database',
  );
  assert.equal(process.env.DATABASE_URL, testDatabaseUrl, 'DATABASE_URL must match the isolated test database URL');

  const { closePool, getPool, getUserByOpenId, runMigrations } = await import('../server/db.mjs');
  const { ensureUserForOAuth, updateUserProfile } = await import('../server/user-store.mjs');
  const openId = `ci-${randomUUID()}`;
  let pool;

  try {
    await runMigrations();
    await runMigrations();
    pool = getPool();

    for (const table of ['unihub_users', 'unihub_organizations', 'unihub_audit_log']) {
      const [rows] = await pool.execute(
        'SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?',
        [table],
      );
      assert.equal(rows.length, 1, `migration should create ${table}`);
    }

    const created = await ensureUserForOAuth({
      identity: { openId, email: 'ci-member@example.invalid', name: 'CI Member' },
      requestedRole: 'student',
    });
    assert.equal(created.user.openId, openId);
    assert.equal(created.user.role, 'student');
    assert.equal(created.user.roleStatus, 'active');

    const updated = await updateUserProfile(openId, {
      displayName: 'Updated CI Member',
      profile: { headline: 'MySQL persistence verified' },
    });
    assert.equal(updated.displayName, 'Updated CI Member');
    assert.equal(updated.profile.headline, 'MySQL persistence verified');

    const persisted = await getUserByOpenId(openId);
    assert.equal(persisted.email, 'ci-member@example.invalid');
    assert.equal(persisted.profile.headline, 'MySQL persistence verified');
  } finally {
    if (pool) {
      try { await pool.execute('DELETE FROM unihub_users WHERE open_id = ?', [openId]); } catch { /* Preserve the original failure if cleanup is unavailable. */ }
    }
    await closePool();
  }
});

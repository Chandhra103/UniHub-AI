import { closePool, runMigrations } from './db.mjs';

try {
  await runMigrations();
  console.info('Database migrations are up to date.');
} catch (error) {
  console.error(`Database migration failed: ${error instanceof Error ? error.message : 'unknown error'}`);
  process.exitCode = 1;
} finally {
  await closePool();
}

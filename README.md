# UniHub AI

UniHub AI is a React/Vite client served by an Express application. The server uses Manus OAuth for identity, MySQL for account/profile and organization persistence, and server-enforced role permissions. The SQL schema is versioned under `server/migrations/`.

## Run the full local stack

Requirements: Docker with the Compose plugin.

```sh
cp .env.example .env
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000). Compose starts MySQL 8.4, waits for its health check, runs `npm run db:migrate`, then starts the Vite/Express development server. The database is stored in the named `unihub_mysql_data` volume, outside the Git working tree, and is preserved by `docker compose down`.

The checked-in database passwords are local development defaults only. Do not use them in production. Set real Manus OAuth values in the ignored `.env` file if you want to exercise provider sign-in locally. Without those values, the login page explains that sign-in setup is missing; it does not create a fake or password-based account.

`docker compose down -v` deletes the local database volume and its data. Use it only when you intentionally want to reset your local database.

## Database and migrations

- Database engine: MySQL 8.4 for local development.
- Schema source: `server/migrations/*.sql`.
- Apply outstanding migrations: `npm run db:migrate` (Compose runs this before starting the app).
- The migration runner records completed migrations in `unihub_schema_migrations` and is safe to run again.

For production, use a separately managed MySQL database and store its `DATABASE_URL` in the hosting provider's server-side environment settings. GitHub contains schema and migration code, not live user records, database files, or credentials.

## Checks

```sh
npm ci
npm test
npm run build
npm audit
```

The MySQL persistence integration test runs when `UNIHUB_TEST_DATABASE_URL` and the matching `DATABASE_URL` point to an isolated loopback test database. GitHub Actions provisions a throwaway MySQL service for migrations and profile-persistence tests. Do not point this test variable at a shared or production database.

## Authentication requirements

Sign-in is Manus OAuth, not a local email/password system. The server needs `MANUS_PROJECT_ID`, `MANUS_JWT_SECRET`, `MANUS_OAUTH_PORTAL_URL`, `MANUS_OAUTH_API_URL`, and a reachable MySQL `DATABASE_URL`. Administrator bootstrap additionally requires `UNIHUB_ADMIN_EMAILS`. Keep these values out of Git and browser code. See [`docs/vercel-deployment.md`](docs/vercel-deployment.md) for hosting configuration and troubleshooting. No Vercel deployment is performed by this repository's CI workflow.

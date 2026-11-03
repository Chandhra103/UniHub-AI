# Deploying UniHub AI on Vercel

This repository keeps the existing React/Vite frontend and Express API. `index.mjs` exports the Express app using Vercel's Node entrypoint convention. The build copies the compiled SPA into `public/` so Vercel can serve its hashed frontend assets, `manus-routes.json`, and the brand mark. The Express app handles OAuth, authenticated APIs, the SPA route fallback, and `/_app/health`.

## Import and build

Import the connected GitHub repository from Vercel's New Project flow. Keep the repository root as the project root, use the Express framework preset, keep the configured `npm run build` build command, and deploy from `main` only when the main branch is ready for production. Vercel creates preview deployments for other branches.

A local build uses:

```sh
npm ci
npm run build
npm test
```

## Runtime configuration required for sign-in and database-backed workspaces

Add the following values to the Vercel project's server-side Production and Preview environments, then create a new deployment so the functions receive them:

- `MANUS_PROJECT_ID`
- `MANUS_JWT_SECRET`
- `MANUS_OAUTH_PORTAL_URL`
- `MANUS_OAUTH_API_URL`
- `DATABASE_URL`
- `UNIHUB_ADMIN_EMAILS` (only when administrator bootstrap is needed)

The project needs a MySQL endpoint reachable from Vercel. The managed Manus database URL and JWT signing secret are not exported by this repository or copied automatically to Vercel. Do not commit them, put them in browser code, or paste them into a source file. Verify that the target MySQL database has the additive `server/migrations/001_core.sql` migration applied before enabling sign-in. The migration is repeatable and only creates or updates its application schema/ledger; inspect the target database and take its normal backup before running it.

Vercel sets `VERCEL_URL` for each deployment. OAuth origin validation accepts its exact HTTPS host, as well as explicitly configured `UNIHUB_ALLOWED_ORIGINS`/`PUBLIC_APP_URL` values, the current Manus Preview origin, and local development origins. Add any custom production domain to `UNIHUB_ALLOWED_ORIGINS` as its exact origin (for example `https://unihub.example.com`). The callback URL is derived from the validated browser origin and uses `/api/auth/callback`.

Before declaring a Vercel deployment production-ready, verify the static route manifest, SPA deep links, `/_app/health`, Manus OAuth callback, CSRF-protected mutations, all role route permissions, and the configured MySQL migration against accounts explicitly authorized for the target project. Do not create test identities or application data in the shared production database as part of a smoke test.

## References

- [Express on Vercel](https://vercel.com/docs/frameworks/backend/express) — Express entrypoint and public static asset behavior.
- [Vercel project configuration](https://vercel.com/docs/project-configuration/vercel-json) — Node function `includeFiles` configuration.
- [Deploying Git repositories with Vercel](https://vercel.com/docs/git) — GitHub repository import and automatic deployment behavior.
- [Vercel environment variables](https://vercel.com/docs/environment-variables) — server-side runtime configuration and deployment refresh behavior.

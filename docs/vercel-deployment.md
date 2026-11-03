# Deploying UniHub AI on Vercel

This repository combines the existing React/Vite frontend with its Express API. The root `index.mjs` directly imports and creates an Express app, then mounts the existing application from `server/index.mjs`; this is the entrypoint detected by Vercel's Express preset. `vercel.json` pins that preset and runs `npm run build`. The build compiles the Vite app and synchronizes its output, `manus-routes.json`, and brand assets into `public/`. Vercel serves files in `public/` as static assets, while the Express application handles OAuth, authenticated APIs, SPA fallback routes, and `/_app/health`.

Do not add a `functions` pattern for the root `index.mjs`. Vercel's `functions` property is for matching function source files under `api/`, which is why a root pattern such as `"index.mjs"` fails with `unused_function`.

## Import and build

Import `Chandhra103/UniHub-AI` from Vercel with the repository root as the project root. The checked-in `framework: "express"` setting selects the Express preset even though the frontend is built with Vite. Keep the configured `npm run build` command. `package.json` pins the build/runtime Node major to `22.x`, which is supported by Vercel and avoids floating to the newest major from the previous `>=20.0.0` range.

The Vite build uses `esbuild@0.25.12`. The package manifest includes a version-pinned npm `allowScripts` approval for esbuild because npm 12 blocks unapproved dependency install scripts; this lets esbuild's required install step run without approving every dependency. If esbuild is upgraded, review and refresh that pinned approval.

A local production check uses:

```sh
npm ci
npm test
npm run build
npm audit
```

## Runtime configuration required for sign-in and database-backed workspaces

Add these values to the Vercel project's server-side Production and Preview environments, then create a new deployment so the function receives them:

- `MANUS_PROJECT_ID`
- `MANUS_JWT_SECRET`
- `MANUS_OAUTH_PORTAL_URL`
- `MANUS_OAUTH_API_URL`
- `DATABASE_URL`
- `UNIHUB_ADMIN_EMAILS` (only when administrator bootstrap is needed)

The project needs a MySQL endpoint reachable from Vercel. The Manus database URL and JWT signing secret are not exported by this repository or copied automatically to Vercel. Do not commit them, put them in browser code, or paste them into a source file. Verify that the target MySQL database has the additive `server/migrations/001_core.sql` migration applied before enabling sign-in. The migration is repeatable and only creates or updates its application schema/ledger; inspect the target database and take its normal backup before running it.

Vercel sets `VERCEL_URL` for each deployment. OAuth origin validation accepts its exact HTTPS host, as well as explicitly configured `UNIHUB_ALLOWED_ORIGINS`/`PUBLIC_APP_URL` values, the current Manus Preview origin, and local development origins. Add any custom production domain to `UNIHUB_ALLOWED_ORIGINS` as its exact origin (for example `https://unihub.example.com`). The callback URL is derived from the validated browser origin and uses `/api/auth/callback`.

Before declaring a deployment production-ready, verify the static route manifest, SPA deep links, `/_app/health`, Manus OAuth callback, CSRF-protected mutations, all role route permissions, and the configured MySQL migration against accounts explicitly authorized for the target project. Do not create test identities or application data in the shared production database as part of a smoke test.

## References

- [Express on Vercel](https://vercel.com/docs/frameworks/backend/express) — supported Express entrypoint locations and static asset behavior.
- [Vercel project configuration](https://vercel.com/docs/project-configuration/vercel-json) — framework presets and function patterns.
- [Unmatched function pattern error](https://vercel.com/docs/errors/error-list) — Vercel's requirements for the `functions` key.
- [Supported Node.js versions on Vercel](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions) — available Node.js majors and `engines.node` mapping.
- [npm install-script approvals](https://docs.npmjs.com/cli/v12/commands/npm-install-scripts/) — version-pinned dependency lifecycle-script approvals.
- [esbuild and npm 12 install scripts](https://github.com/evanw/esbuild/issues/4499) — the esbuild install-script behavior seen in the Vercel log.
- [Vercel environment variables](https://vercel.com/docs/environment-variables) — server-side runtime configuration and deployment refresh behavior.

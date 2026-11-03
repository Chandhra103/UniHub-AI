# UniHub AI — Role-Based Expansion Plan

## Product and implementation approach

Extend the existing React, TypeScript and Vite application in place; do not replace its scaffold, routes, reference-matched profile dashboard, mock opportunity content or established visual system. Add a Node server and the approved managed MySQL capability for real Manus account authentication, persistent account/profile data and server-enforced role permissions. Keep existing student-facing features working while replacing the single generic organization workspace route with nine genuinely distinct role experiences.

The role model is `student`, `job_seeker`, `college`, `company`, `recruiter`, `event_organizer`, `teacher_researcher`, `ngo_training`, and `admin`. Role is resolved from the server-side user record, never from a client-supplied role field or URL. Students and job seekers can complete self-service onboarding. Organization, recruiter and publishing roles are requested at onboarding and remain pending/restricted until verified by an administrator. Admin is never self-selectable; an exact server-side allowlist or existing authorized admin assignment is required. Every user has an independently stored profile; profile updates merge only supplied fields and cannot change the authenticated identity or privilege fields.

## Role experiences

Keep the existing Student home, opportunities, events, AI, learning, community, saved-items and rewards experiences under a student-only navigation model. Add distinct Job Seeker career search, applications, guidance and professional-profile pages. Provide separate workspaces for Colleges (student management, campus roles/events/programmes, engagement analytics), Companies (job/internship publishing, applicant pipeline and recruitment analytics), Recruiters (candidate search, shortlist, applicant management and activities), Event Organizers (event creation, registrations, participant roster and attendance/analytics), Teachers and Researchers (learning resources, research opportunities, academic events and community), NGOs and Training Organizations (programme publishing, participants, cohorts and engagement), and Admin (role/user verification, moderation queues and platform analytics). A shared card/button/modal vocabulary is acceptable; each role gets its own task order, data, route set, panels, actions and navigation—not a renamed copy of one dashboard.

## Authentication, permissions and persistence

Use the platform Manus OAuth flow (the default provider for this project), not an app-owned password system or fake Preview identity. Start OAuth with a one-time nonce bound to the initiating browser, a fixed in-app callback, and a single-use state value. Exchange codes and retrieve user identity only on the server using platform-injected values. Use the exact `webdev_app_session` cookie expected by Cloud Preview, validate HS256 signature, expiry and `appId` against `MANUS_PROJECT_ID`, then resolve `openId` and active account/role from MySQL. Set HTTP-only, `Secure; SameSite=None` cookies for HTTPS Preview; do not infer public origin from the internal proxied Host.

Use additive, idempotent schema migrations only; development, testing and published deployments share the managed database. Create normalized users, organizations/memberships, role requests, opportunities/applications, events/registrations, learning programmes/enrolments and audit/verification records. Each API endpoint authenticates first, checks the permitted role and scopes organization-owned queries by the authenticated user's active membership. Admin actions require an active admin record. A user cannot grant themselves admin, activate a pending organization, change ownership or read another user's private profile/application data. Profile updates lock/load the existing row, merge only allowlisted supplied fields, and preserve all omitted values.

## Project structure

- `src/App.tsx`, `src/main.tsx`: existing client router and bootstrap, extended with session loading, role-based route guards and post-login landing.
- `src/auth/`: session provider, sign-in, role onboarding and account-profile forms.
- `src/roles.ts`: canonical role definitions, route maps, menu definitions and client display metadata; server permissions remain authoritative.
- `src/role-dashboards/`: distinct student, job-seeker, college, company, recruiter, event-organizer, teacher/researcher, NGO/training and admin pages/workflows.
- `src/components.tsx`, `src/pages.tsx`, `src/profile.tsx`, `src/data.ts`, `src/styles.css`: preserve and reuse the established design primitives, existing student pages and frontend sample content; extract role content rather than duplicating a generic workspace.
- `server/index.mjs` and root `index.mjs`: Express API/health entry; Vite middleware in local development, container listener only when directly executed, and a default-export Express handler for Vercel.
- `server/auth.mjs`, `server/permissions.mjs`, `server/db.mjs`: OAuth/cookie/session logic, authorization checks, MySQL pool and request-scoped identity.
- `server/migrations/`: ordered, additive SQL schema with a migration ledger; no destructive migrations or test-account seed writes.
- `tests/`: isolated role-policy, route/menu, profile-merge and API authorization tests using fixture identities without writes to the shared managed database.
- `public/manus-routes.json`: source-derived browser page routes only, excluding API/callback/health endpoints.
- Root `Dockerfile`, `vercel.json`, build scripts and lockfile: preserve the existing Manus/container path and add Vercel's Express framework entry, public static asset synchronization, and reproducible build/test commands.

## Design decisions

- **Design Movement:** polished Indian student-services dashboard, following the supplied UniHub profile screen's restrained institutional product aesthetic.
- **Core Principles:** keep high-value student status visible; organize discovery by role-specific tasks; use consistent, calm data cards; make each role's primary next step obvious and permission-safe.
- **Color Philosophy:** preserve deep teal `#147C89` for trusted identity, navy for readable structure, cool pale gray behind white surfaces, orange for active sections/actions, and blue/green for navigation and positive progress. Organization dashboards share the system, not identical layouts.
- **Layout Paradigm:** retain the full-width teal masthead and icon-led white navigation; show a role-specific navigation rail/workspace canvas with each role's own information hierarchy and task panels, collapsing cleanly on smaller screens.
- **Signature Elements:** teal UniHub masthead with graduation-cap mark; orange selected navigation/action capsule; small tinted metric icons and subtle outlined white cards.
- **Interaction Philosophy:** controls sit beside the information they affect; every role sees only authorized actions; status/verification states are explicit; profile edits preserve unsupplied values.
- **Animation:** restrained transitions on tab changes, hover/focus, drawer entry and mobile navigation; no motion that obscures data, and honor reduced-motion preferences.
- **Typography System:** clean sans-serif family with strong navy weight contrast; compact interface labels and medium-weight section titles; retain the reference screenshot hierarchy and comfortable line height.
- **Brand Essence:** a practical opportunity, community and management hub for Indian students and the organizations supporting them; capable, encouraging, organized.
- **Brand Voice:** concise and momentum-focused. Examples: “Your next opportunity, all in one place.” “Keep your progress moving.”
- **Wordmark & Logo:** “UniHub AI” wordmark paired with a simple graduation-cap glyph and a restrained teal lockup.
- **Signature Brand Color:** deep teal `#147C89`.

## Material constraints and safety boundaries

Managed server and database enablement has been explicitly approved. The database is shared between Preview/development, testing and published operation. Use additive DDL and fixture-only tests; do not populate test users or run destructive writes against the shared database. OAuth must use the platform's injected runtime credentials; never expose those credentials in browser code. Do not claim nine live-account sign-ins unless separate real authorized Manus accounts are available. A role matrix/test harness can be exercised with isolated fixtures, while actual OAuth identities can be verified only by signing in with those real accounts. Any missing admin allowlist or test identity remains an explicit setup prerequisite, not a client-side bypass.

## Build and serving

Keep the existing Vite/React UI. Run one Node/Express process on the configured port, mounting Vite's middleware in development and serving `dist` in the Manus container; export the same Express handler for Vercel and sync compiled files into `public/` so Vercel can serve static assets. Provide authenticated APIs under `/api/` and unauthenticated `/_app/health`. Use the committed lockfile, honor `PORT` with 3000 as default, and preserve Preview iframe compatibility. Vercel requires a MySQL endpoint reachable from Vercel and server-side OAuth/session values configured independently; platform secrets/database values are not copied to the external host. Keep the route manifest synchronized. Build and role-policy checks run before checkpointing; any test that contacts MySQL is read-only unless the user separately approves an application operation.

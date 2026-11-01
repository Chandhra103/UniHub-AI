# UniHub AI — Implementation Plan

## Product and implementation approach

Build a responsive, frontend-only student opportunity and community application using React, TypeScript, and Vite in the initialized empty WebDev workspace. Use local mock data and React state/localStorage for demo interactions; do not enable or implement backend, database, account services, or remote persistence. Keep routes client-side and provide a static `/manus-routes.json` manifest. Organize shared shell, page modules, mock data, and UI primitives so that the many related destinations remain consistent without becoming duplicated generic pages.

The provided UniHub profile-status screen is the primary visual reference. Preserve the teal masthead and profile control, white category navigation with icon-led labels, light cool-gray page background, navy type, white cards with subtle borders/shadows, blue links/accents, and orange active Status/action treatments. The AICTE reference page is secondary context specifically for internship/opportunity discovery: carry over its warm cream/white surfaces, confident navy headings, orange search/action emphasis, and employer/program cards while keeping the UniHub navigation system. Other missing screen details will be interpreted through the user's named screen requirements and the primary screenshot's visual language rather than copied from an unrelated site.

### Route and content architecture

- `/login`: separate Student and Organization login panels with usable mock validation and role-aware entry.
- `/dashboard` and `/profile`: student home/profile overview, using the provided profile-status dashboard as the default home. Include profile identity, connections/followers/posts/rewards/status tabs, metrics, applications/interviews/offers, learning progress, earnings trend, skills, and achievements/recent wins.
- `/events`, `/events/festivals`, `/events/meetups`: event discovery with city search, interactive lightweight map/list selection, category/date filters, sorting, detail drawer and save/apply state.
- `/opportunities`, `/internships`, `/jobs`, `/hackathons`, `/scholarships`, `/courses`, `/government-portals`: opportunity hub with separate category data, search/filter/sort controls, organization context, detail views, bookmarks and frontend application actions.
- `/ai-tools`, `/ai-hub`: categorized student tools, tool cards and functional mock interactions.
- `/colleges`, `/organizations`: discovery and rich organization/college profile views.
- `/community`, `/posts`, `/connections`, `/messages`: feed, connections and messaging experiences with working local UI state.
- `/applications`, `/saved`, `/rewards`, `/notifications`, `/settings`: student workflow pages with filterable records, saved items, points/rewards, notification controls and settings forms.
- `/organization/college`, `/organization/company`, `/organization/events`, `/admin`: distinct dashboard views for colleges, companies, event organizers and administrators, each with role-specific summaries, tables and controls.

Use a shared header/profile toolbar, responsive category navigation, route-aware subnavigation, page title/action rows, and reusable but content-specific cards, filters, forms, tabs, tables, empty states, dialogs and drawers. Provide realistic India-focused sample organizations, locations, dates, stipends, eligibility, skills and application states. Local state will make search, filters, sorting, tab changes, dropdowns, modal forms, bookmarking, application actions, messaging, notification preferences and responsive navigation demonstrably functional.

## Project structure

- `src/main.tsx`, `src/App.tsx`: application bootstrap, route map and shared navigation.
- `src/components.tsx`: shared masthead, category navigation, responsive mobile navigation, buttons, cards, filters, badges, dialogs and form controls.
- `src/pages.tsx`: route-level login, student dashboard/profile, events, opportunities, discovery/community, student workflow, learning and organization/admin dashboards.
- `src/data.ts`, `src/types.ts`: typed mock data and shared action contracts for people, events, opportunities, courses, colleges, organizations, applications, rewards and messages.
- `src/styles.css`: global design tokens, layout, reusable components and responsive page styling.
- `public/manus-routes.json`, `public/assets/`: source-derived route manifest and profile/brand assets.
- `index.html`, `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`: Vite app entry, pinned dependencies and frontend build configuration.
- `plan.md`, `TODO.md`: approved scope/design and outcome tracking.

## Design decisions

- **Design Movement:** polished Indian student-services dashboard, following the supplied UniHub profile screen's restrained institutional product aesthetic.
- **Core Principles:** keep high-value student status visible; organize discovery by clear categories; use consistent, calm data cards; make primary next steps obvious and orange-accented.
- **Color Philosophy:** deep teal anchors identity and trust; navy supplies readable structure; cool pale gray recedes behind white information surfaces; bright orange signals the active section and the next action; blue and green support links and positive progress.
- **Layout Paradigm:** full-width masthead, horizontal icon-led category rail, then a spacious dashboard canvas with aligned metric tiles and balanced two-column analytical panels; collapse navigation and analytics cleanly on smaller screens.
- **Signature Elements:** teal UniHub masthead with graduation-cap mark; orange selected navigation/action capsule; small tinted circular metric icons and subtle outlined white cards.
- **Interaction Philosophy:** controls remain close to the content they affect, filters can be cleared, saved/applied states are visible, and drawers/dialogs keep discovery in context.
- **Animation:** restrained transitions on tab changes, hover/focus, drawer entry and mobile navigation; no motion that obscures data, and honor reduced-motion preferences.
- **Typography System:** use a clean sans-serif family with strong navy weight contrast; compact interface labels and medium-weight section titles; preserve the screenshot's clear hierarchy and comfortable line height.
- **Brand Essence:** a practical opportunity and progress hub for Indian students; capable, encouraging, organized.
- **Brand Voice:** concise and momentum-focused. Examples: “Your next opportunity, all in one place.” “Keep your progress moving.”
- **Wordmark & Logo:** “UniHub AI” wordmark paired with a simple graduation-cap glyph and a restrained teal lockup.
- **Signature Brand Color:** deep teal `#147C89`.

## Material constraints

The deliverable is a frontend prototype. Authentication and application flows are demonstrations only; saved data is browser-local and is not shared between users or devices. The provided screenshots are not a complete source for every requested route, so missing screen-specific details follow the named feature requirements while retaining the main screenshot's visual language. No claims of live map data, real listings, AI service execution, or external application submission will be made.

## Build and serving

Use a self-contained Vite build with locked dependencies and an output directory suitable for static frontend hosting. Serve the development preview on the initialized project port (3000), maintain a source-derived route manifest, run TypeScript/build checks, and verify the main dashboard, opportunities, events and login routes at desktop and a narrow viewport. No backend service or database is needed.

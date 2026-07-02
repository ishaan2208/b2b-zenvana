# b2b-partner

Partner-facing portal for travel agencies (Zenvana Hotels): shared agency login, transparent inventory, B2B rates (~10% below the public website), and bulk quote requests with tracking. Its goal is to give agencies a self-serve view of live rates/inventory and a quoting workflow — plus an internal "master" surface to onboard those agencies.

## Architecture & intent

- Next.js 14 App Router + TypeScript, Tailwind v3 (dark by default via `next-themes`), Radix + shadcn-style components, `react-hook-form` + zod, `@tanstack/react-table`. Dev server on port 3010.
- No local database, no Prisma — all data is REST against the sibling backend. **`src/lib/b2b-api.ts` is the single source of truth for backend calls** (native `fetch`, not axios). Base URL is `NEXT_PUBLIC_BACKEND_URL` with `/api/v1` appended automatically (prod: `https://api.staysystems.in`). Add new backend calls here, not inline in components.
- Zod schemas for login/quotes/vendor creation live in `src/lib/b2b-schemas.ts`; keep request shapes validated there.
- Route layout: `src/app/(auth)/` (login/register), `dashboard/`, `properties/` (rates + inventory), `quotes/` (list, new, `[id]/` detail with threaded comments), `master/` (internal admin), `api/` (thin route handlers).
- Key consumed routes: `POST /b2b/auth/login`, `GET /b2b/properties`, `GET /b2b/properties/:slug/rates-inventory`, `GET .../rate-sheet`, `GET/POST /b2b/quotes`, `PATCH /b2b/quotes/:id/status`, `POST /b2b/quotes/:id/comments`, `POST /b2b/master/login`.

## Boundaries

- **Two fully separate auth contexts** — do not merge or cross-wire them: partner session (`localStorage["b2b_partner_bearer_token"]`) and master-admin session (`localStorage["b2b_master_bearer_token"]`). Distinct JWTs, distinct localStorage keys, distinct helpers in `b2b-api.ts`. Requests send `Authorization: Bearer <token>` plus `credentials: "include"` as a cookie fallback.
- Partners authenticate with an **agency code** (not email) at `/login`; only master admin creates agencies at `/master/vendors`. Keep that asymmetry intact.
- B2B rates are intentionally below public/website rates — don't surface public pricing here or leak one agency's data to another.
- `NEXT_PUBLIC_BACKEND_URL` is required. Images are served from Cloudinary (`res.cloudinary.com`) and the backend host — both are whitelisted in `next.config.js`; add new image hosts there rather than bypassing `next/image`.

## Verify your work

- `pnpm lint` — `next lint` (ESLint + eslint-config-next) clean.
- `pnpm build` — production build must pass (type-checks the app).
- `pnpm dev` — serves on http://localhost:3010; verify the changed flow against a running backend, exercising **both** partner and master paths if auth or `b2b-api.ts` was touched.
- Standalone Next.js app (its own `package.json`/`node_modules`, not a Turbo workspace package) — run scripts directly here. Backend must be running (default `http://localhost:3000`, i.e. `NEXT_PUBLIC_BACKEND_URL`) for local dev.

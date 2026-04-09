# B2B Partner Portal

Standalone partner-facing app for travel agents.

## Features

- Shared agency login
- Property-level transparent inventory
- B2B rates at 10% below website rates
- Bulk requirement submission
- Quote tracking with timeline, comments, and partner status actions

## Run

- Backend: `pnpm dev` in `backend`
- Frontend: `pnpm dev` in `b2b-partner` (port `3010`)

Set frontend env:

`NEXT_PUBLIC_BACKEND_URL=http://localhost:3000`

## Demo Credentials

- Agency code: `demo-agency`
- Password: `demo1234`

If not seeded, run:

- `pnpm seed:b2b-demo` in `backend`

## Master admin (create partner accounts)

Set on the **backend** (same machine as the API):

- `B2B_MASTER_USERNAME` — internal admin username
- `B2B_MASTER_PASSWORD` — internal admin password

Then open the B2B app at **`/master/login`**, sign in, and use **Partner accounts** (`/master/vendors`) to create agencies. Partners use **agency code + password** on `/login` as usual.

Master routes (authenticated with the JWT returned from master login):

- `POST /api/v1/b2b/master/login`
- `GET /api/v1/b2b/master/session`
- `GET /api/v1/b2b/master/vendors` — list partners
- `POST /api/v1/b2b/master/vendors` — create partner

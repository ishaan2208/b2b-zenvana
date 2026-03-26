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

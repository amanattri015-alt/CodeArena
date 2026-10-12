# CodeArena Admin Panel

This version adds a production-style admin console to the existing React/Vite + Express/MongoDB project.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

## Backend

Use the Day04 backend:

```bash
cd backend
npm install
npm run dev
```

Backend: `http://localhost:3000`

Keep your existing `.env` with:

- `MONGO_URI`
- `JWT_KEY`
- `JDOODLE_CLIENT_ID`
- `JDOODLE_CLIENT_SECRET`
- `PORT`

Do not commit `.env`.

## Admin routes

- `/admin` — dashboard
- `/admin/problems` — problem management
- `/admin/problems/create` — create
- `/admin/problems/:id` — admin problem details
- `/admin/problems/:id/edit` — edit
- `/admin/users` — users
- `/admin/users/:id` — user details
- `/admin/submissions` — submissions
- `/admin/submissions/:id` — submission details

## Backend additions

The existing problem CRUD APIs are reused.

New admin APIs:

- `GET /admin/dashboard`
- `GET /admin/problems/:id`
- `GET /admin/users`
- `GET /admin/users/:id`
- `DELETE /admin/users/:id`
- `GET /admin/submissions`
- `GET /admin/submissions/:id`

All `/admin/*` APIs use the existing JWT cookie + `adminMiddleware`.

## First admin account

Your current architecture protects `/user/admin/register` with `adminMiddleware`, so the first admin must already be created/seated in MongoDB (or through your existing bootstrap process). Do not expose an unrestricted public admin-registration endpoint.

After an admin logs in, the `/user/check` response includes `role`, allowing the frontend to protect the admin routes.

## Important security improvement

Normal problem retrieval no longer returns hidden test cases or reference solutions. Those admin-only fields are served through `GET /admin/problems/:id`, protected by `adminMiddleware`.

## What is live-data driven

Dashboard counts and recent records are queried from MongoDB. Users and submissions are also queried from the backend. No dashboard statistics are hard-coded.

## Current limitation

The uploaded frontend dependency tree contains an incomplete Rolldown native optional dependency in `node_modules`, so the provided source cannot be build-verified inside this environment. Run `npm install` locally before `npm run build`; the source itself was checked and the backend JavaScript passes `node --check`.

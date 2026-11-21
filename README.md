# Business Journal

A multi-tenant web app that gives business owners full clarity on their business: revenue, profit, top products, expenses and stock tracking, in one place.

Built with **Next.js (App Router)**, **TypeScript**, **PostgreSQL**, **Prisma** and **Better Auth**.

> Status: early development. Authentication, business onboarding, role permissions and tenant isolation tests are done. Products, inventory, sales and the dashboard are next.

---

## Table of contents

1. [Features](#features)
2. [Tech stack](#tech-stack)
3. [Architecture](#architecture)
4. [Getting started](#getting-started)
5. [Environment variables](#environment-variables)
6. [Project structure](#project-structure)
7. [Scripts](#scripts)
8. [Database and migrations](#database-and-migrations)
9. [Testing](#testing)
10. [Roles and permissions](#roles-and-permissions)
11. [Coding standards](#coding-standards)
12. [Security rules](#security-rules)
13. [Contributing workflow](#contributing-workflow)
14. [Roadmap](#roadmap)
15. [Troubleshooting](#troubleshooting)

---

## Features

Done:

- Sign up, log in and log out with secure sessions
- Protected app area (dashboard) with a quick proxy redirect for signed-out visitors
- Business onboarding: name, currency and timezone
- Roles per business: owner, manager, cashier
- Central permission matrix and membership-checked access control
- Automated tests, including tenant isolation tests, running in CI

Planned: products and inventory (stock ledger), sales, expenses, dashboard and reports, settings and team invites, marketing site, email verification and password reset.

## Tech stack

| Area            | Choice                                              |
| --------------- | --------------------------------------------------- |
| Framework       | Next.js 16 (App Router, Cache Components), React 19 |
| Language        | TypeScript (strict)                                 |
| Styling         | Tailwind CSS                                        |
| Database        | PostgreSQL 16 (Docker for local development)        |
| ORM             | Prisma 7 (pinned, see Troubleshooting)              |
| Authentication  | Better Auth (email and password)                    |
| Validation      | Zod                                                 |
| Testing         | Vitest                                              |
| Code quality    | ESLint, Prettier, Husky, lint-staged, commitlint    |
| CI              | GitHub Actions                                      |
| Package manager | pnpm                                                |

## Architecture

The project is a **modular monolith**: one deployable app, split into feature modules.

```
UI (Server and Client Components)
        |
Server Actions / Route Handlers   -> validate input (Zod), authenticate
        |
Service layer                     -> business rules, permissions, transactions
        |
Repository / data layer           -> database queries, always scoped by businessId
        |
PostgreSQL
```

**Golden rules**

1. Dependencies point **downward only**. UI never touches the database.
2. Server actions are thin: validate, authenticate, call a service.
3. All business logic lives in **services**.
4. Repositories contain queries only, and tenant-owned queries always filter by business.
5. Modules are imported through their public API (`index.ts` or `components/`), never their internals.

**Tenant model.** A `Business` is the tenant boundary. A user can belong to several businesses through `Membership`, with a different role in each. The active business is remembered in a cookie that is only a hint: `requireBusinessAccess()` re-checks it against the user's real memberships on every request.

## Getting started

### Prerequisites

- Node.js 22 LTS or newer
- pnpm
- Docker (for local PostgreSQL)
- Git

### Setup

```bash
# 1. Clone
git clone <repo-url>
cd business-journal

# 2. Install dependencies (also generates the Prisma client)
pnpm install

# 3. Create your env file
cp .env.example .env.local
# then set BETTER_AUTH_SECRET (see below)

# 4. Start local PostgreSQL
pnpm db:up

# 5. Apply database migrations
pnpm db:migrate

# 6. Start the dev server
pnpm dev
```

Open http://localhost:3000, create an account at `/signup`, and set up your first business.

### Running in GitHub Codespaces

Open the app through the forwarded port URL (the Ports tab), not `localhost`. `next.config.ts` allows the Codespaces origin for server actions in development only.

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values. All variables are validated at startup in `src/core/env.ts`, and the app refuses to start if one is missing or invalid.

| Variable             | Description                                            |
| -------------------- | ------------------------------------------------------ |
| `APP_URL`            | Public base URL, e.g. `http://localhost:3000`          |
| `DATABASE_URL`       | PostgreSQL connection string                           |
| `BETTER_AUTH_SECRET` | Random secret (32+ characters) used to sign sessions   |
| `BETTER_AUTH_URL`    | Public base URL for auth, e.g. `http://localhost:3000` |

Generate a secret with:

```bash
openssl rand -base64 32
```

**Never commit `.env.local`.** Only `.env.example` (placeholders) and `.env.test` (local test values, no real secrets) are committed.

## Project structure

```
src/
  app/                        # Routing only. Keep pages thin.
    (auth)/                   # login, signup
    (app)/                    # protected area: dashboard, onboarding
    api/auth/[...all]/        # Better Auth route handler
  proxy.ts                    # Quick redirect for signed-out visitors (not the real security check)
  modules/                    # Feature modules
    auth/                     # sign up / log in / log out actions, schemas, forms
    businesses/               # onboarding, memberships, access control
      access.ts               # requireBusinessAccess(): the gatekeeper
      repository.ts           # database queries
      service.ts              # business rules
      actions.ts              # server actions
      schema.ts               # Zod schemas
      active-business.ts      # active business cookie (a hint, never trusted)
      index.ts                # public API of the module
  core/                       # Shared foundations
    auth/                     # auth.ts, session.ts (getCurrentUser, requireUser), permissions.ts
    db/client.ts              # Prisma client (server only)
    errors/                   # AppError, NotFoundError, ForbiddenError, UnauthorizedError
    env.ts                    # validated environment variables
    forms.ts                  # shared form state type
    money.ts                  # integer money helpers (grows with the sales phase)
  components/ui/              # shared UI pieces (field, select-field)
  generated/prisma/           # generated Prisma client (git-ignored)
prisma/
  schema.prisma               # data model
  migrations/                 # versioned migrations (committed)
tests/                        # Vitest tests and helpers
.github/workflows/ci.yml      # CI: quality checks and tests
docker-compose.yml            # local PostgreSQL
```

## Scripts

| Command                | What it does                                       |
| ---------------------- | -------------------------------------------------- |
| `pnpm dev`             | Start the dev server                               |
| `pnpm build`           | Production build                                   |
| `pnpm start`           | Run the production build                           |
| `pnpm lint`            | ESLint                                             |
| `pnpm typecheck`       | Generate Next types, then run the TypeScript check |
| `pnpm format`          | Format all files with Prettier                     |
| `pnpm format:check`    | Check formatting without changing files            |
| `pnpm test`            | Run the automated tests                            |
| `pnpm db:up`           | Start local PostgreSQL (Docker)                    |
| `pnpm db:down`         | Stop local PostgreSQL                              |
| `pnpm db:generate`     | Regenerate the Prisma client                       |
| `pnpm db:migrate`      | Create and apply a migration in development        |
| `pnpm db:studio`       | Open the Prisma database browser                   |
| `pnpm db:test:create`  | Create the test database (first time only)         |
| `pnpm db:test:migrate` | Apply migrations to the test database              |

## Database and migrations

- Every schema change is a **versioned migration** committed to the repo. Create one with `pnpm db:migrate --name short_description`, then run `pnpm db:generate`.
- Migrations must be **backward-compatible**: add columns before using them, remove them in a later release.
- Never edit a migration that has been merged.
- Conventions:
  - **Money is stored as integers** in the smallest currency unit. Never floats.
  - **Every tenant table has `businessId`** and an index that starts with it.
  - **Stock will be a ledger**: current stock is the sum of stock movements, never an overwritten number.
  - **Sale items snapshot price and cost** at the time of sale.
  - **Timestamps are UTC**; convert to the business timezone only for display.
  - Financial records are **soft-deleted**, not removed.

## Testing

Tests run with Vitest against a **separate** `business_journal_test` database, never your development data.

First-time setup:

```bash
pnpm db:up
pnpm db:test:create
pnpm db:test:migrate
```

Then run:

```bash
pnpm test
```

Safety: `tests/setup.ts` refuses to run if `DATABASE_URL` points at a database whose name does not end in `_test`.

What is covered today:

- **Permission matrix**: each role can do exactly what the matrix allows, and nothing more.
- **Tenant isolation**: a user can never reach another business, a forged `bj_business` cookie is ignored, roles apply per business, soft-deleted businesses are inaccessible, and signed-out visitors are blocked.

CI runs the same tests against a throwaway PostgreSQL on every pull request. New features are not complete without tests.

## Roles and permissions

All permissions live in one place: `src/core/auth/permissions.ts`.

| Role    | Can do                                                                  |
| ------- | ----------------------------------------------------------------------- |
| OWNER   | Everything, including updating the business and managing members        |
| MANAGER | Products, stock adjustments, sales (including voids), expenses, reports |
| CASHIER | View products and record sales                                          |

Protected pages and actions call `requireBusinessAccess("some:action")`, which checks the user's role in the active business and throws a `ForbiddenError` if the role is not allowed. Hiding a button is never the security check.

## Coding standards

- TypeScript `strict` mode; no `any` without a comment explaining why.
- Validate **all** external input with Zod on the server, even if the client validated it.
- Throw typed errors from `core/errors`; never return raw database errors to the client.
- Use cursor-based pagination for lists. Never load unbounded data.
- Prefer Server Components; add `"use client"` only where interactivity is needed.
- Code that reads cookies or headers must sit inside a `<Suspense>` boundary (Cache Components is enabled).
- Naming: `camelCase` for variables and functions, `PascalCase` for components and types, `kebab-case` for files and folders.
- Prettier and ESLint run automatically on commit.

## Security rules

These are non-negotiable:

1. **Authenticate and authorize in every server action and service**, not just in the UI or `proxy.ts`.
2. **Every tenant-owned query is scoped by the business** from `requireBusinessAccess()`. Never trust a business id typed by a user or read from a cookie.
3. **Never hand-roll password or session handling.** Use Better Auth.
4. Parameterized queries only. No SQL built from strings (the ORM handles this).
5. Never log passwords, tokens, secrets or full personal data.
6. Secrets live in environment variables, never in the repo.
7. Sensitive actions (stock adjustments, deletions, role changes) will write to an audit log.
8. Keep dependencies updated and review `pnpm audit` before releases.

Found a vulnerability? Do not open a public issue. Email **security@your-domain.com**.

## Contributing workflow

`main` is protected: changes go through a pull request, and both CI checks (`Format, lint, typecheck, build` and `Tests`) must pass before merging.

1. Update `main` and create a branch: `git checkout main && git pull && git checkout -b feat/short-description`. Use `feat/`, `fix/`, `chore/`, `docs/` or `test/`.
2. Confirm the branch with `git branch --show-current` before your first commit.
3. Make small, focused commits using [Conventional Commits](https://www.conventionalcommits.org/): `feat: add stock adjustment form`.
4. Run `pnpm format && pnpm lint && pnpm typecheck && pnpm test` locally.
5. Push and open a pull request with base `main`. Describe what changed, why, and how to test it.
6. Wait for green checks, then merge and run `git checkout main && git pull`.

**Definition of done:** works on mobile and desktop, has tests, handles loading, empty and error states, enforces permissions, is scoped to the active business, and has updated docs if behavior changed.

## Roadmap

| Phase | Name                   | Status  |
| ----- | ---------------------- | ------- |
| 0     | Discovery and planning | Done    |
| 1     | Foundation             | Done    |
| 2     | Auth and tenancy       | Done    |
| 3     | Products and inventory | Next    |
| 4     | Sales and expenses     | Planned |
| 5     | Dashboard and reports  | Planned |
| 6     | Settings and team      | Planned |
| 7     | Marketing site         | Planned |
| 8     | Hardening and beta     | Planned |
| 9     | Launch                 | Planned |

## Troubleshooting

| Problem                                                | Fix                                                                                                       |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| App will not start, env error                          | Compare `.env.local` with `.env.example`; the error names the missing variable                            |
| `Invalid Server Actions request` in Codespaces         | Open the app through the forwarded URL; confirm `allowedOrigins` is present in `next.config.ts`; restart  |
| `prisma generate` says it is a Prisma 7 command        | Prisma 8 got installed. Pin Prisma 7 packages (`prisma@7`, `@prisma/client@7`, `@prisma/adapter-pg@7`)    |
| pnpm reports ignored build scripts                     | Run `pnpm approve-builds` and select the Prisma packages                                                  |
| Tests fail with `relation "membership" does not exist` | The test database has no tables. Run `pnpm db:test:migrate`                                               |
| `Refusing to run tests`                                | `DATABASE_URL` in `.env.test` must point at a database ending in `_test`                                  |
| `LayoutProps` type not found                           | Run `pnpm typecheck` (it generates Next types first) or `pnpm build`                                      |
| Files from a feature are missing                       | Check `git branch --show-current`; the feature may be on another branch until its PR is merged and pulled |
| Port 3000 in use                                       | Run `pnpm dev -p 3001` and update `APP_URL` and `BETTER_AUTH_URL` to match                                |

## License

Proprietary. All rights reserved. Change this if you choose an open-source license.

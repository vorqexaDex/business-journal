# Business Journal

A multi-tenant web app that gives business owners full clarity on their business: revenue, profit, top products, expenses and stock tracking, in one place.

Built with **Next.js (App Router)**, **TypeScript**, **PostgreSQL** and **Tailwind CSS**.

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
10. [Coding standards](#coding-standards)
11. [Security rules](#security-rules)
12. [Contributing workflow](#contributing-workflow)
13. [Deployment](#deployment)
14. [Roadmap](#roadmap)
15. [Troubleshooting](#troubleshooting)

---

## Features

- Marketing site (landing, pricing, legal pages)
- Authentication: signup, login, logout, email verification, password reset
- Business onboarding and multi-user teams with roles (owner, manager, cashier)
- Dashboard: revenue, gross and net profit, top products, low-stock alerts
- Sales recording with automatic stock updates
- Product catalogue and inventory with a full stock ledger
- Expense tracking
- Reports with CSV/PDF export
- Settings: business profile, currency, timezone, team, account

## Tech stack

| Area                    | Choice                                           |
| ----------------------- | ------------------------------------------------ |
| Framework               | Next.js (App Router), React, TypeScript (strict) |
| Styling / UI            | Tailwind CSS, shadcn/ui                          |
| Database                | PostgreSQL                                       |
| ORM                     | Prisma (or Drizzle)                              |
| Auth                    | Auth.js / Better Auth                            |
| Validation              | Zod                                              |
| Forms / tables / charts | React Hook Form, TanStack Table, Recharts        |
| Cache / rate limiting   | Redis (Upstash)                                  |
| Background jobs         | Inngest or Trigger.dev                           |
| Email                   | Resend or Postmark                               |
| Monitoring              | Sentry, Pino logs                                |
| Testing                 | Vitest, Playwright                               |
| CI/CD                   | GitHub Actions                                   |

> Update this table if the team's final choices differ.

## Architecture

The project is a **modular monolith**: one deployable app, split into strict feature modules.

```
UI (Server/Client Components)
        ↓
Server Actions / Route Handlers   → validate input (Zod), authenticate
        ↓
Service layer                     → business rules, permissions, transactions
        ↓
Repository / data layer           → database queries, always scoped by businessId
        ↓
PostgreSQL
```

**Golden rules**

1. Dependencies point **downward only**. UI never touches the database.
2. Server actions are thin: validate, authenticate, call a service.
3. All business logic lives in **services**.
4. Repositories contain queries only, and every query requires a `businessId`.
5. Modules import other modules only through their public API, never their internals.

## Getting started

### Prerequisites

- Node.js 20 LTS or newer
- pnpm (recommended) or npm
- PostgreSQL 15+ (local install or Docker)
- Git

### Setup

```bash
# 1. Clone
git clone <repo-url>
cd business-journal

# 2. Install dependencies
pnpm install

# 3. Create your env file
cp .env.example .env.local

# 4. Start a local database (optional, using Docker)
docker run --name bj-postgres -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=business_journal -p 5432:5432 -d postgres:16

# 5. Run migrations and seed demo data
pnpm db:migrate
pnpm db:seed

# 6. Start the dev server
pnpm dev
```

Open http://localhost:3000.

The seed script creates a demo business with sample products, sales and expenses. Demo login credentials are printed in the terminal when seeding finishes.

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values. All variables are validated at startup in `src/core/env.ts`; the app will refuse to start if one is missing or invalid.

| Variable                    | Description                                    |
| --------------------------- | ---------------------------------------------- |
| `DATABASE_URL`              | Pooled PostgreSQL connection string            |
| `DIRECT_DATABASE_URL`       | Direct connection string, used for migrations  |
| `AUTH_SECRET`               | Random 32+ character secret for sessions       |
| `APP_URL`                   | Public base URL (e.g. `http://localhost:3000`) |
| `EMAIL_FROM`                | Sender address for transactional email         |
| `EMAIL_API_KEY`             | Email provider API key                         |
| `REDIS_URL` / `REDIS_TOKEN` | Cache and rate limiting                        |
| `SENTRY_DSN`                | Error tracking (optional in dev)               |

Generate a secret with: `openssl rand -base64 32`

**Never commit `.env*` files** (except `.env.example`).

## Project structure

```
src/
  app/                       # Routing only. Keep pages thin.
    (marketing)/             # Landing, pricing, legal
    (auth)/                  # Login, signup, reset password
    (app)/                   # Protected area (dashboard, sales, inventory...)
    api/                     # Webhooks and external endpoints only
  modules/                   # Feature modules (business logic lives here)
    sales/
      actions.ts             # Server actions
      service.ts             # Business rules and transactions
      repository.ts          # DB queries
      schema.ts              # Zod schemas and inferred types
      components/            # Module-specific UI
    inventory/ products/ expenses/ reports/ businesses/ users/
  core/                      # Shared foundations
    auth/                    # getCurrentUser, requireBusinessAccess, can()
    db/                      # Client and transaction helper
    errors/                  # AppError, NotFoundError, ForbiddenError
    logger/
    money.ts                 # Integer money helpers
    env.ts                   # Validated environment variables
  components/ui/             # Shared design system (shadcn/ui)
prisma/                      # Schema, migrations, seed
tests/                       # Integration and e2e tests
docs/                        # ADRs, diagrams, guides
```

## Scripts

| Command           | What it does                            |
| ----------------- | --------------------------------------- |
| `pnpm dev`        | Start the dev server                    |
| `pnpm build`      | Production build                        |
| `pnpm start`      | Run the production build                |
| `pnpm lint`       | ESLint (includes module boundary rules) |
| `pnpm typecheck`  | TypeScript check with no emit           |
| `pnpm test`       | Unit and integration tests              |
| `pnpm test:e2e`   | Playwright end-to-end tests             |
| `pnpm db:migrate` | Apply migrations in development         |
| `pnpm db:seed`    | Seed demo data                          |
| `pnpm db:studio`  | Open the database browser               |

## Database and migrations

- Every schema change is a **versioned migration** committed to the repo.
- Migrations must be **backward-compatible**: add columns before using them, remove them in a later release.
- Never edit a migration that has been merged.
- Key conventions:
  - **Money is stored as integers** in the smallest unit (kobo, cents). Never floats.
  - **Every tenant table has `businessId`** and an index starting with it.
  - **Stock is a ledger**: current stock is the sum of `StockMovement` rows, never an overwritten number.
  - **Sale items snapshot price and cost** at the time of sale.
  - **Timestamps are UTC**; convert to the business timezone only for display.
  - Financial records are **soft-deleted**, not removed.

## Testing

- **Unit tests** (Vitest): services, money math, profit and stock calculations.
- **Integration tests**: services and repositories against a real test PostgreSQL database.
- **E2E tests** (Playwright): signup → create business → add product → record sale → view dashboard.
- **Required tenant isolation tests**: a user from business A must never read or write business B's data.

New features are not complete without tests. CI blocks merging if tests fail.

## Coding standards

- TypeScript `strict` mode; no `any` without a comment explaining why.
- Validate **all** external input with Zod on the server, even if the client validated it.
- Throw typed errors from `core/errors`; never return raw database errors to the client.
- Use cursor-based pagination for lists. Never load unbounded data.
- Prefer Server Components; add `"use client"` only where interactivity is needed.
- Use named exports for modules, default exports only where Next.js requires them.
- Naming: `camelCase` for variables and functions, `PascalCase` for components and types, `kebab-case` for file and folder names.
- Formatting is handled by Prettier; linting by ESLint. Pre-commit hooks run both.

## Security rules

These are non-negotiable:

1. **Authenticate and authorize in every server action and service**, not just in the UI or proxy/middleware.
2. **Every query is scoped by `businessId`.** Use the repository helpers; never write unscoped queries.
3. **Never hand-roll password or session handling.** Use the auth library.
4. Parameterized queries only. No SQL built from strings.
5. Never log passwords, tokens, secrets or full personal data.
6. Secrets live in environment variables, never in the repo.
7. Rate-limit login, signup and password reset.
8. Sensitive actions (stock adjustments, deletions, role changes) write to the audit log.
9. Run `pnpm audit` before releases and keep dependencies updated.

Found a vulnerability? Do not open a public issue. Email **security@your-domain.com**.

## Contributing workflow

1. Pick a ticket from the board and create a branch: `feat/short-description`, `fix/short-description` or `chore/short-description`.
2. Make small, focused commits using [Conventional Commits](https://www.conventionalcommits.org/): `feat: add stock adjustment form`.
3. Run `pnpm lint && pnpm typecheck && pnpm test` locally.
4. Open a pull request with: what changed, why, how to test, and screenshots for UI changes.
5. CI runs and a preview deployment is created automatically.
6. At least one reviewer approves. Squash and merge into `main`.

`main` is protected: no direct pushes, CI must pass, and at least one approval is required.

**Definition of done:** works on mobile and desktop, has tests, handles loading/empty/error states, enforces permissions, is scoped by `businessId`, and has updated docs if behavior changed.

## Deployment

| Environment | Branch      | Database       | Notes                  |
| ----------- | ----------- | -------------- | ---------------------- |
| Local       | any         | local Postgres | `.env.local`           |
| Preview     | PR branches | staging DB     | auto-deployed per PR   |
| Staging     | `main`      | staging DB     | auto-deployed on merge |
| Production  | release tag | production DB  | manual approval        |

- Migrations run as a deployment step **before** the new app version goes live.
- Production has automated backups with point-in-time recovery. Restore drills are run before launch and quarterly after.
- Monitor errors in Sentry and uptime through the status monitor. See `docs/runbook.md` for incident steps.

## Roadmap

The project is delivered in phases: Foundation → Auth and tenancy → Products and inventory → Sales and expenses → Dashboard and reports → Settings and team → Marketing site → Hardening and beta → Launch → Growth.

See the full roadmap document for goals, deliverables and exit criteria for each phase.

## Troubleshooting

| Problem                               | Fix                                                                            |
| ------------------------------------- | ------------------------------------------------------------------------------ |
| App won't start, env error            | Compare `.env.local` with `.env.example`; the error names the missing variable |
| `Too many connections`                | Use the pooled `DATABASE_URL` and the pooler's connection limit settings       |
| Migration fails locally               | Reset with `pnpm db:reset` (this wipes local data)                             |
| Types out of date after schema change | Run `pnpm db:generate`                                                         |
| Port 3000 in use                      | Run `pnpm dev -p 3001`                                                         |

## License

Proprietary. All rights reserved. (Change this if you choose an open-source license.)

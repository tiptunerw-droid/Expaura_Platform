<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Expaura Platform — Agent Guide

Restaurant platform for Rwanda: digital menus, QR access, reviews/complaints, analytics, subscriptions, and an admin portal. Built with **Next.js 16.2, React 19, TypeScript (strict), Tailwind CSS v4, Prisma 7 (PostgreSQL), Vitest, ESLint 9** — App Router only.

## Critical version-specific rules (this repo, not your training data)

- **There is NO `middleware.ts`.** Next 16 renamed middleware to Proxy. Route protection lives in `proxy.ts` at the repo root. Never create `middleware.ts`.
- **All request APIs are async:** `await cookies()`, `await headers()`. `params` in pages are `Promise<>` and must be awaited (`const { code } = await params`).
- **Do NOT import from `@prisma/client`.** The generated client lives at `generated/prisma/` and is imported as `@/generated/prisma/client` (git-tracked). Regenerate after schema changes with `npx prisma generate`.
- **Server Actions are NOT colocated in pages.** They all live in `lib/actions/*.ts`, each file starting with `"use server";`. Client sub-components import and call them directly.
- Consult `node_modules/next/dist/docs/01-app/02-guides/` (server-actions, forms, authentication) before writing new patterns.

## Commands

```bash
npm run dev        # Next dev server (localhost:3000)
npm run build      # production build (also type-checks)
npm run lint       # ESLint 9 (flat config: eslint.config.mjs)
npm test           # Vitest (vitest run)
```
Husky runs `npm test` on pre-commit and `lint + test + build` on pre-push. GitHub Actions (`.github/workflows/ci.yml`) runs lint → test → `prisma db push` → build.

Rules: run `npm run lint` and `npm test` (and `npm run build` when feasible) after any change. Never commit code that fails lint/tests. Never commit `*.pem`, `.env`, or secrets.

## Environment variables

Set in root `.env` (gitignored — never commit it; values never go in code or AGENTS.md):
`DATABASE_URL`, `DATABASE_POOL_MAX`, `JWT_SECRET`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME`.

- `NEXT_PUBLIC_*` vars are exposed to the browser; everything else is server-only.
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` exists in `.env` but is unused — do not build on it.
- **Never hardcode secret fallbacks in code.** Some files currently contain a fallback JWT secret (`expaura_super_secret_jwt_key_change_in_production_2026`) — replace pattern usage with `process.env.JWT_SECRET` when touching them. Require `JWT_SECRET` and `DATABASE_URL` to be set; do not invent new secrets in source.

## Architecture map

- `app/` — routes. Public: `/`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/accept-invite`, `/terms`, `/privacy`, `/pricing`, `/features`, `/directory/[city]`, `/r/[slug]` (public restaurant), `/q/[code]` (QR redirect → `/r/[slug]?tab=menu&source=qr`).
- `app/dashboard/` — owner/manager area; `app/admin/` — super-admin portal; both have `layout.tsx`, `error.tsx`, `loading.tsx`.
- `app/api/` — JSON endpoints: `auth/*`, `staff/*`, `cities`, `seed`.
- `components/ui/` — hand-rolled primitives (shadcn-style, `cva` + `cn()`; **no Radix**, no shadcn CLI). Feature folders: `dashboard/`, `public/`, `site/`, `auth/`, `signature/`, `theme/`.
- `lib/` — `actions/` (all server actions), `auth/` (session, password, permissions, rbac), `email/`, `prisma.ts`, `errors.ts`, `rate-limit.ts`, `upload.ts`, `utils.ts`.
- `prisma/` — `schema.prisma` + raw SQL in `prisma/migrations/` (no timestamped migration folders; use `prisma db push` locally, `seed.ts` for baseline data).
- `public/` — static assets only; images are remote (Cloudinary/Unsplash), permitted by `next.config.ts` `remotePatterns`.
- `.next/dev/types/routes.d.ts` gives typed routes (Next 16 default).

## Conventions to follow

- **Naming:** PascalCase components (`InviteStaffDialog.tsx`), kebab-case route dirs, camelCase `lib/` files.
- **Path alias:** always `@/` (maps to repo root).
- **Server actions** (`lib/actions/`): validate with a zod schema defined inline atop the file; use `schema.safeParse(input)`, then `throw new Error(valid.error.issues[0]?.message || "Validation failed")`; authenticate via `getSession()` + `requirePermission(...)` from `@/lib/auth/permissions`; log failures with `console.error("[Area] ...", e)`; use `errors.*` (`@/lib/errors`, AppError) instead of raw `new Error("Unauthorized")`.
- **API routes** (`app/api/`): validate then return `{ error, details }` with `NextResponse.json(..., { status: 400 })`; wrap handlers in try/catch → `500 { error: "Internal server error." }`.
- **Prisma:** snake_case `@@map` tables/`@map` columns, UUID ids, `@db.Uuid`; queries via `prisma` from `@/lib/prisma.ts` (driver adapter + `withDbRetry`); validate `z.string().uuid()` before lookups; wrap analytics queries in React `cache()`.
- **Auth:** custom JWT-session, cookie `expaura_session` (httpOnly, sameSite=lax, secure in prod, 10-min expiry) via `lib/auth/session.ts` (jose HS256 — `JWT_SECRET`). RBAC: 17 permission codes in `lib/auth/permissions.ts`; roles Owner/Manager/Viewer; DB-backed roles in `lib/auth/rbac.ts`; use `requirePermission` server-side and `components/auth/rbac-guard.tsx` client-side. Route guards: `proxy.ts` (protects `/admin`, `/dashboard`, redirects authed users from `/login|/register`, and **destroys SUPER_ADMIN sessions outside admin/dashboard**), plus belt-and-suspenders checks in `dashboard/layout.tsx` and `admin/layout.tsx`. Log privileged actions with `prisma.auditLog.create({ action, entity, entityId, changes })`.
- **Rate limiting:** public submissions (reviews, complaints, QR generation) go through `enforceRateLimit` / `enforceContentAnomaly` from `@/lib/rate-limit`. Keep adding limits to any new public write path.
- **Cache invalidation:** after mutations call `revalidatePath(...)` (e.g. `revalidatePath("/", "layout")` after notifications).
- **Styling & UI:** Tailwind v4 CSS-first theme (design tokens: ceramic/ink/ember/herb/brass/rose), `cn()` from `@/lib/utils`; use `cva` variants for component primitives; dark mode via `.dark` class + `theme-provider.tsx`.
- **Helpers in `@/lib/utils`:** `formatCurrencyRwf`, `formatDate`, `formatRelative`, `isRestaurantOpen`, `cxColorForRating`.
- **No toast library exists.** Follow existing patterns: inline `<p className="text-rose-*">` errors, red banner divs, success-state swaps inside dialogs. Match `components/ui/*` primitives; do not add Radix or external UI deps without explicit OK.
- **Redirects:** server-side via `redirect()` (next/navigation); client-side `router.push(...)` + `router.refresh()`; login redirects carry `callbackUrl` (handled in `proxy.ts`).
- **Plan gating:** dashboard nav and features are gated by plan features (`getManagerPlanFeatures`, `feature-lock.tsx`, `upgrade-gate.tsx`). Don't bypass gating.

## Touching data

- Understand the Prisma schema first: 18 models (User, City, Restaurant, Permission, Role, RolePermission, RestaurantStaff, Plan, Subscription, Branch, MenuImage, Gallery, Employee, QrCode, Review, ComplaintCategory, Complaint, Notification, AuditLog). There is no separate menu/menu-item model — digital menu = `MenuImage` entries per restaurant. Big relation changes belong in conversations with the owner.
- Before destructive updates/migrations: confirm current HEAD is clean, note it, and prefer additive changes. Keep `.env` untouched unless asked.
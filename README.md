# BORJSS — Frontend

**Blue Ocean Research Journal for Social Sciences** — scholarly publishing platform frontend.

Next.js (App Router) · TypeScript · Tailwind CSS.

## Getting started

```bash
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:3000

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |

## Structure

```
src/
├── app/
│   ├── (marketing)/     Public reader-facing site (home, issues, articles, policies…)
│   ├── (auth)/          Login / register / password flows
│   ├── (dashboard)/     Authenticated editorial app (author, reviewer, editor, admin)
│   └── api/             trpc · oai (OAI-PMH) · webhooks · revalidate
├── components/
│   ├── ui/              Primitives (button, …) — add shadcn/ui here
│   ├── layout/          Header, footer, nav, sidebar, page-shell
│   └── {marketing,article,submission,editorial,review,dashboard}/
├── config/
│   ├── site.config.ts   Journal identity (name, ISSN, contact, DOI prefix)
│   ├── roles.ts          Roles + permission matrix (enforce server-side too)
│   └── nav.config.ts     Public nav + role-aware dashboard nav
├── lib/
│   ├── api/              Server data access (currently mock — swap for tRPC/DB)
│   ├── auth/             Session + route guards (currently stubbed)
│   ├── seo/              Google Scholar meta tags + schema.org JSON-LD
│   ├── validation/       Shared Zod schemas
│   └── utils/            cn(), formatDate(), absoluteUrl()
├── styles/globals.css   Design tokens (light/dark) + Tailwind layers
├── types/               Domain types (Article, Issue, Contributor, …)
└── middleware.ts        Dashboard route protection (stub)
```

## What is real vs. stubbed

**Real:** routing, layouts, navigation, design tokens, role/permission model,
article landing page (metadata, citation meta tags, JSON-LD), sitemap/robots.

**Stubbed — wire to the backend next:**

- `lib/api/*` returns `lib/api/mock-data.ts`. Replace with tRPC / DB calls.
- `lib/auth/*` returns a mock user. Replace with Auth.js / Supabase.
- `middleware.ts` redirect is commented out so the dashboard is browsable.
- `app/api/*` routes are placeholders (tRPC router, OAI-PMH, Crossref webhook).

## Backend integration checklist

- [ ] PostgreSQL + Prisma schema mirroring `src/types`
- [ ] Auth.js (or Supabase Auth) + session in `lib/auth/current-user.ts`
- [ ] tRPC routers mounted at `app/api/trpc/[trpc]/route.ts`
- [ ] File storage (S3 / R2) for manuscript uploads
- [ ] BullMQ + Redis worker (email, DOI deposit, reminders)
- [ ] JATS XML production pipeline
- [ ] Crossref deposit XML serializer + `app/api/webhooks/crossref`
- [ ] OAI-PMH provider in `app/api/oai/route.ts`
- [ ] `POST /api/revalidate` called on publish
- [ ] Zenodo deposit for preservation

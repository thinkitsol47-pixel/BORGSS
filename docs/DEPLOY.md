# Deploying to Vercel

The frontend deploys as a standard Next.js app. There is no database, no auth
provider and no mail provider, so there is nothing to provision alongside it —
the only required setting is the site URL.

---

## Once, before the first deploy

### 1. Put the code in a git repository

There is no `.git` directory in this project yet. Vercel deploys from a
repository, so create one and push it:

```bash
git init
git add .
git commit -m "BORJSS frontend"
git branch -M main
git remote add origin https://github.com/<you>/borjss.git
git push -u origin main
```

`.gitignore` is already correct: `node_modules`, every `.next-build*`
directory, `.env`, `.vercel` and the scratch tsconfigs are excluded. **Check
that no `.env` file is committed** — `.env.example` is meant to be, a real
`.env` is not.

### 2. Import the project

On vercel.com: **Add New → Project**, pick the repository. Vercel detects
Next.js and needs no build-command override — `package.json` already has
`build`, and `vercel.json` names the framework explicitly.

### 3. Set one environment variable

| Name | Value | Environments |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://your-domain.com` | Production |

This is the one that matters. It feeds `metadataBase`, every canonical URL,
`sitemap.xml` and `robots.txt`. Without it those all point at
`http://localhost:3000` — the sitemap will list localhost URLs and search
engines will ignore the lot.

For Preview deployments, either leave it unset (previews are `noindex` by
default on Vercel) or set it to the preview URL.

Everything else in `.env.example` is for the backend that does not exist yet.
Adding empty values now does nothing; add each one when the service behind it
is real.

---

## What is already configured

**`vercel.json`** sets security headers on every response — `nosniff`, a
referrer policy, `SAMEORIGIN` framing, a permissions policy that switches off
camera, microphone, geolocation and FLoC, and HSTS. It also caches
`/fonts/*` for a year, which is safe because the font files are
content-addressed and never change in place.

The region is `bom1` (Mumbai), the closest Vercel region to Pakistan and to the
journal's likely readership. Change it in `vercel.json` if that assumption is
wrong.

**`.nvmrc`** and `engines` in `package.json` pin Node 20+, so a future change
to Vercel's default cannot move the runtime under a deploy that was working.

**`distDir` is `.next-build`, not `.next`.** This is a local development
concern — two dev servers sharing one build directory corrupt each other — and
Vercel handles it without configuration. Do not set `BORJSS_DIST_SUFFIX` in
Vercel's environment variables; it exists only for throwaway local servers.

---

## What changes in production, and why

Three things behave differently once `NODE_ENV` is `production`. All three are
guarded on the build mode itself rather than on a comment someone has to
remember to remove.

| Development | Production |
|---|---|
| Demo accounts sign you in as any role | Sign-in authenticates nobody, and the demo panel is not rendered |
| `borjss_dev_role` cookie selects the current role | The cookie is ignored; the mock user is always author + reviewer + sectionEditor |
| Every portal route is browsable | Same — but `robots.txt` disallows them and both non-public layouts send `noindex` |

**That last row is the one to be clear about: the deployed site has no
authentication.** Every portal screen is reachable by anyone who types the URL.
`robots.txt` and `noindex` keep them out of search results; they are not access
control and were never meant to be.

That is fine for a preview or a client review. It is **not** fine for a public
launch. Before real manuscripts exist, the middleware redirect in
`src/middleware.ts` has to be uncommented and a real session put behind
`getCurrentUser()`.

If the deployment needs to be private in the meantime, use Vercel's own
protection: **Project → Settings → Deployment Protection → Vercel
Authentication**, which puts the whole site behind a Vercel login. That is a
real gate; the meta tags are not.

---

## Verifying a deploy

```bash
curl -s https://your-domain.com/robots.txt          # portal + auth disallowed
curl -s https://your-domain.com/sitemap.xml | grep -c '<loc>'   # 58 URLs, no localhost
curl -s https://your-domain.com/login | grep -c 'Demo accounts' # 0
```

Then open `/admin/users` — it should redirect to `/dashboard`, because the
production mock user is a section editor and holds no admin permission.

---

## Testing a production build locally

Never run an unsuffixed build while a dev server is running; both write to
`.next-build` and the survivor gets a corrupted directory.

```bash
BORJSS_DIST_SUFFIX=check npx next build
BORJSS_DIST_SUFFIX=check npx next start -p 3101
# then always:
rm -rf .next-build-check
```

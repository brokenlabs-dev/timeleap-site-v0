# TimeLeap — Public Portal

A self-hosted Notion-to-website renderer for the TimeLeap EU grant-transparency portal by Broken Egg Labs.

- **Public landing page** (`/`) — Timeleap branding, hero image, link to the portal
- **Reporting Portal** (`/portal`) — Login-protected; renders the real Notion page tree

---

## Quick Start

### 1. Clone & install
```bash
git clone <repo>
cd timeleap-site-v0
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env — fill in DATABASE_URL, NEXTAUTH_SECRET, etc.
```

### 3. Database setup (local)
For local dev you can use a free [Neon](https://neon.tech) database or a local Postgres:
```bash
npx prisma migrate dev --name init
npx tsx prisma/seed.ts   # creates the admin user from SEED_ADMIN_USERNAME / SEED_ADMIN_PASSWORD
```

### 4. Run dev server
```bash
npm run dev
# → http://localhost:3000
```

---

## Point at a different Notion page

Change `ROOT_PAGE_ID` in your `.env` to any publicly-shared Notion page ID (the 32-char hex part of the URL).

---

## Adding portal users

```bash
# Set env vars, then run:
SEED_ADMIN_USERNAME=alice SEED_ADMIN_PASSWORD=securepass npx tsx prisma/seed.ts
```

Or connect to your database directly and insert into the `User` table with a bcrypt-hashed password.

---

## Theming & branding

Edit `theme/config.ts`:
```ts
export const theme = {
  siteName: 'TimeLeap',
  siteTagline: 'Grant Transparency Portal',
  logoUrl: '',            // path to /public/logo.png, or leave empty
  accentColor: '#0057FF',
  footerLine: 'A Broken Egg Labs project · Co-funded by PT2030 / ANI',
  ogImage: '',
}
```

Place your logo at `public/logo.png` and set `logoUrl: '/logo.png'`.

---

## Deploy to Vercel

1. Push this repo to GitHub
2. Import in [Vercel](https://vercel.com/new) — it auto-detects Next.js
3. Add environment variables in Vercel dashboard (copy from `.env.example`)
4. Provision a **Neon Postgres** database: Vercel dashboard → Storage → Neon → Connect
5. After first deploy, run the migration:
   ```bash
   # Locally, with your Vercel DATABASE_URL set:
   npx prisma migrate deploy
   npx tsx prisma/seed.ts
   ```
6. To revalidate cached pages after Notion edits:
   ```bash
   curl -X POST https://your-vercel-url.vercel.app/api/revalidate \
     -H "Content-Type: application/json" \
     -d '{"secret":"<REVALIDATE_SECRET>","slug":"optional-page-slug"}'
   ```

---

## Deploy to Hetzner VPS (Docker)

```bash
# Build
docker build -t timeleap-site .

# Run (set all env vars)
docker run -d -p 3000:3000 \
  -e DATABASE_URL=... \
  -e NEXTAUTH_SECRET=... \
  -e NEXTAUTH_URL=https://timeleap.brokenegg.io \
  -e ROOT_PAGE_ID=37a3524f-4759-80e7-81ca-e4f252f03d74 \
  -e REVALIDATE_SECRET=... \
  --name timeleap-site \
  timeleap-site
```

---

## Known gaps / what's not done yet

- **Image blocks** — rendered as `[image]` placeholder; file hosting needed for full images
- **Admin UI** — no web UI for creating/managing users; use the seed script or direct DB access
- **Access log viewer** — logs are written to DB but there's no viewer UI yet
- **OG image generation** — `/og` route not implemented; set `ogImage` in `theme/config.ts` manually
- **Dark mode** — not implemented (branding TBD)
- **Notion database blocks** — only page trees are supported; full database views not rendered

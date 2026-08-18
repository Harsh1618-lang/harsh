# Harsh Dev — Premium Creator Platform

Next.js 16 + PostgreSQL (Drizzle ORM) full-stack site: portfolio, courses, apps
store, music player, donations, admin panel, and an AI chat widget.

## 1. Install dependencies

```bash
npm install
```

## 2. Configure environment variables

```bash
cp .env.example .env
```

Then edit `.env`:

- `DATABASE_URL` — **required**. A PostgreSQL connection string. Free options:
  [Neon](https://neon.tech), [Supabase](https://supabase.com), or a local
  Postgres instance.
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` — optional, default to `admin` /
  `admin123`. Change these before deploying publicly (or just change the
  password from inside the Admin Panel after first login, which stores it in
  the database instead).
- `ADMIN_SESSION_SECRET` — optional but **recommended for production**. Signs
  admin login tokens (see `src/lib/auth.ts`). Falls back to a value derived
  from `ADMIN_PASSWORD` if unset. Generate one with `openssl rand -hex 32`.
- `GROQ_API_KEY` / `OPENAI_API_KEY` / `GEMINI_API_KEY` / `OPENROUTER_API_KEY`
  — optional. The AI chat widget works without any of these (free
  DuckDuckGo + Wikipedia search). Add any one key to enable LLM-quality
  answers on top of that search.

## 3. Push the database schema

```bash
npm run db:push
```

This creates all tables (`profiles`, `courses`, `apps`, `music`, `donations`,
etc.) defined in `src/db/schema.ts`. Demo/seed data is inserted automatically
the first time each section's API route is hit (see `src/lib/seed-data.ts`),
so no separate seed command is needed.

## 4. Run it

```bash
npm run dev        # local development, http://localhost:3000
npm run build       # production build
npm start           # run the production build
```

Open the site, click the logo 3 times to reveal the admin unlock screen, and
log in with the admin credentials from step 2.

## Notes / known limitations

- **Donations: Razorpay payments are now really verified.** The "Razorpay /
  Cards" option creates a real Razorpay Order (`/api/donations/order`), runs
  Razorpay's actual checkout.js, and only marks a donation `confirmed` after
  server-side HMAC signature verification (`/api/donations/verify`) backed
  up by a webhook (`/api/donations/webhook`) — see `src/lib/razorpay.ts` for
  details. Requires `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` /
  `RAZORPAY_WEBHOOK_SECRET` in `.env`; without them it returns a clear error
  instead of faking success. The **UPI QR / ID** option is still
  self-reported (real money moves via the user's UPI app, but there's no
  programmatic confirmation) and is labelled "Unverified" on the Wall of
  Supporters accordingly, vs a "Verified" badge on real Razorpay payments.
- **Admin API routes require login.** All admin-only write endpoints
  (courses, apps, music, settings, profile, social links, resume, uploads,
  contact messages) now require a valid signed session token issued by
  `/api/admin/login`, checked via `requireAdmin()` in `src/lib/auth.ts`.
- **Uploaded files: local disk by default, Cloudinary if configured.** With
  no Cloudinary env vars set, files are stored on local disk (`/storage`,
  served via `/api/files/[...path]` — see `src/lib/storage.ts`). This works
  on a normal server or VM, but on **ephemeral/serverless hosts (e.g.
  Vercel)** the filesystem resets on every deploy/restart, so uploaded
  avatars, backgrounds, and resume PDFs would be lost. Set
  `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`
  (see `.env.example`, free tier available) and uploads go to Cloudinary
  instead — see `src/lib/cloudStorage.ts`. Existing files already on local
  disk are NOT auto-migrated if you turn this on later; only new uploads
  after that point go to Cloudinary.
- `npm run typecheck` and `npm run lint` are available but haven't been run
  in this environment (no network access to install dependencies here) —
  run them yourself after `npm install` to catch any type/lint errors before
  deploying.

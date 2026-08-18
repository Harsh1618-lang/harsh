# Deploy Checklist — copy-paste, no guesswork

Follow in order. Each step tells you exactly what to click/type.

---

## STEP 1 — Get a free PostgreSQL database (Neon)

1. Go to https://neon.tech → Sign up (free, use GitHub login for speed)
2. Create a new project → any name → region closest to India (e.g. Singapore/Mumbai if shown)
3. On the project dashboard, find **Connection string** — copy it. Looks like:
   `postgresql://user:pass@ep-xxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`
4. Save this somewhere — this is your `DATABASE_URL`.

---

## STEP 2 — Get Razorpay keys (for real donation payments)

1. Go to https://dashboard.razorpay.com/signup → sign up (use **Test Mode** first, don't need business docs yet)
2. Left sidebar → **Settings → API Keys** → Generate Test Keys
3. Copy `Key Id` and `Key Secret` — these are `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
4. Skip the webhook secret for now — you'll add it in Step 7 AFTER you have a live deployed URL (webhook needs a real URL to point to, not localhost).

> Test Mode keys let you test payments with fake cards (no real money). Switch to Live Mode keys later when ready for real donations — same steps, different toggle in Razorpay dashboard.

---

## STEP 3 — (Optional) Get Cloudinary keys (for file uploads to survive on Vercel)

Skip this if you're deploying to a normal VM. **Required if deploying to Vercel/Netlify** or uploaded images/resume will disappear on every redeploy.

1. Go to https://cloudinary.com/users/register/free → sign up
2. Dashboard home page shows: **Cloud Name**, **API Key**, **API Secret** — copy all three

---

## STEP 4 — Open the project in VS Code

1. Unzip `harshdev-premium-creator-platform-complete.zip`
2. Open the extracted folder in VS Code
3. Open a terminal inside VS Code (`` Ctrl+` ``)
4. Copy the env template:
   ```
   cp .env.example .env
   ```
   (On Windows PowerShell: `copy .env.example .env`)
5. Open `.env` in VS Code and fill in:
   ```
   DATABASE_URL=<paste from Step 1>
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=<pick a real password, not admin123>
   ADMIN_SESSION_SECRET=<run: openssl rand -hex 32, paste output>
   RAZORPAY_KEY_ID=<paste from Step 2>
   RAZORPAY_KEY_SECRET=<paste from Step 2>
   CLOUDINARY_CLOUD_NAME=<paste from Step 3, if using>
   CLOUDINARY_API_KEY=<paste from Step 3, if using>
   CLOUDINARY_API_SECRET=<paste from Step 3, if using>
   ```
   Leave `RAZORPAY_WEBHOOK_SECRET` empty for now.

   No `openssl` on Windows? Use this in the VS Code terminal instead:
   ```
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

---

## STEP 5 — Install, push DB schema, build

Run these one at a time in the VS Code terminal:

```bash
npm install
npm run db:push
npm run typecheck
npm run build
```

- `npm install` — installs dependencies (takes 1-2 min)
- `npm run db:push` — creates all tables in your Neon database
- `npm run typecheck` — catches any type errors (should show none)
- `npm run build` — production build (should end with "Compiled successfully")

**If any of these fail, stop and share the error before continuing** — don't push broken code to GitHub.

Once build succeeds, test locally:
```bash
npm start
```
Open http://localhost:3000 — click the logo 3 times to reach admin login (use the ADMIN_USERNAME/PASSWORD from your `.env`).

---

## STEP 6 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
```

Go to https://github.com/new → create a new repo (don't add README/gitignore, you already have one) → copy the commands GitHub shows you, they'll look like:

```bash
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```

**Double check `.env` is NOT pushed** — it's already in `.gitignore`, but confirm with:
```bash
git status
```
`.env` should NOT appear in the list of files being committed. If it does, something's wrong with `.gitignore` — stop and ask before pushing.

---

## STEP 7 — Deploy on Vercel

1. Go to https://vercel.com → sign up with GitHub
2. **Add New → Project** → import the repo you just pushed
3. Before clicking Deploy, expand **Environment Variables** and add every variable from your `.env` file (same names, same values) — Vercel doesn't read your local `.env`, you must paste them here manually
4. Click **Deploy**
5. Once deployed, you get a URL like `https://your-project.vercel.app`

### Now finish the Razorpay webhook (Step 2 loose end)
1. Razorpay Dashboard → **Settings → Webhooks → Add New Webhook**
2. Webhook URL: `https://your-project.vercel.app/api/donations/webhook`
3. Active events: check `payment.captured` and `payment.failed`
4. Save → Razorpay shows a **Webhook Secret** → copy it
5. Back in Vercel: **Project → Settings → Environment Variables** → add `RAZORPAY_WEBHOOK_SECRET` with that value
6. Vercel → **Deployments** → click **Redeploy** on the latest deployment (env var changes need a redeploy to take effect)

---

## Deploying to Netlify instead of Vercel?

Netlify needs one extra plugin for Next.js API routes to work:
```bash
npm install -D @netlify/plugin-nextjs
```
Then create `netlify.toml` in the project root:
```toml
[build]
  command = "npm run build"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```
Commit and push this, then import the repo on https://app.netlify.com the same way as Vercel — add the same environment variables in **Site settings → Environment variables**, and use your Netlify URL for the Razorpay webhook in Step 7.

---

## Quick sanity checklist before calling it done

- [ ] Site loads at your live URL
- [ ] Admin login works (logo x3 → login with your real password, not admin123)
- [ ] Make a ₹10 test donation via Razorpay (Test Mode card: `4111 1111 1111 1111`, any future expiry, any CVV) → confirm it shows "Verified" badge on Wall of Supporters
- [ ] Upload an image in Admin Panel → refresh page → image still loads (confirms Cloudinary/storage is working)
- [ ] Switch Razorpay from Test Mode to Live Mode keys (Settings → API Keys) only once you're ready for real donations — update `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` in Vercel and redeploy

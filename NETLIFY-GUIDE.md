# Matesther ERP — How to Make It Live on Netlify (Permanent Link)

This gets Matesther running on a permanent, always-on web address
(e.g. `matesther-erp.netlify.app`) that you can open in any tab, on any
device, in any presentation — it will never sleep like the arena preview.

**Time: about 10–15 minutes. Cost: free tiers are enough.**

You need two things:
1. **The code** (this project)
2. **A database** (where Matesther's orders, workers and money live)

---

## STEP 1 — Get the code into GitHub

1. In the arena panel, click **Download** (top-right of the preview panel) to get the project zip.
2. Go to **github.com** → sign in (free) → create a new repository named `matesther-erp` (leave it empty, do NOT add a readme).
3. In the repo page, click **"uploading an existing file"** and drag in **all the files from the unzipped folder** (including hidden ones like `.env` is NOT needed — see note below) → **Commit changes**.
   - The important folders/files: `src/`, `deploy/`, `drizzle/`, `seed.sql`, `package.json`, `netlify.toml`, `next.config.ts`, `tsconfig.json`, `drizzle.config.json`, `postcss.config.mjs`.

> Note: **Do not upload `.env`** — it contains this sandbox's database address.
> You will give Netlify *your new* database address instead (Step 4).

## STEP 2 — Create a free database (Supabase)

1. Go to **supabase.com** → **Start your project** (free) → sign in with GitHub.
2. **New project** → name it `matesther` → set a strong database password (write it down) → create (takes ~1 minute).
3. Left menu → **Settings** (gear icon) → **Database**.
4. Copy the **connection string that contains `pooler`** in the host. You'll see two options — **either one is fine**:
   - Transaction mode (port `6536`): `...pooler.supabase.com:6536/postgres?pgbouncer=true`
   - Session mode (port `6543`): `...pooler.supabase.com:6543/postgres`
   
   ⚠️ The `?pgbouncer=true` part only appears on the 6536 string — it is **not** a mistake if yours (6543) doesn't have it. Use the string exactly as displayed, no changes needed. Keep it safe — you'll paste it in Step 4.

*(Prefer Neon? neon.tech works too — just use the "Pooled connection string". The rest is identical.)*

## STEP 3 — Load Matesther's tables + data (2 minutes)

1. In Supabase, left menu → **SQL Editor** → **New query**.
2. Open the file **`deploy/full-setup.sql`** (it's in this project) and paste its ENTIRE contents into the editor.
3. Click **Run**. You should see success messages.
   This one file creates all 21 tables (orders, production stages, inspections,
   payroll, etc.) AND loads all the Matesther sample data — schools, workers,
   the 500-uniform order, payroll history, everything.

## STEP 4 — Deploy on Netlify

1. Go to **netlify.com** → **Sign up / Log in** → choose **"Log in with GitHub"** (free).
2. **Add new site** → **Import an existing project** → **GitHub** → authorize → select the `matesther-erp` repo.
3. Netlify reads `netlify.toml` automatically, so the build settings are already correct
   (build command `npm run build`, publish dir `.next`). If it shows blanks, set:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. Before deploying, click **"Site configuration"** → **"Environment variables"** → **Add a variable**:
   - Key: `DATABASE_URL`
   - Value: the **pooled** Supabase connection string from Step 2
5. Click **Deploy site**. Wait 2–4 minutes.
6. 🎉 Netlify gives you a permanent URL like `matesther-abc123.netlify.app`
   → open it → sign in as **Esther Adejugba** (estheradejugba@gmail.com / owner123).

## STEP 5 — Presentation-day checklist

1. **Change the demo passwords** (do this before your audience sees it):
   Sign in as Owner → **Settings → Users** → Manage each account → set a new password.
2. Open your Netlify URL in the presentation tab — it loads every time, any device, any network.
3. The full demo walk works exactly as in the arena preview:
   Dashboard → Orders → Order detail (timeline + inspection + profit) →
   Inspection Queue → Worker Payments → Reports (Business Growth chart).

---

## If something goes wrong

| Problem | Fix |
|---|---|
| Build fails on Netlify | Make sure `netlify.toml` was uploaded to GitHub (Step 1). It sets Node 20 + the Next.js plugin. |
| Site loads but pages say "Failed to load" | Your `DATABASE_URL` env var is missing or uses the non-pooled string. It MUST contain `pooler` and `6536`. |
| "relation does not exist" errors | `deploy/full-setup.sql` wasn't run in Supabase (Step 3). Run it again. |
| After editing code, site doesn't update | Push the changes to GitHub — Netlify rebuilds automatically. |
| You want to reset the data | In Supabase SQL Editor, run `deploy/full-setup.sql` again (it wipes and reloads sample data). |

## Keeping it free

- Supabase free tier: 500 MB database — more than enough for Matesther.
- Netlify free tier: 100 GB bandwidth/month — plenty for presentations.
- The only thing that ever "dies" is THIS arena sandbox. The Netlify site is yours forever.

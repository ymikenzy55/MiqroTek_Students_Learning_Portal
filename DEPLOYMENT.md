# Deploying Miqrotek to Vercel

This guide walks you through deploying the Miqrotek Learning Portal to Vercel,
including Google OAuth setup for student sign-in.

## Prerequisites

- A [Vercel account](https://vercel.com/signup) (free tier works)
- A [Google Cloud Console](https://console.cloud.google.com/) account (for OAuth)
- Your existing Neon database (already configured)
- Your Moolre account (already configured)

---

## Step 1: Push your code to GitHub

Vercel deploys from a Git repository. If you haven't already:

```bash
git init
git add .
git commit -m "Prepare for Vercel deployment"
git remote add origin https://github.com/YOUR_USERNAME/miqrotek.git
git push -u origin main
```

> **Important:** Verify `.env.local` is NOT committed. It contains your real
> secrets. The `.gitignore` already excludes it. Only `.env.example` should
> be in the repo.

---

## Step 2: Create a Google OAuth App

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Navigate to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth client ID**
5. Choose **Web application**
6. Add these **Authorized JavaScript origins**:
   - `http://localhost:3000` (for local development)
   - `https://YOUR_APP_NAME.vercel.app` (for production — add after step 4)
   - `https://YOUR_CUSTOM_DOMAIN.com` (if you have one)
7. Add these **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://YOUR_APP_NAME.vercel.app/api/auth/callback/google`
   - `https://YOUR_CUSTOM_DOMAIN.com/api/auth/callback/google`
8. Click **Create**
9. Copy the **Client ID** and **Client Secret**

> You can add the production URL after your first deploy (step 4) once you know
> the `*.vercel.app` domain. Just come back and add it here.

---

## Step 3: Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel will auto-detect Next.js — no framework config needed
4. **Do not deploy yet** — expand **Environment Variables** and add all of them
   (see Step 5 below)
5. Click **Deploy**

The build command is already configured in `vercel.json`:
```
prisma generate && next build
```

This regenerates the Prisma client before building, which is required because
the generated client in `src/generated/prisma` is git-ignored.

---

## Step 4: Get your Vercel URL

After the first deploy, Vercel assigns a URL like:
```
https://miqrotek-xxx.vercel.app
```

Go back to Google Cloud Console (step 2) and add this URL to your authorized
origins and redirect URIs. Then redeploy on Vercel (push any commit or click
"Redeploy" in the Vercel dashboard).

---

## Step 5: Environment Variables

Add ALL of these in Vercel → Project → Settings → Environment Variables.
Set them for **Production**, **Preview**, and **Development** environments.

### Database (from your Neon dashboard)
| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql://...pooler...neon.tech/neondb?sslmode=require` |
| `DATABASE_URL_UNPOOLED` | `postgresql://...neon.tech/neondb?sslmode=require` |

### Auth
| Key | Value |
|-----|-------|
| `AUTH_SECRET` | Generate with: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://YOUR_APP_NAME.vercel.app` (your production URL) |

### Google OAuth
| Key | Value |
|-----|-------|
| `GOOGLE_CLIENT_ID` | From Google Cloud Console (step 2) |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console (step 2) |

### Moolre Payment
| Key | Value |
|-----|-------|
| `MOOLRE_API_USER` | Your Moolre username |
| `MOOLRE_PUBLIC_KEY` | Your Moolre public key |
| `MOOLRE_PRIVATE_KEY` | Your Moolre private key |
| `MOOLRE_ACCOUNT_NUMBER` | Your Moolre account number |
| `MOOLRE_BASE_URL` | `https://api.moolre.com` |

> **Tip:** You can copy all values from your local `.env.local` file. Just
> update `NEXTAUTH_URL` to your Vercel production URL instead of
> `http://localhost:3000`.

---

## Step 6: Update Moolre Callback URLs

After deploying, your Moolre callback and redirect URLs will automatically use
your `NEXTAUTH_URL` environment variable. No changes needed in the code.

However, if Moolre requires you to whitelist callback IPs or URLs in their
dashboard, add:
- Callback: `https://YOUR_DOMAIN/api/payment/moolre/callback`
- Redirect: `https://YOUR_DOMAIN/payment/success`

---

## Step 7: Run database migrations (if needed)

Your Neon database is already in sync. If you make future schema changes:

```bash
# Locally, push schema changes to Neon
npx prisma db push

# Regenerate the client
npx prisma generate
```

The generated Prisma client is rebuilt on every Vercel deploy via
`vercel.json`'s build command.

---

## Local Development with Google OAuth

1. Add to `.env.local`:
   ```
   GOOGLE_CLIENT_ID="your-client-id"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```
2. Make sure `http://localhost:3000/api/auth/callback/google` is in your
   Google Cloud Console authorized redirect URIs
3. Run `npm run dev`
4. Go to `http://localhost:3000/login` — the student tab will show a
   "Continue with Google" button

---

## Known Limitations on Vercel Serverless

### 1. File uploads (course cover images)
The `/api/upload` route writes files to `public/uploads/` on the local
filesystem. **This works in development but NOT on Vercel** because serverless
functions have a read-only filesystem.

**Solutions (pick one):**
- **Vercel Blob** (recommended): Use `@vercel/blob` to store uploads in Vercel's
  managed blob storage. This requires a small code change in
  `src/app/api/upload/route.ts`.
- **Cloudinary / Uploadthing / S3**: Replace the local file write with an
  external storage provider.
- **Preset images only**: Remove the upload option and only use preset images
  (already supported in the ImageUploader component).

Until you pick a solution, instructors can still use **preset images** or
**URL** mode for course covers — those work everywhere.

### 2. Realtime messaging (SSE)
The realtime system uses in-process pub/sub. On Vercel serverless, each
function invocation is isolated, so SSE events won't fan out across instances.

**Solutions:**
- **Vercel + Redis**: Use Upstash Redis pub/sub as the broker (minimal code
  change in `src/lib/realtime.ts`).
- **Ably / Pusher**: Use a managed realtime service.
- **Single VPS deployment**: Deploy on a VPS (Render, Fly.io, Railway) instead
  of Vercel if realtime is critical and you don't want to add Redis.

The messaging UI still works on Vercel — you just won't get live push
notifications. Users can refresh to see new messages.

---

## Custom Domain

1. Vercel Dashboard → Project → Settings → Domains
2. Add your domain (e.g. `miqrotek.com`)
3. Update your DNS records as Vercel instructs
4. Update `NEXTAUTH_URL` env var to your custom domain
5. Add the custom domain to Google OAuth authorized origins/redirects
6. Add the custom domain to Moolre callback/redirect URLs

---

## Troubleshooting

### Build fails: "Prisma Client not found"
The `vercel.json` build command runs `prisma generate` first. If it still fails,
ensure `DATABASE_URL` is set in Vercel env vars (Prisma needs it to generate).

### Google sign-in redirects to error page
- Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
- Check the redirect URI in Google Cloud Console matches exactly:
  `https://YOUR_DOMAIN/api/auth/callback/google`
- Check `NEXTAUTH_URL` matches your actual domain

### Payment not confirming
- Check Moolre env vars are set
- Check `NEXTAUTH_URL` is your production URL (not localhost)
- Check Moolre callback URL is reachable: `https://YOUR_DOMAIN/api/payment/moolre/callback`

### Database connection errors
- Ensure `DATABASE_URL` uses the **pooler** endpoint (with `-pooler` in the
  hostname) for serverless compatibility
- Ensure `?sslmode=require` is in the connection string

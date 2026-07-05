# MeinHelfer Deployment Guide

Complete step-by-step guide to deploy MeinHelfer to production.

**Stack:**
- Frontend: Cloudflare Pages (Next.js)
- Backend: Railway (FastAPI + PostgreSQL)
- Domain: mein-helfer.de (IONOS)

---

## Part 1: Deploy Backend to Railway

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub
3. Connect your GitHub account

### Step 2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `MeinHelfer` repository
4. Railway will detect the `railway.json` configuration

### Step 3: Add PostgreSQL Database
1. In your Railway project, click "+ New"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically create a database
4. Copy the `DATABASE_URL` from the PostgreSQL service

### Step 4: Configure Environment Variables
In Railway dashboard, go to your backend service → Variables tab and add:

```env
DATABASE_URL=<Railway will auto-provide this>
SECRET_KEY=<generate with: openssl rand -hex 32>
ACCESS_TOKEN_EXPIRE_HOURS=8
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
SMTP_FROM=noreply@mein-helfer.de
SMTP_FROM_NAME=MeinHelfer
SMTP_TLS=true
ADMIN_EMAIL=admin@mein-helfer.de
DOMAIN=mein-helfer.de
APP_URL=https://mein-helfer.de
ENVIRONMENT=production
CORS_ORIGINS=["https://mein-helfer.de","https://www.mein-helfer.de"]
```

**Important Notes:**
- `DATABASE_URL` is automatically provided by Railway when you add PostgreSQL
- Generate `SECRET_KEY` with: `openssl rand -hex 32`
- For Gmail SMTP, create an App Password: Google Account → Security → 2-Step Verification → App Passwords

### Step 5: Deploy Backend
1. Railway will automatically deploy after you push to GitHub
2. Wait for deployment to complete
3. Copy your Railway backend URL (e.g., `https://meinhelfer-backend-production.up.railway.app`)
4. Test the API: Visit `https://your-railway-url.railway.app/docs`

### Step 6: Create Admin User
Once deployed, you need to create an admin account:

**Option A: Using Railway Terminal**
1. In Railway dashboard, click on your backend service
2. Click "Connect" → "Terminal"
3. Run:
```bash
python -c "
from app.core.database import engine
from app.models.admin import Admin
from app.core.security import hash_password
from sqlalchemy.orm import Session
import asyncio

async def create_admin():
    async with engine.begin() as conn:
        from sqlalchemy import text
        await conn.execute(text('''
            INSERT INTO admins (id, email, password_hash, full_name, is_active)
            VALUES (gen_random_uuid(), 'admin@mein-helfer.de', :pwd, 'Admin', true)
        '''), {'pwd': hash_password('your-secure-password')})

asyncio.run(create_admin())
"
```

**Option B: Direct SQL**
1. In Railway dashboard, click on PostgreSQL service
2. Click "Connect" → "Query"
3. Run:
```sql
INSERT INTO admins (id, email, password_hash, full_name, is_active)
VALUES (gen_random_uuid(), 'admin@mein-helfer.de', '<hash-from-python>', 'Admin', true);
```
Generate hash with: `python -c "from passlib.context import CryptContext; print(CryptContext(schemes=['bcrypt']).hash('your-password'))"`

---

## Part 2: Deploy Frontend to Cloudflare Pages

### Step 1: Create Cloudflare Account
1. Go to https://dash.cloudflare.com
2. Sign up (or log in if you already have an account)

### Step 2: Create Pages Project
1. In Cloudflare dashboard, click "Workers & Pages"
2. Click "Create application" → "Pages" → "Connect to Git"
3. Authorize Cloudflare to access your GitHub
4. Select your `MeinHelfer` repository

### Step 3: Configure Build Settings
Set these in Cloudflare Pages:

```
Framework preset: Next.js
Build command: cd frontend && npm ci && npm run build
Build output directory: frontend/.next
Root directory: /
Node version: 22
```

### Step 4: Set Environment Variables
In Cloudflare Pages → Settings → Environment variables → Production:

```
NEXT_PUBLIC_API_URL=https://your-railway-backend-url.railway.app
NODE_VERSION=22
NEXT_TELEMETRY_DISABLED=1
```

**Replace** `https://your-railway-backend-url.railway.app` with your actual Railway backend URL from Part 1, Step 5.

### Step 5: Deploy Frontend
1. Click "Save and Deploy"
2. Cloudflare will build and deploy your frontend
3. You'll get a temporary URL like: `https://meinhelfer-xxx.pages.dev`
4. Test the website

---

## Part 3: Connect Your Domain (mein-helfer.de)

### Step 1: Add Domain to Cloudflare
1. In Cloudflare dashboard, click "Websites" → "Add a site"
2. Enter: `mein-helfer.de`
3. Select Free plan
4. Cloudflare will scan your DNS records

### Step 2: Update Nameservers at IONOS
1. Log into your IONOS account
2. Go to Domains → mein-helfer.de → DNS Settings
3. Change nameservers to Cloudflare's nameservers (shown in Cloudflare):
   - Usually: `ns1.cloudflare.com` and `ns2.cloudflare.com`
4. Save changes
5. Wait 24-48 hours for propagation (usually faster, ~1-2 hours)

### Step 3: Configure DNS in Cloudflare
Once nameservers are updated, in Cloudflare DNS settings:

**Add these DNS records:**

| Type  | Name | Content                          | Proxy |
|-------|------|----------------------------------|-------|
| CNAME | @    | meinhelfer-xxx.pages.dev        | ✅ On |
| CNAME | www  | meinhelfer-xxx.pages.dev        | ✅ On |

Replace `meinhelfer-xxx.pages.dev` with your actual Cloudflare Pages URL.

**Alternative (if using custom domain in Pages):**
1. Go to Cloudflare Pages → Your project → Custom domains
2. Click "Set up a custom domain"
3. Enter: `mein-helfer.de`
4. Add: `www.mein-helfer.de`
5. Cloudflare will automatically configure DNS

### Step 4: Enable SSL/HTTPS
1. In Cloudflare → SSL/TLS → Overview
2. Set encryption mode to: **Full (strict)**
3. Wait a few minutes for SSL certificate to activate
4. Your site will be live at: `https://mein-helfer.de`

---

## Part 4: Final Configuration

### Update CORS in Railway Backend
1. Go to Railway backend service → Variables
2. Update `CORS_ORIGINS`:
```
CORS_ORIGINS=["https://mein-helfer.de","https://www.mein-helfer.de"]
```
3. Redeploy (Railway will auto-redeploy on variable change)

### Update API URL in Cloudflare Pages
Already set in Part 2, but verify:
```
NEXT_PUBLIC_API_URL=https://your-railway-backend-url.railway.app
```

### Test Everything
1. Visit: `https://mein-helfer.de`
2. Fill out booking form → Submit (should work!)
3. Visit: `https://mein-helfer.de/admin/login`
4. Log in with admin credentials
5. Check if request appears in admin dashboard

---

## Part 5: Post-Deployment Checklist

- [ ] Backend is live and accessible at Railway URL
- [ ] Frontend is live at https://mein-helfer.de
- [ ] Booking form submits successfully
- [ ] Admin login works
- [ ] Requests appear in admin dashboard
- [ ] Email notifications work (test by submitting form)
- [ ] SSL certificate is active (green padlock in browser)
- [ ] www.mein-helfer.de redirects to mein-helfer.de
- [ ] No CORS errors in browser console

---

## Troubleshooting

### Frontend build fails on Cloudflare
**Error:** "Build failed"
- Check build logs in Cloudflare Pages dashboard
- Ensure `NODE_VERSION=22` is set in environment variables
- Verify build command: `cd frontend && npm ci && npm run build`

### CORS errors in browser
**Error:** "Access to fetch has been blocked by CORS policy"
- Check Railway backend `CORS_ORIGINS` includes your domain
- Ensure both `https://mein-helfer.de` and `https://www.mein-helfer.de` are listed
- Redeploy backend after changing CORS settings

### Form submission fails
**Error:** Network error or 500 error
- Check Railway backend logs for errors
- Verify `DATABASE_URL` is set correctly
- Ensure migrations ran: check Railway deployment logs for `alembic upgrade head`

### Admin login fails
**Error:** 401 Unauthorized
- Verify admin user was created in database
- Check email/password are correct
- Check Railway backend logs for authentication errors

### Database connection error
**Error:** "Could not connect to database"
- Verify Railway PostgreSQL service is running
- Check `DATABASE_URL` environment variable
- Ensure it's in format: `postgresql+asyncpg://user:pass@host:port/db`

---

## Monitoring & Maintenance

### Railway (Backend)
- **Logs:** Railway dashboard → Your service → Deployments → View logs
- **Database:** Railway dashboard → PostgreSQL → Connect → Query
- **Metrics:** Railway dashboard shows CPU, Memory, Network usage

### Cloudflare Pages (Frontend)
- **Deployments:** Cloudflare Pages → Your project → Deployments
- **Analytics:** Cloudflare → Analytics → Web traffic
- **Logs:** Cloudflare Pages → Functions → Logs

### Costs
- **Railway:** Free $5/month credit (should be enough for small traffic)
- **Cloudflare Pages:** Free (unlimited bandwidth)
- **Domain:** ~€12/year on IONOS
- **Total:** ~€12/year (if Railway stays under $5/month)

---

## Support

If you encounter issues:
1. Check Railway backend logs
2. Check Cloudflare Pages build logs
3. Check browser console for errors (F12)
4. Verify all environment variables are set correctly

**Need help?** Open an issue in the GitHub repository.

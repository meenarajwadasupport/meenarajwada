@echo off
cd /d "%~dp0"
echo === Meena Rajwada – Cloudflare Worker Deploy ===
echo.
echo Step 1: Installing dependencies...
call npm install
echo.
echo Step 2: Login to Cloudflare (browser will open)...
call npx wrangler login
echo.
echo Step 3: Deploying Worker...
call npx wrangler deploy
echo.
echo Step 4: Add the Supabase JWT secret (paste your JWT secret when prompted)...
call npx wrangler secret put SUPABASE_JWT_SECRET
echo.
echo ✅ Done! Your Worker is live at:
echo    https://meenarajwada-api.YOUR_SUBDOMAIN.workers.dev
echo.
echo Next: Add VITE_CF_WORKER_URL to Vercel Environment Variables.
pause

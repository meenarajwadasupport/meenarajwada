@echo off
cd /d "%~dp0\cf-worker"
echo Deploying Cloudflare Worker...
npx wrangler deploy
echo.
echo Worker deployed! URL: https://meenarajwada-api.meenarajwadasupport.workers.dev
pause

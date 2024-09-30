nx build backend
nx build frontend

cp -r dist/apps/frontend/browser/* dist/apps/backend/assets
cp README.md dist/apps/backend
echo done.
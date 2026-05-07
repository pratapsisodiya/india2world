#!/bin/bash
# India2World — production deploy script
# Run on your VPS after pulling latest code: bash deploy.sh
set -e

echo "========================================"
echo "  India2World — Production Deploy"
echo "========================================"

echo ""
echo "[1/4] Building backend..."
cd backend
npm ci --omit=dev
npm run build
cd ..

echo ""
echo "[2/4] Building frontend..."
cd frontend
npm ci --omit=dev
npm run build
cd ..

echo ""
echo "[3/4] Restarting backend via PM2..."
cd backend
pm2 restart india2world-backend --env production 2>/dev/null || \
  pm2 start ecosystem.config.cjs --env production
cd ..

echo ""
echo "[4/4] Restarting frontend via PM2..."
cd frontend
pm2 restart india2world-frontend --env production 2>/dev/null || \
  pm2 start ecosystem.config.cjs --env production
cd ..

echo ""
echo "========================================"
echo "  Deploy complete!"
echo "========================================"
pm2 status

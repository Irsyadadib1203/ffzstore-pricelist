#!/bin/bash
# deploy.sh - Jalankan ini setiap kali mau update di VPS
set -e

echo "==> Pull latest code..."
git pull origin main

echo "==> Install dependencies..."
npm ci --omit=dev

echo "==> Build Next.js..."
npm run build

echo "==> Restart app via PM2..."
pm2 restart ffzstore-pricelist || pm2 start ecosystem.config.js

echo "==> Done! App running."
pm2 status

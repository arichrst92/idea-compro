#!/bin/bash
cd /var/www/idea-website
git pull origin main
npm install --production
pm2 reload idea-website
echo "✅ Deployed at $(date)"

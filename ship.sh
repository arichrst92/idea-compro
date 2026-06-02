#!/bin/bash
# ship.sh — commit + push ke GitHub + deploy ke VPS dalam satu perintah
#
# Pakai dari folder Source Code:
#   chmod +x ship.sh         (sekali saja)
#   ./ship.sh "pesan commit" (setiap deploy)
#
# Tanpa argumen → commit message default + timestamp.

set -e

VPS="root@72.60.74.202"
VPS_DIR="/var/www/idea-website"
BRANCH="main"
REMOTE="github"          # nama remote GitHub di local. ganti ke "origin" kalau Anda set begitu

cd "$(dirname "$0")"

MSG="${1:-chore: deploy $(date +%Y-%m-%d\ %H:%M)}"

# ── 1. Local: stage + commit (skip kalau tidak ada perubahan) ──
echo "==> [LOCAL] Staging changes..."
git add -A
if git diff --cached --quiet; then
  echo "    (no changes to commit — lanjut ke push & deploy saja)"
else
  echo "==> [LOCAL] Committing: $MSG"
  git commit -m "$MSG"
fi

# ── 2. Local: push ke GitHub ──
echo "==> [LOCAL] Pushing $BRANCH → $REMOTE..."
git push "$REMOTE" "$BRANCH"

# ── 3. Remote: pull + npm + reload ──
echo "==> [VPS] Pulling & reloading..."
ssh "$VPS" bash -s <<EOF
set -e
cd "$VPS_DIR"
git pull origin $BRANCH
npm install --production
# --update-env wajib: tanpa ini, var baru di .env tidak terbaca process Node
pm2 reload idea-website --update-env
pm2 logs idea-website --lines 10 --nostream
EOF

echo ""
echo "==============================================="
echo " Deploy selesai."
echo " Cek: https://ide.asia (hard refresh Cmd+Shift+R)"
echo "==============================================="

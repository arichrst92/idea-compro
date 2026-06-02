#!/bin/bash
# VPS git setup — jalankan script ini DI VPS sebagai root.
# Cara pakai dari laptop Anda:
#   scp scripts/vps-setup-git.sh root@72.60.74.202:/root/
#   ssh root@72.60.74.202 'bash /root/vps-setup-git.sh'
#
# Script akan:
# 1. Pastikan git terinstall
# 2. Generate SSH key ed25519 di /root/.ssh/id_ed25519_github (jika belum ada)
# 3. Tampilkan public key untuk Anda tambahkan ke GitHub Deploy Keys
# 4. Tunggu konfirmasi "yes" lalu test koneksi ke GitHub
# 5. Backup folder /var/www/idea-website, init git, set remote, fetch + reset hard ke main

set -e

REPO_SSH="git@github.com:arichrst92/idea-compro.git"
REPO_HTTPS_INFO="https://github.com/arichrst92/idea-compro/settings/keys/new"
SITE_DIR="/var/www/idea-website"
KEY_PATH="/root/.ssh/id_ed25519_github"
SSH_CONFIG="/root/.ssh/config"

echo "==============================================="
echo " IDEA Compro — VPS Git Setup"
echo "==============================================="

# ── Step 1: Pastikan git terinstall ─────────────────
if ! command -v git >/dev/null 2>&1; then
  echo "==> git belum terinstall, installing..."
  apt update -y && apt install -y git
else
  echo "==> git OK ($(git --version))"
fi

# ── Step 2: Generate SSH key untuk GitHub ───────────
mkdir -p /root/.ssh
chmod 700 /root/.ssh

if [ -f "$KEY_PATH" ]; then
  echo "==> SSH key sudah ada di $KEY_PATH (skip generate)"
else
  echo "==> Generate SSH key ed25519..."
  ssh-keygen -t ed25519 -f "$KEY_PATH" -N "" -C "vps-72.60.74.202-idea-compro"
fi

# ── Step 3: SSH config agar github.com pakai key ini ─
if ! grep -q "Host github.com" "$SSH_CONFIG" 2>/dev/null; then
  cat >> "$SSH_CONFIG" <<EOF

Host github.com
  HostName github.com
  User git
  IdentityFile $KEY_PATH
  IdentitiesOnly yes
EOF
  chmod 600 "$SSH_CONFIG"
  echo "==> SSH config: github.com → $KEY_PATH"
else
  echo "==> SSH config sudah ada entry github.com (skip)"
fi

# ── Step 4: Tampilkan public key + tunggu user pasang ─
echo ""
echo "==============================================="
echo " PUBLIC KEY — COPY DAN PASANG DI GITHUB"
echo "==============================================="
echo ""
cat "${KEY_PATH}.pub"
echo ""
echo "==============================================="
echo " LANGKAH:"
echo " 1. Copy seluruh baris di atas (ssh-ed25519 AAAA... vps-...)"
echo " 2. Buka di browser:"
echo "    $REPO_HTTPS_INFO"
echo " 3. Title: 'VPS Hostinger 72.60.74.202'"
echo "    Key  : paste"
echo "    Allow write access: BIARKAN UNCHECKED (read-only)"
echo " 4. Klik 'Add key'"
echo ""
read -rp "Sudah ditambahkan ke GitHub? Ketik 'yes' untuk lanjut: " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "Dibatalkan. Re-run script ini setelah key terpasang."
  exit 0
fi

# ── Step 5: Test koneksi GitHub ─────────────────────
echo ""
echo "==> Testing koneksi ke github.com..."
ssh -o StrictHostKeyChecking=accept-new -T git@github.com 2>&1 | head -3 || true
# GitHub akan return exit code 1 dengan pesan "Hi USER!" — itu sukses
echo ""

# ── Step 6: Setup git di /var/www/idea-website ──────
if [ ! -d "$SITE_DIR" ]; then
  echo "ERROR: $SITE_DIR tidak ada. Adjust SITE_DIR di script ini."
  exit 1
fi

BACKUP_DIR="${SITE_DIR}.bak-$(date +%Y%m%d-%H%M%S)"
echo "==> Backup $SITE_DIR → $BACKUP_DIR"
cp -a "$SITE_DIR" "$BACKUP_DIR"

cd "$SITE_DIR"

if [ -d .git ]; then
  echo "==> .git sudah ada, update remote ke $REPO_SSH"
  git remote remove origin 2>/dev/null || true
  git remote add origin "$REPO_SSH"
else
  echo "==> Init git di $SITE_DIR"
  git init -b main
  git remote add origin "$REPO_SSH"
fi

echo "==> Fetch dari origin..."
git fetch origin

echo "==> Reset hard ke origin/main (overwrite local files)"
git reset --hard origin/main

# Restore .env dari backup (karena .env di-gitignore tidak ikut)
if [ -f "$BACKUP_DIR/.env" ] && [ ! -f "$SITE_DIR/.env" ]; then
  cp "$BACKUP_DIR/.env" "$SITE_DIR/.env"
  echo "==> .env restored dari backup"
fi

# Restore logs/ folder jika ada
if [ -d "$BACKUP_DIR/logs" ] && [ ! -d "$SITE_DIR/logs" ]; then
  mkdir -p "$SITE_DIR/logs"
  echo "==> logs/ folder direstore"
fi

echo ""
echo "==> Install npm dependencies"
npm install --production

echo ""
echo "==> Reload PM2"
pm2 reload idea-website || pm2 start ecosystem.config.js --env production

echo ""
echo "==============================================="
echo " SELESAI."
echo "==============================================="
echo " Repo: $REPO_SSH"
echo " Dir : $SITE_DIR"
echo " Bak : $BACKUP_DIR"
echo ""
echo " Untuk update di masa depan:"
echo "   cd $SITE_DIR"
echo "   git pull origin main && npm install --production && pm2 reload idea-website"
echo "==============================================="

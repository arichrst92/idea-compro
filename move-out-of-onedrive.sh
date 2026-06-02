#!/bin/bash
# Pindahkan project IDEA Asia keluar dari OneDrive
# Sumber  : OneDrive (tetap dipertahankan sebagai backup)
# Tujuan  : ~/Projects/idea-compro

set -e

SRC="/Users/idea/Library/CloudStorage/OneDrive-IDEAsia/IDEA Company Profile/Source Code"
DEST="$HOME/Projects/idea-compro"

echo "==> Source : $SRC"
echo "==> Dest   : $DEST"
echo ""

if [ ! -d "$SRC" ]; then
  echo "ERROR: Source folder tidak ditemukan."
  exit 1
fi

if [ -e "$DEST" ]; then
  echo "ERROR: $DEST sudah ada. Hapus atau rename dulu, lalu ulangi."
  exit 1
fi

mkdir -p "$HOME/Projects"

echo "==> Copying (rsync, dengan progress)..."
# -a  : preserve perms/times/symlinks
# -E  : preserve extended attributes (macOS)
# --exclude .DS_Store : buang sampah macOS
rsync -aE --info=progress2 \
  --exclude='.DS_Store' \
  --exclude='node_modules' \
  --exclude='logs/*.log' \
  "$SRC/" "$DEST/"

echo ""
echo "==> Verifying .git intact"
cd "$DEST"
git status >/dev/null && echo "    git OK — branch: $(git branch --show-current)"

echo ""
echo "==> Re-install node_modules"
if command -v npm >/dev/null 2>&1; then
  npm install
else
  echo "    (npm tidak terdeteksi — install Node.js dulu, lalu jalankan: cd $DEST && npm install)"
fi

echo ""
echo "Selesai."
echo "  Lokasi baru : $DEST"
echo "  Backup di   : $SRC  (tidak diubah)"
echo ""
echo "Langkah berikut:"
echo "  cd \"$DEST\""
echo "  ./push-to-github.sh    # push ke GitHub dari lokasi baru"

#!/bin/bash
# Jalankan sekali, lalu hapus file ini.
#   chmod +x scripts/one-shot-cleanup.sh && ./scripts/one-shot-cleanup.sh
#
# Tujuan:
# - hapus server.js.bak (tidak ditrack git, tapi masih ada di disk)
# - git rm src/routes/agent-old.js (file lama yang masih ditrack)
# - npm audit fix (non-breaking) — untuk fix moderate vulnerabilities

set -e
cd "$(dirname "$0")/.."

echo "==> Removing server.js.bak from disk..."
rm -f server.js.bak

echo "==> git rm src/routes/agent-old.js..."
git rm -f src/routes/agent-old.js 2>/dev/null || echo "  (sudah tidak ditrack — skip)"

echo "==> npm audit (sebelum fix)..."
npm audit --omit=dev 2>&1 | tail -10 || true

echo ""
echo "==> npm audit fix (non-breaking only)..."
npm audit fix --omit=dev || true

echo ""
echo "==> npm audit (sesudah fix)..."
npm audit --omit=dev 2>&1 | tail -10 || true

echo ""
echo "Selesai. Cek lock file untuk lihat perubahan:"
echo "  git status"
echo ""
echo "Setelah verifikasi, deploy:"
echo "  ./ship.sh \"chore: cleanup + npm audit fix\""

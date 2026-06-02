#!/bin/bash
# Push IDEA Asia website ke GitHub
# Jalankan dari folder "Source Code":
#   chmod +x push-to-github.sh && ./push-to-github.sh

set -e

REPO_SSH="git@github.com:arichrst92/idea-compro.git"

cd "$(dirname "$0")"

echo "==> Cleaning stale git lock (jika ada)"
rm -f .git/index.lock

echo "==> Ensuring .gitignore covers *.bak"
grep -qxF '*.bak' .gitignore || echo '*.bak' >> .gitignore

echo "==> Staging all changes"
git add -A

echo "==> Committing"
git commit -m "feat: add AI agent (Carolla), bilingual updates, switch blog bot to Groq

- Add /agent route with Three.js 3D avatar and Groq-powered chat
- Switch blog-bot from Anthropic to Groq (llama-3.1-8b-instant)
- Add welcome audio (EN/ID) and agent assets
- Refresh contact, home, nav, footer views
- Add deploy.sh, ignore *.bak" || echo "(nothing to commit — lanjut)"

echo "==> Configuring 'github' remote"
if git remote | grep -q '^github$'; then
  git remote set-url github "$REPO_SSH"
else
  git remote add github "$REPO_SSH"
fi

echo "==> Pushing main -> github"
git push -u github main

echo ""
echo "Done. Repo: https://github.com/arichrst92/idea-compro"

# 🚀 IDEA Asia Website — Complete VPS Deployment Guide

## Prerequisites
- VPS dengan Ubuntu 20.04/22.04 (min. 1 CPU, 1GB RAM, 20GB disk)
- Domain sudah pointing ke IP VPS (DNS A record)
- Akses SSH ke VPS
- Anthropic API Key (untuk blog bot)

---

## LANGKAH 1 — Koneksi & Setup VPS

```bash
# SSH masuk ke VPS
ssh root@YOUR_VPS_IP

# Update sistem
apt update && apt upgrade -y

# Install dependencies utama
apt install -y curl git nginx certbot python3-certbot-nginx ufw build-essential
```

---

## LANGKAH 2 — Install Node.js 20 LTS

```bash
# Install via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verifikasi
node --version   # v20.x.x
npm --version    # 10.x.x

# Install PM2 secara global
npm install -g pm2
```

---

## LANGKAH 3 — Install MongoDB

```bash
# Import MongoDB 7.0 GPG key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
  gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Tambah repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
  tee /etc/apt/sources.list.d/mongodb-org-7.0.list

apt update && apt install -y mongodb-org

# Start & enable MongoDB
systemctl start mongod
systemctl enable mongod

# Verifikasi
systemctl status mongod
```

---

## LANGKAH 4 — Upload & Setup Project

```bash
# Buat direktori project
mkdir -p /var/www/idea-website
cd /var/www/idea-website

# Opsi A: Upload via SCP dari local (jalankan di komputer lokal):
# scp -r ./idea-website/* root@YOUR_VPS_IP:/var/www/idea-website/

# Opsi B: Clone dari Git (jika sudah push ke GitHub):
# git clone https://github.com/YOURUSER/idea-website.git .

# Opsi C: Transfer via rsync (dari local):
# rsync -avz --progress ./idea-website/ root@YOUR_VPS_IP:/var/www/idea-website/

# Masuk ke folder project
cd /var/www/idea-website

# Install dependencies Node
npm install --production

# Buat folder logs
mkdir -p logs
```

---

## LANGKAH 5 — Konfigurasi Environment

```bash
# Di dalam /var/www/idea-website
cp .env.example .env
nano .env
```

**Isi file `.env`:**
```env
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/idea_website
ANTHROPIC_API_KEY=sk-ant-XXXXXXXXXXXXXXXXXX
SITE_URL=https://yourdomain.com
SITE_NAME=IDEA - Integrated Digital Ecosystem Asia
CONTACT_EMAIL=info@yourdomain.com
CONTACT_PHONE=+62-21-xxxx-xxxx
CONTACT_ADDRESS=Jl. Sudirman No.1, Jakarta Selatan 12190, Indonesia
BLOG_CRON_SCHEDULE=0 */8 * * *
BLOG_ENABLED=true
```
> **Simpan**: Ctrl+O, Enter, Ctrl+X

---

## LANGKAH 6 — Generate Asset Awal

```bash
cd /var/www/idea-website

# Generate OG images dan favicon SVG
node scripts/generate-og.js

# Upload logo IDEA ke public/images/logo.png
# (Upload manual via SCP):
# scp ./logo.png root@YOUR_VPS_IP:/var/www/idea-website/public/images/logo.png
```

---

## LANGKAH 7 — Setup Nginx

```bash
# Copy konfigurasi Nginx
cp /var/www/idea-website/nginx.conf /etc/nginx/sites-available/idea-website

# Edit domain
nano /etc/nginx/sites-available/idea-website
# Ganti semua 'yourdomain.com' dengan domain Anda

# Aktifkan site
ln -s /etc/nginx/sites-available/idea-website /etc/nginx/sites-enabled/

# Hapus default Nginx
rm -f /etc/nginx/sites-enabled/default

# Test konfigurasi
nginx -t

# Restart Nginx
systemctl restart nginx
systemctl enable nginx
```

---

## LANGKAH 8 — Setup SSL (HTTPS) dengan Let's Encrypt

```bash
# Pastikan domain sudah pointing ke IP VPS
# Test: ping yourdomain.com → harus return IP VPS

# Dapatkan SSL certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com \
  --email info@yourdomain.com --agree-tos --non-interactive

# Auto-renewal (sudah otomatis, tapi test dulu)
certbot renew --dry-run
```

**Setelah SSL aktif**, uncomment blok HTTPS di nginx.conf dan tambah redirect:
```bash
nano /etc/nginx/sites-available/idea-website
# Uncomment baris: return 301 https://$host$request_uri;
# Uncomment blok server { listen 443 ssl ... }
nginx -t && systemctl reload nginx
```

---

## LANGKAH 9 — Jalankan Aplikasi dengan PM2

```bash
cd /var/www/idea-website

# Start aplikasi
pm2 start ecosystem.config.js --env production

# Simpan konfigurasi PM2 (agar auto-start setelah reboot)
pm2 save
pm2 startup
# Jalankan perintah yang dihasilkan pm2 startup (biasanya: sudo env PATH=... pm2 startup ...)

# Cek status
pm2 status
pm2 logs idea-website --lines 50
```

---

## LANGKAH 10 — Setup Firewall

```bash
# Aktifkan UFW
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
ufw status
```

---

## LANGKAH 11 — Verifikasi Website

```bash
# Test lokal di VPS
curl http://localhost:3000

# Cek log PM2
pm2 logs idea-website

# Test endpoint health
curl https://yourdomain.com/api/health

# Test sitemap
curl https://yourdomain.com/api/sitemap.xml
```

Buka browser → **https://yourdomain.com** ✅

---

## MONITORING & MAINTENANCE

### Melihat Logs
```bash
pm2 logs idea-website          # Real-time logs
pm2 logs idea-website --lines 100  # 100 baris terakhir
tail -f /var/www/idea-website/logs/err.log
```

### Restart Aplikasi
```bash
pm2 restart idea-website
pm2 reload idea-website    # Zero-downtime reload
```

### Update Kode (Deploy Ulang)
```bash
cd /var/www/idea-website

# Pull kode terbaru (jika dari Git)
git pull origin main

# Install dependencies baru (jika ada)
npm install --production

# Reload tanpa downtime
pm2 reload idea-website
```

### Cek Status Blog Bot
```bash
pm2 logs idea-website | grep "Blog\|blog\|🤖\|✅\|❌"
```

### Trigger Blog Manual
```bash
cd /var/www/idea-website
node -e "require('./blog-bot/index').generateBlogPost()"
```

### Backup MongoDB
```bash
# Backup
mongodump --db idea_website --out /backup/mongo/$(date +%Y%m%d)

# Restore
mongorestore --db idea_website /backup/mongo/TANGGAL/idea_website
```

---

## TROUBLESHOOTING

| Problem | Solusi |
|---------|--------|
| `502 Bad Gateway` | `pm2 restart idea-website` |
| Blog bot tidak jalan | Cek `ANTHROPIC_API_KEY` di `.env` |
| MongoDB connection error | `systemctl restart mongod` |
| SSL expired | `certbot renew` |
| Port 3000 tidak bisa diakses | Cek `pm2 status`, pastikan app running |
| Static files 404 | Cek path di nginx.conf, pastikan `/var/www/idea-website/public/` ada |

---

## STRUKTUR FILE LENGKAP

```
idea-website/
├── server.js                 # Entry point
├── ecosystem.config.js       # PM2 config
├── package.json
├── .env                      # ← Jangan di-commit ke Git!
├── nginx.conf                # Nginx config (copy ke /etc/nginx/)
├── src/
│   ├── models/
│   │   └── Blog.js
│   └── routes/
│       ├── home.js
│       ├── services.js
│       ├── blog.js
│       ├── about.js
│       ├── contact.js
│       └── api.js
├── views/
│   ├── layouts/main.ejs
│   ├── partials/
│   │   ├── nav.ejs
│   │   └── footer.ejs
│   └── pages/
│       ├── home.ejs
│       ├── services.ejs
│       ├── service-detail.ejs
│       ├── blog.ejs
│       ├── blog-detail.ejs
│       ├── about.ejs
│       ├── contact.ejs
│       ├── 404.ejs
│       └── 500.ejs
├── public/
│   ├── css/main.css
│   ├── js/main.js
│   └── images/
│       ├── logo.png          # ← Upload manual
│       ├── favicon.svg
│       └── og-*.jpg          # OG images
├── blog-bot/
│   └── index.js              # Auto blog generator (setiap 8 jam)
└── scripts/
    └── generate-og.js
```

---

## CATATAN PENTING

1. **Logo** — Upload file `logo.png` ke `/var/www/idea-website/public/images/logo.png`
2. **OG Images** — Untuk hasil terbaik, buat OG images 1200×630px menggunakan Figma/Canva dan upload sebagai `.jpg`
3. **Email** — Tambahkan Nodemailer ke `contact.js` untuk email notifikasi form
4. **Blog Bot** — Membutuhkan `ANTHROPIC_API_KEY` valid. Bot akan generate 6 post pertama saat startup (satu per service)
5. **HTTPS** — Wajib untuk OG tags dan SEO. Certbot gratis dan auto-renew
6. **Backup** — Setup cron job backup MongoDB harian

---

*Dibuat untuk IDEA — Integrated Digital Ecosystem Asia*

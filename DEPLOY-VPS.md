# Deploy ke VPS — Step by Step

Asumsi: project sudah di-clone/upload ke `/var/www/idea-website` di VPS dan sudah pernah berjalan dengan PM2. Domain pakai placeholder `ide.asia` — sesuaikan jika berbeda.

---

## OPSI A — Sudah di Git (paling cepat)

Setelah Anda push perubahan ini ke GitHub/GitLab:

```bash
ssh root@YOUR_VPS_IP

cd /var/www/idea-website

# 1. Backup state sekarang (jaga-jaga)
cp -r /var/www/idea-website /var/www/idea-website.bak-$(date +%Y%m%d-%H%M)

# 2. Pull perubahan
git fetch --all
git reset --hard origin/main      # atau: git pull origin main

# 3. Install dependency baru (jika ada)
npm install --production

# 4. Reload tanpa downtime
pm2 reload idea-website

# 5. Cek log 30 detik
pm2 logs idea-website --lines 50

# 6. Test
curl -I http://localhost:3000
curl -I https://ide.asia
```

Selesai. Cek browser → hard refresh (Cmd+Shift+R / Ctrl+Shift+F5) untuk bypass cache CSS.

---

## OPSI B — Belum di Git, upload langsung via rsync dari laptop

Jalankan **dari Mac Anda** (di folder Source Code):

```bash
# Ganti YOUR_VPS_IP. --delete akan menghapus file di VPS yang sudah tidak ada di lokal.
# Kalau ragu, hapus --delete dulu untuk dry run.
rsync -avz --delete \
  --exclude='.git/' \
  --exclude='node_modules/' \
  --exclude='logs/' \
  --exclude='.env' \
  --exclude='.DS_Store' \
  --exclude='*.bak' \
  ./ root@YOUR_VPS_IP:/var/www/idea-website/
```

Lalu di VPS:

```bash
ssh root@YOUR_VPS_IP
cd /var/www/idea-website
npm install --production
pm2 reload idea-website
pm2 logs idea-website --lines 50
```

---

## Cache busting CSS di browser

CSS sudah berubah signifikan — pastikan Nginx tidak menyajikan versi lama:

```bash
# di VPS, restart Nginx (opsional, biasanya tidak perlu karena file sudah di-overwrite)
systemctl reload nginx

# Cek cache header
curl -I https://ide.asia/css/main.css
# Lihat 'expires' dan 'Cache-Control'
```

Nginx config saat ini set `expires 7d` + `Cache-Control: public, immutable` untuk `/css/`. Browser yang sudah cache CSS lama akan tetap pakai cache sampai 7 hari. Tiga opsi:

**Opsi 1 — quick fix, edit views/layouts/main.ejs**, ubah tag `<link>` dari:
```html
<link rel="stylesheet" href="/css/main.css">
```
menjadi:
```html
<link rel="stylesheet" href="/css/main.css?v=2">
```
Naikkan `v` setiap kali ada perubahan major CSS.

**Opsi 2 — instruksikan user**: tekan Cmd+Shift+R / Ctrl+Shift+F5.

**Opsi 3 — turunkan cache di Nginx** (kurang ideal untuk performa):
```nginx
location /css/ {
    alias /var/www/idea-website/public/css/;
    expires 1h;
    add_header Cache-Control "public";
}
```

Rekomendasi: pakai Opsi 1 sekarang.

---

## Rollback jika ada masalah

```bash
ssh root@YOUR_VPS_IP

# Jika pakai Git
cd /var/www/idea-website
git reset --hard HEAD~1
pm2 reload idea-website

# Jika pakai rsync, restore dari backup
mv /var/www/idea-website /var/www/idea-website.broken
mv /var/www/idea-website.bak-YYYYMMDD-HHMM /var/www/idea-website
pm2 reload idea-website
```

---

## Verifikasi visual setelah deploy

Buka di browser (incognito + hard refresh) dan cek:

- [ ] Halaman `/services` — sekarang background gelap (sebelumnya putih)
- [ ] Halaman `/about` — heading P.R.I.D.E. medium weight, konsisten dengan home
- [ ] Halaman `/services/it-consulting` — heading H1 tagline, weight konsisten
- [ ] Halaman `/blog/[slug]` — breadcrumb, tags, share bar ter-styling rapi
- [ ] Halaman `/blog` — filter pills, grid 3-col, pagination
- [ ] Hover card di Offices (`/about` bawah) — background sedikit lebih terang
- [ ] CTA section di tiap page — spacing seragam (tidak lompat-lompat)
- [ ] Mobile — buka di iPhone/Android, layout responsive

Jika ada section yang "telanjang" atau warna teks abu-abu hilang, kemungkinan satu class component belum saya tambahkan — kirim screenshot saya patch cepat.

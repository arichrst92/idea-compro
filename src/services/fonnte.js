const axios = require('axios');

/**
 * Fonnte WhatsApp gateway
 * Docs: https://docs.fonnte.com/api/
 * Set FONNTE_TOKEN di .env
 */

const FONNTE_ENDPOINT = 'https://api.fonnte.com/send';

/**
 * Normalisasi nomor HP ke format 62xxx (Fonnte standard untuk Indonesia)
 * Accept: 08xxx, +62xxx, 62xxx, 8xxx
 */
function normalizePhone(raw) {
  if (!raw) return null;
  let p = String(raw).replace(/[^\d]/g, ''); // strip non-digit
  if (p.startsWith('0'))   p = '62' + p.slice(1);
  else if (p.startsWith('62')) p = p;
  else if (p.startsWith('8'))  p = '62' + p;
  if (!/^628\d{7,12}$/.test(p)) return null; // basic ID mobile format check
  return p;
}

/**
 * Kirim pesan WhatsApp via Fonnte
 * @param {string} target - 62xxx
 * @param {string} message
 */
async function sendWhatsApp(target, message) {
  const token = process.env.FONNTE_TOKEN;
  if (!token) throw new Error('FONNTE_TOKEN not configured');

  const params = new URLSearchParams();
  params.append('target', target);
  params.append('message', message);
  params.append('countryCode', '62');

  const res = await axios.post(FONNTE_ENDPOINT, params, {
    headers: {
      'Authorization': token,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    timeout: 15000,
  });

  // Fonnte response: { status: true|false, reason?, id?, target?, process?, ... }
  if (res.data && res.data.status === false) {
    throw new Error(`Fonnte gagal: ${res.data.reason || JSON.stringify(res.data)}`);
  }
  return res.data;
}

/**
 * Generate 6-digit OTP string
 */
function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * Compose OTP message
 */
function otpMessage(otp, ttlMinutes = 5) {
  return [
    `*${otp}* adalah kode login Admin IDEA Asia.`,
    '',
    `Berlaku ${ttlMinutes} menit. Jangan bagikan ke siapa pun.`,
    '',
    'Abaikan pesan ini bila Anda tidak meminta login.',
  ].join('\n');
}

module.exports = { sendWhatsApp, normalizePhone, generateOtp, otpMessage };

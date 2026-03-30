const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transporter;
}

async function sendContactNotification({ name, email, company, service, message }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('⚠️  Email not configured — skipping notification');
    return;
  }
  const t = getTransporter();
  const serviceLabel = service ? service.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase()) : 'General Inquiry';
  await t.sendMail({
    from: process.env.EMAIL_FROM || 'IDEA Asia <noreply@idea-asia.com>',
    to: process.env.EMAIL_TO || 'info@idea-asia.com',
    replyTo: email,
    subject: `[IDEA Contact] ${serviceLabel} — ${name}`,
    html: `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:-apple-system,sans-serif;margin:0;padding:0;background:#f5f5f5}.wrap{max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}.header{background:#0a0a0a;padding:32px 40px}.header h1{color:#fff;font-size:22px;margin:0;font-weight:700}.header p{color:rgba(255,255,255,.5);font-size:13px;margin:6px 0 0}.badge{display:inline-block;background:#1A50E8;color:#fff;padding:4px 12px;border-radius:100px;font-size:12px;font-weight:600;margin-top:12px}.body{padding:36px 40px}.field{margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid #f0f0f0}.field:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0}.label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#999;margin-bottom:6px}.value{font-size:15px;color:#111;line-height:1.6}.msg{background:#f8f8f8;border-left:3px solid #1A50E8;padding:16px 20px;border-radius:0 8px 8px 0}.footer{padding:20px 40px;background:#f8f8f8;text-align:center;font-size:12px;color:#999}.cta{display:inline-block;margin-top:24px;padding:12px 28px;background:#1A50E8;color:#fff;border-radius:6px;font-size:14px;font-weight:600;text-decoration:none}</style></head>
    <body><div class="wrap">
    <div class="header"><h1>📬 New Contact Form Submission</h1><p>Received ${new Date().toLocaleString('en-US',{timeZone:'Asia/Jakarta'})} WIB</p><span class="badge">${serviceLabel}</span></div>
    <div class="body">
      <div class="field"><div class="label">Name</div><div class="value">${name}</div></div>
      <div class="field"><div class="label">Email</div><div class="value"><a href="mailto:${email}" style="color:#1A50E8">${email}</a></div></div>
      ${company ? `<div class="field"><div class="label">Company</div><div class="value">${company}</div></div>` : ''}
      <div class="field"><div class="label">Service Interest</div><div class="value">${serviceLabel}</div></div>
      <div class="field"><div class="label">Message</div><div class="value msg">${message.replace(/\n/g,'<br>')}</div></div>
      <div style="text-align:center"><a href="mailto:${email}?subject=Re: Your inquiry to IDEA Asia" class="cta">Reply to ${name}</a></div>
    </div>
    <div class="footer">IDEA Asia &nbsp;|&nbsp; <a href="${process.env.SITE_URL||''}" style="color:#1A50E8">${process.env.SITE_URL||''}</a></div>
    </div></body></html>`,
  });
}

async function sendAutoReply({ name, email, service }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return;
  const t = getTransporter();
  const serviceLabel = service ? service.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase()) : 'General Inquiry';
  await t.sendMail({
    from: process.env.EMAIL_FROM || 'IDEA Asia <noreply@idea-asia.com>',
    to: email,
    subject: `Thank you for contacting IDEA Asia, ${name}!`,
    html: `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:-apple-system,sans-serif;margin:0;background:#f5f5f5}.wrap{max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}.header{background:#0a0a0a;padding:40px;text-align:center}.header h1{color:#fff;font-size:26px;margin:0 0 8px;font-weight:800}.header p{color:rgba(255,255,255,.5);margin:0}.body{padding:40px}.body p{font-size:15px;line-height:1.7;color:#444;margin-bottom:16px}.highlight{background:#e8effe;border-radius:8px;padding:20px 24px;margin:24px 0}.highlight p{margin:0;font-size:14px;color:#1A50E8;font-weight:500}.cta-block{text-align:center;margin:32px 0}.cta{display:inline-block;padding:14px 32px;background:#1A50E8;color:#fff;border-radius:6px;font-size:15px;font-weight:600;text-decoration:none}.footer{padding:24px 40px;background:#f8f8f8;text-align:center;font-size:12px;color:#999;border-top:1px solid #eee}</style></head>
    <body><div class="wrap">
    <div class="header"><h1>Thank you, ${name}!</h1><p>We've received your message about ${serviceLabel}</p></div>
    <div class="body">
      <p>Hi <strong>${name}</strong>, thank you for contacting <strong>IDEA Asia</strong>. We've received your inquiry and our team will review it shortly.</p>
      <div class="highlight"><p>⏱️ We typically respond within <strong>1–2 business days</strong> (Mon–Fri, 9AM–6PM WIB).</p></div>
      <p>You can reply to this email if you have any urgent questions.</p>
      <div class="cta-block"><a href="${process.env.SITE_URL||'#'}/services" class="cta">Explore Our Services</a></div>
    </div>
    <div class="footer">© ${new Date().getFullYear()} IDEA — Integrated Digital Ecosystem Asia<br><a href="${process.env.SITE_URL||''}" style="color:#1A50E8">${process.env.SITE_URL||''}</a></div>
    </div></body></html>`,
  });
}

module.exports = { sendContactNotification, sendAutoReply };

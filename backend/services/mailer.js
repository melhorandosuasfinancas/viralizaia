const nodemailer = require('nodemailer');

let _transport = null;

function getTransport() {
  if (_transport) return _transport;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  _transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return _transport;
}

const PLAN_LABELS = { basico: 'Básico', pro: 'Pro', full: 'Full', agencia: 'Agência' };
const PLAN_CLIPS  = { basico: 10, pro: 20, full: 50, agencia: 100 };

async function sendWelcomeEmail(email, plan) {
  const t = getTransport();
  if (!t) { console.log(`[email] SMTP não configurado — boas-vindas não enviado para ${email}`); return; }
  const label = PLAN_LABELS[plan] || plan;
  const clips = PLAN_CLIPS[plan] || 10;
  const from  = process.env.SMTP_FROM || process.env.SMTP_USER;
  try {
    await t.sendMail({
      from: `"Viraliza Cortes" <${from}>`,
      to: email,
      subject: `🎬 Seu plano ${label} está ativo — Viraliza Cortes`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#0a0a0f;color:#f9f9f9;border-radius:12px">
          <h1 style="color:#a855f7;margin-bottom:8px">Viraliza Cortes</h1>
          <h2 style="margin-top:0">Seu plano <strong>${label}</strong> está ativo! 🚀</h2>
          <p>Agora você tem <strong>${clips} clips virais por vídeo</strong>. Cole qualquer link do YouTube e gere seus clips em minutos.</p>
          <a href="https://viralizaia-murex.vercel.app/app"
             style="display:inline-block;background:#7c3aed;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;margin:16px 0">
            Criar meus clips agora →
          </a>
          <hr style="border:none;border-top:1px solid #222;margin:24px 0"/>
          <p style="color:#666;font-size:12px">Dúvidas? Responda este email.</p>
          <p style="color:#444;font-size:11px">Viraliza Cortes — Cortes virais automáticos com IA</p>
        </div>`,
    });
    console.log(`[email] Boas-vindas enviado → ${email} (${plan})`);
  } catch (err) {
    console.error(`[email] Erro ao enviar para ${email}:`, err.message);
  }
}

async function sendCancellationEmail(email) {
  const t = getTransport();
  if (!t) return;
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  try {
    await t.sendMail({
      from: `"Viraliza Cortes" <${from}>`,
      to: email,
      subject: `Assinatura cancelada — Viraliza Cortes`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#0a0a0f;color:#f9f9f9;border-radius:12px">
          <h1 style="color:#a855f7;margin-bottom:8px">Viraliza Cortes</h1>
          <p>Sua assinatura foi cancelada. Você ainda pode usar os créditos restantes até o fim do período.</p>
          <p>Para reativar acesse: <a href="https://viralizaia-murex.vercel.app" style="color:#a855f7">viralizaia-murex.vercel.app</a></p>
          <p style="color:#444;font-size:11px">Viraliza Cortes</p>
        </div>`,
    });
  } catch {}
}

module.exports = { sendWelcomeEmail, sendCancellationEmail };

const fs = require('fs-extra');
const path = require('path');
const https = require('https');

const DATA_FILE = path.join(__dirname, '../data/users.json');
const INTERVAL_MS = 30 * 60 * 1000; // verifica a cada 30 minutos
const ABANDONMENT_HOURS = 8;
const ABANDONMENT_MS = ABANDONMENT_HOURS * 60 * 60 * 1000;

// ─── WhatsApp via Z-API ──────────────────────────────────────────────────────
// Configure no servidor:
//   ZAPI_INSTANCE_ID  — ID da instância no painel Z-API
//   ZAPI_TOKEN        — Token de segurança da instância
async function sendWhatsApp(phone, message) {
  const instanceId = process.env.ZAPI_INSTANCE_ID;
  const token      = process.env.ZAPI_TOKEN;

  if (!instanceId || !token) {
    console.log('[AbandonedCart] WhatsApp não configurado (ZAPI_INSTANCE_ID / ZAPI_TOKEN)');
    return false;
  }

  const data = JSON.stringify({ phone, message });
  const options = {
    hostname: 'api.z-api.io',
    path:     `/instances/${instanceId}/token/${token}/send-text`,
    method:   'POST',
    headers:  { 'Content-Type': 'application/json', 'Content-Length': data.length },
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(true);
        } else {
          console.error('[AbandonedCart] Erro Z-API:', res.statusCode, body);
          resolve(false);
        }
      });
    });
    req.on('error', (e) => {
      console.error('[AbandonedCart] Erro ao enviar WhatsApp:', e.message);
      resolve(false);
    });
    req.write(data);
    req.end();
  });
}

function buildMessage(name, planLink) {
  const firstName = (name || '').split(' ')[0] || 'Oi';
  return (
    `🎬 *${firstName}*, você testou o Viraliza Cortes há ${ABANDONMENT_HOURS} horas!\n\n` +
    `Seus vídeos estão esperando viralizar no TikTok, Reels e Shorts. 🚀\n\n` +
    `Já imaginou transformar 1 hora de conteúdo em *47 clips prontos* em menos de 5 minutos?\n\n` +
    `👉 Assine agora e comece a viralizar:\n${planLink}\n\n` +
    `Temos garantia de 7 dias — sem risco nenhum. ✅`
  );
}

async function runAbandonedCartJob() {
  console.log('[AbandonedCart] Verificando carrinhos abandonados...');
  let store = { users: {}, trials: {} };
  try {
    store = fs.readJsonSync(DATA_FILE);
  } catch {
    return;
  }

  const now = Date.now();
  let updated = false;
  const baseUrl = process.env.FRONTEND_URL || 'https://viralizacortes.com.br';

  for (const [email, userData] of Object.entries(store.users)) {
    // Só processa usuários trial não convertidos, com WhatsApp, sem mensagem enviada
    if (
      userData.active ||
      userData.plan !== 'trial' ||
      !userData.whatsapp ||
      userData.abandonedCartSent ||
      !userData.trialStartedAt
    ) continue;

    const trialAge = now - new Date(userData.trialStartedAt).getTime();
    if (trialAge < ABANDONMENT_MS) continue;

    // Envia mensagem
    const planLink = `${baseUrl}/checkout/pro`;
    const msg = buildMessage(userData.name || email, planLink);
    const sent = await sendWhatsApp(userData.whatsapp, msg);

    if (sent) {
      userData.abandonedCartSent = true;
      userData.abandonedCartSentAt = new Date().toISOString();
      updated = true;
      console.log(`[AbandonedCart] Mensagem enviada para ${email}`);
    }
  }

  if (updated) {
    fs.writeJsonSync(DATA_FILE, store, { spaces: 2 });
  }
  console.log('[AbandonedCart] Verificação concluída.');
}

function startAbandonedCartJob() {
  // Aguarda 5 minutos antes do primeiro check (para o servidor inicializar)
  setTimeout(() => {
    runAbandonedCartJob();
    setInterval(runAbandonedCartJob, INTERVAL_MS);
  }, 5 * 60 * 1000);
  console.log('[AbandonedCart] Job iniciado — verificação a cada 30 minutos.');
}

module.exports = { startAbandonedCartJob };

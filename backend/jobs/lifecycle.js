const cron = require('node-cron');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

const DATA_FILE = path.join(__dirname, '../data/users.json');

async function notifyBot(endpoint, data) {
  const botUrl = process.env.BOT_URL;
  if (!botUrl) {
    console.log('[Lifecycle] BOT_URL não configurada, pulando', endpoint);
    return;
  }
  try {
    await axios.post(`${botUrl}${endpoint}`, data, { timeout: 8000 });
  } catch (e) {
    console.error(`[Lifecycle] Erro ao chamar ${endpoint}:`, e.message);
  }
}

function getNextRenewalDate(resetDay) {
  const now = new Date();
  let d = new Date(now.getFullYear(), now.getMonth(), resetDay);
  if (d.getTime() <= now.getTime()) {
    d = new Date(now.getFullYear(), now.getMonth() + 1, resetDay);
  }
  return d;
}

async function checkLifecycle() {
  let store = { users: {}, trials: {} };
  try { store = fs.readJsonSync(DATA_FILE); } catch { return; }

  const now = Date.now();
  const SIX_DAYS   = 6 * 24 * 60 * 60 * 1000;
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
  const WINDOW_2H  = 2 * 60 * 60 * 1000;
  let updated = false;

  for (const [email, user] of Object.entries(store.users)) {
    if (!user.whatsapp) continue;

    // Trial vencendo: 6 dias após cadastro, usuário ainda não converteu
    if (!user.active && user.plan === 'trial' && user.trialStartedAt && !user.trialReminderSent) {
      const age = now - new Date(user.trialStartedAt).getTime();
      if (age >= SIX_DAYS && age < SIX_DAYS + WINDOW_2H) {
        await notifyBot('/disparar/trial-vencendo', { phone: user.whatsapp, name: user.name });
        user.trialReminderSent = true;
        user.trialReminderSentAt = new Date().toISOString();
        updated = true;
        console.log('[Lifecycle] trial-vencendo:', email);
      }
    }

    // Plano vencendo: 7 dias antes da renovação mensal
    if (user.active && user.plan !== 'trial' && user.creditsResetDay) {
      const nextRenewal = getNextRenewalDate(user.creditsResetDay);
      const msUntil = nextRenewal.getTime() - now;

      // Reseta flag no ciclo seguinte (após a renovação ter passado)
      if (user.renewalReminderSent && msUntil > SEVEN_DAYS + WINDOW_2H) {
        user.renewalReminderSent = false;
        updated = true;
      }

      if (!user.renewalReminderSent && msUntil >= SEVEN_DAYS - WINDOW_2H && msUntil <= SEVEN_DAYS + WINDOW_2H) {
        const renewalDate = nextRenewal.toLocaleDateString('pt-BR');
        await notifyBot('/disparar/plano-vencendo', {
          phone: user.whatsapp, name: user.name, plan: user.plan, renewalDate,
        });
        user.renewalReminderSent = true;
        user.renewalReminderSentAt = new Date().toISOString();
        updated = true;
        console.log('[Lifecycle] plano-vencendo:', email);
      }
    }
  }

  if (updated) fs.writeJsonSync(DATA_FILE, store, { spaces: 2 });
  console.log('[Lifecycle] Verificação concluída.');
}

function startLifecycleJob() {
  cron.schedule('0 */2 * * *', () => {
    checkLifecycle().catch(e => console.error('[Lifecycle] Erro:', e.message));
  });
  console.log('[Lifecycle] Job iniciado — verificação a cada 2 horas.');
}

module.exports = { startLifecycleJob };

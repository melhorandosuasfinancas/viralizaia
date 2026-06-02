const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const path = require('path');

// Arquivo persistente para não perder dados no restart do Render
const DATA_FILE = path.join(__dirname, '../data/users.json');

// Limite de clips por plano
const PLAN_MAX_CLIPS = { trial: 1, starter: 5, pro: 20 };

// Carrega dados do disco ao iniciar
let store = { users: {}, trials: {} };
fs.ensureDirSync(path.dirname(DATA_FILE));
try { store = fs.readJsonSync(DATA_FILE); } catch { /* arquivo não existe ainda */ }

function saveStore() {
  fs.writeJsonSync(DATA_FILE, store, { spaces: 2 });
}

// Webhook da Kiwify para ativar/cancelar assinaturas
router.post('/webhook/kiwify', express.json(), (req, res) => {
  const { event, data } = req.body;
  const secret = req.headers['x-kiwify-token'];

  if (secret !== process.env.KIWIFY_WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const email = data?.customer?.email;
  if (!email) return res.status(400).json({ error: 'Email não encontrado.' });

  switch (event) {
    case 'order.approved':
    case 'subscription.active':
      activateUser(email, data?.product?.id);
      break;
    case 'subscription.canceled':
    case 'subscription.overdue':
      deactivateUser(email);
      break;
  }

  res.json({ received: true });
});

// Verifica se email tem assinatura ativa
router.get('/check/:email', (req, res) => {
  const email = req.params.email;
  const active = isUserActive(email);
  const plan = getUserPlan(email);
  const trialUsed = isTrialUsed(email);
  res.json({ active, plan, trialAvailable: !trialUsed && !active });
});

// Gera token para assinantes (login normal)
router.post('/token', (req, res) => {
  const { email } = req.body;
  if (!isUserActive(email)) {
    return res.status(403).json({ error: 'Assinatura inativa ou não encontrada.' });
  }
  const token = generateToken(email, getUserPlan(email));
  res.json({ token, plan: getUserPlan(email), maxClips: PLAN_MAX_CLIPS[getUserPlan(email)] });
});

// Token de teste gratuito — 1 clip por email, sem assinatura
router.post('/trial', (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'E-mail inválido.' });
  }
  if (isUserActive(email)) {
    // Já assinante, retorna token normal
    const token = generateToken(email, getUserPlan(email));
    return res.json({ token, plan: getUserPlan(email), maxClips: PLAN_MAX_CLIPS[getUserPlan(email)] });
  }
  if (isTrialUsed(email)) {
    return res.status(403).json({ error: 'Você já usou seu clip gratuito. Assine para continuar.' });
  }
  const token = generateToken(email, 'trial');
  res.json({ token, plan: 'trial', maxClips: 1, isTrial: true });
});

// Marca trial como usado (chamado pelo backend ao processar job de trial)
router.post('/trial/use', express.json(), (req, res) => {
  const { email } = req.body;
  if (email) markTrialUsed(email);
  res.json({ ok: true });
});

// Ativação via admin (para testes internos)
router.post('/admin/activate', express.json(), (req, res) => {
  const { email, plan, secret } = req.body;
  if (secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  activateUser(email, plan === 'pro' ? process.env.KIWIFY_PRO_ID : process.env.KIWIFY_STARTER_ID);
  const token = generateToken(email, plan || 'starter');
  res.json({ ok: true, token });
});

// --- Helpers ---

function isUserActive(email) {
  const testEmails = (process.env.TEST_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
  if (testEmails.includes(email?.toLowerCase())) return true;
  return store.users[email?.toLowerCase()]?.active === true;
}

function getUserPlan(email) {
  const testEmails = (process.env.TEST_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
  if (testEmails.includes(email?.toLowerCase())) return 'pro';
  return store.users[email?.toLowerCase()]?.plan || 'starter';
}

function isTrialUsed(email) {
  return !!store.trials[email?.toLowerCase()];
}

function markTrialUsed(email) {
  store.trials[email.toLowerCase()] = { usedAt: new Date().toISOString() };
  saveStore();
}

function activateUser(email, productId) {
  const plan = getPlanFromProduct(productId);
  store.users[email.toLowerCase()] = { active: true, plan, activatedAt: new Date().toISOString() };
  saveStore();
  console.log(`Usuário ativado: ${email} (${plan})`);
}

function deactivateUser(email) {
  if (store.users[email.toLowerCase()]) {
    store.users[email.toLowerCase()].active = false;
    saveStore();
    console.log(`Usuário desativado: ${email}`);
  }
}

function getPlanFromProduct(productId) {
  if (productId === process.env.KIWIFY_PRO_ID) return 'pro';
  if (productId === process.env.KIWIFY_STARTER_ID) return 'starter';
  return 'starter';
}

function generateToken(email, plan) {
  const maxClips = PLAN_MAX_CLIPS[plan] || 5;
  const payload = { email, plan, maxClips, exp: Date.now() + 24 * 60 * 60 * 1000 };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

module.exports = router;
module.exports.PLAN_MAX_CLIPS = PLAN_MAX_CLIPS;

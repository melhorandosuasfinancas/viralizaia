const express = require('express');
const { sendWelcomeEmail, sendCancellationEmail } = require('../services/mailer');
const router = express.Router();
const fs = require('fs-extra');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/users.json');

// Limites de clips por plano
const PLAN_MAX_CLIPS = {
  trial:   2,
  gratis:  2,
  basico:  10,
  pro:     20,
  full:    50,
  agencia: 100,
};

let store = { users: {}, trials: {} };
fs.ensureDirSync(path.dirname(DATA_FILE));
try { store = fs.readJsonSync(DATA_FILE); } catch { /* arquivo nao existe ainda */ }

function saveStore() {
  fs.writeJsonSync(DATA_FILE, store, { spaces: 2 });
}

// ─── Webhook APPMAX ──────────────────────────────────────────────────────────
// Configure no painel APPMAX: Configurações > Webhook > URL do webhook
// URL: https://viralizaia.duckdns.org/api/auth/webhook/appmax
// Variáveis de ambiente necessárias no servidor:
//   APPMAX_WEBHOOK_TOKEN  — token de segurança gerado no painel APPMAX
//   APPMAX_BASICO_ID      — ID do produto "Básico" no APPMAX
//   APPMAX_PRO_ID         — ID do produto "Pro" no APPMAX
//   APPMAX_FULL_ID        — ID do produto "Full" no APPMAX
//   APPMAX_AGENCIA_ID     — ID do produto "Agência" no APPMAX
router.post('/webhook/appmax', express.json(), (req, res) => {
  const body = req.body;
  console.log('[APPMAX WEBHOOK] event:', body.event || body.type, '| email:', (body.data?.customer?.email || body.email || '?'));

  // Autenticação: token no header, query param ou body
  const receivedToken =
    req.headers['x-appmax-token'] ||
    req.headers['authorization']?.replace('Bearer ', '') ||
    req.query.token ||
    body.token ||
    body.access_token;

  if (process.env.APPMAX_WEBHOOK_TOKEN && receivedToken !== process.env.APPMAX_WEBHOOK_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Normaliza evento (APPMAX pode enviar em diferentes formatos)
  const event = (body.event || body.type || '').toLowerCase().replace(/-/g, '_');
  const data  = body.data || body;

  // Extrai email
  const email =
    data?.customer?.email ||
    data?.email ||
    body?.customer?.email ||
    body?.email;

  if (!email) return res.status(400).json({ error: 'Email nao encontrado.' });

  // Extrai product_id e product_name
  const productId =
    String(data?.products?.[0]?.id || '') ||
    String(data?.subscription?.plan_id || '') ||
    String(data?.product_id || '') ||
    String(body?.product_id || '');
  const productName =
    data?.products?.[0]?.name ||
    data?.subscription?.plan_name ||
    body?.products?.[0]?.name ||
    '';

  switch (event) {
    case 'order_approved':
    case 'order_paid':
    case 'payment_approved':
    case 'subscription_activated':
    case 'subscription_active':
    case 'subscription_new':
      activateUser(email, productId, productName);
      break;
    case 'subscription_canceled':
    case 'subscription_cancelled':
    case 'subscription_overdue':
    case 'subscription_suspended':
    case 'chargeback':
    case 'refund':
    case 'order_refunded':
      deactivateUser(email);
      break;
    default:
      // evento desconhecido — ignora silenciosamente
      break;
  }

  res.json({ received: true });
});

// Verificar email
router.get('/check/:email', (req, res) => {
  const email = req.params.email;
  res.json({ active: isUserActive(email), plan: getUserPlan(email), trialAvailable: !isTrialUsed(email) && !isUserActive(email) });
});

// Login normal (assinatura)
router.post('/token', (req, res) => {
  const { email } = req.body;
  if (!isUserActive(email)) return res.status(403).json({ error: 'Assinatura inativa ou nao encontrada.' });
  const plan = getUserPlan(email);
  res.json({ token: generateToken(email, plan), plan, maxClips: PLAN_MAX_CLIPS[plan] || 10 });
});

// Login trial (2 clips grátis)
router.post('/trial', (req, res) => {
  const { email, name } = req.body;
  if (!email || !email.includes('@')) return res.status(400).json({ error: 'E-mail invalido.' });
  if (isUserActive(email)) {
    const plan = getUserPlan(email);
    return res.json({ token: generateToken(email, plan), plan, maxClips: PLAN_MAX_CLIPS[plan] || 10 });
  }
  if (isTrialUsed(email)) return res.status(403).json({ error: 'Voce ja usou seus clips gratuitos. Assine para continuar.' });
  // Registra inicio do trial para carrinho abandonado
  const key = email.toLowerCase();
  if (!store.users[key]) {
    store.users[key] = {
      active: false, plan: 'trial',
      createdAt: new Date().toISOString(),
      trialStartedAt: new Date().toISOString(),
    };
  } else {
    store.users[key].trialStartedAt = store.users[key].trialStartedAt || new Date().toISOString();
  }
  if (name) store.users[key].name = name;
  saveStore();
  res.json({ token: generateToken(email, 'trial'), plan: 'trial', maxClips: PLAN_MAX_CLIPS.trial, isTrial: true });
});

// Login via OAuth (Google) — cria conta trial se nao existir
router.post('/oauth-login', express.json(), (req, res) => {
  const { email, name } = req.body;
  if (!email || !email.includes('@')) return res.status(400).json({ error: 'E-mail invalido.' });
  if (isUserActive(email)) {
    const plan = getUserPlan(email);
    return res.json({ token: generateToken(email, plan), plan, maxClips: PLAN_MAX_CLIPS[plan] || 10 });
  }
  const key = email.toLowerCase();
  if (!store.users[key]) {
    store.users[key] = {
      active: false, plan: 'trial',
      createdAt: new Date().toISOString(),
      trialStartedAt: new Date().toISOString(),
      provider: 'oauth',
    };
  } else {
    store.users[key].trialStartedAt = store.users[key].trialStartedAt || new Date().toISOString();
  }
  if (name) store.users[key].name = name;
  saveStore();
  const trialUsed = isTrialUsed(email);
  res.json({ token: generateToken(email, 'trial'), plan: 'trial', maxClips: PLAN_MAX_CLIPS.trial, isTrial: !trialUsed });
});

// Salvar numero WhatsApp
router.post('/whatsapp', express.json(), (req, res) => {
  const { email, phone } = req.body;
  if (!email || !phone) return res.status(400).json({ error: 'Email e telefone obrigatorios.' });
  const key = email.toLowerCase();
  if (!store.users[key]) store.users[key] = { active: false, plan: 'trial', createdAt: new Date().toISOString() };
  store.users[key].whatsapp = phone.replace(/\D/g, '');
  store.users[key].whatsappUpdatedAt = new Date().toISOString();
  saveStore();
  console.log('WhatsApp registrado:', email, phone);
  res.json({ ok: true });
});

// Marcar trial como usado
router.post('/trial/use', express.json(), (req, res) => {
  const { email } = req.body;
  if (email) markTrialUsed(email);
  res.json({ ok: true });
});

// Admin activate (para testes e ativações manuais)
router.post('/admin/activate', express.json(), (req, res) => {
  const { email, plan, secret } = req.body;
  if (secret !== process.env.ADMIN_SECRET) return res.status(401).json({ error: 'Unauthorized' });
  const validPlans = ['basico', 'pro', 'full', 'agencia'];
  const targetPlan = validPlans.includes(plan) ? plan : 'basico';
  store.users[email.toLowerCase()] = {
    ...store.users[email.toLowerCase()],
    active: true,
    plan: targetPlan,
    activatedAt: new Date().toISOString(),
    activatedBy: 'admin',
  };
  saveStore();
  res.json({ ok: true, token: generateToken(email, targetPlan) });
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
  return store.users[email?.toLowerCase()]?.plan || 'basico';
}

function isTrialUsed(email) { return !!store.trials[email?.toLowerCase()]; }

function markTrialUsed(email) {
  store.trials[email.toLowerCase()] = { usedAt: new Date().toISOString() };
  saveStore();
}

function activateUser(email, productId, productName) {
  const plan = getPlanFromProduct(productId, productName);
  store.users[email.toLowerCase()] = {
    ...store.users[email.toLowerCase()],
    active: true,
    plan,
    activatedAt: new Date().toISOString(),
  };
  saveStore();
  console.log('Usuario ativado:', email, plan);
  sendWelcomeEmail(email, plan).catch(() => {});
}

function deactivateUser(email) {
  if (store.users[email.toLowerCase()]) {
    store.users[email.toLowerCase()].active = false;
    store.users[email.toLowerCase()].deactivatedAt = new Date().toISOString();
    saveStore();
    console.log('Usuario desativado:', email);
    sendCancellationEmail(email).catch(() => {});
  }
}

function getPlanFromProduct(productId, productName) {
  const id = String(productId || '');
  // Primeiro: tenta pelo ID configurado nas env vars
  if (id && id !== 'placeholder') {
    if (id === String(process.env.APPMAX_BASICO_ID  || '')) return 'basico';
    if (id === String(process.env.APPMAX_PRO_ID     || '')) return 'pro';
    if (id === String(process.env.APPMAX_FULL_ID    || '')) return 'full';
    if (id === String(process.env.APPMAX_AGENCIA_ID || '')) return 'agencia';
  }
  // Fallback: detecta pelo nome do produto
  const name = (productName || '').toLowerCase();
  if (name.includes('agencia') || name.includes('agência') || name.includes('agenc')) return 'agencia';
  if (name.includes('full'))    return 'full';
  if (name.includes('pro'))     return 'pro';
  if (name.includes('basico') || name.includes('básico') || name.includes('basic')) return 'basico';
  // Fallback pelo ID numérico como string
  const lower = id.toLowerCase();
  if (lower.includes('agencia') || lower.includes('agência')) return 'agencia';
  if (lower.includes('full'))    return 'full';
  if (lower.includes('pro'))     return 'pro';
  if (lower.includes('basico') || lower.includes('básico')) return 'basico';
  console.log('getPlanFromProduct: plano nao identificado, id=' + id + ', name=' + productName + '. Usando basico.');
  return 'basico';
}

function generateToken(email, plan) {
  const maxClips = PLAN_MAX_CLIPS[plan] || 10;
  const payload = { email, plan, maxClips, exp: Date.now() + 24 * 60 * 60 * 1000 };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}


// ─── Admin Routes ─────────────────────────────────────────────────────────────
function adminAuth(req, res) {
  const secret = req.headers['x-admin-secret'] || req.query.secret || req.body?.secret;
  if (secret !== process.env.ADMIN_SECRET) { res.status(401).json({ error: 'Unauthorized' }); return false; }
  return true;
}

router.get('/admin/stats', (req, res) => {
  if (!adminAuth(req, res)) return;
  const users = Object.entries(store.users).map(([email, d]) => ({ email, ...d }));
  const active = users.filter(u => u.active);
  const byPlan = {};
  active.forEach(u => { byPlan[u.plan] = (byPlan[u.plan] || 0) + 1; });
  const trialUsedCount = Object.keys(store.trials || {}).length;
  res.json({ total: users.length, active: active.length, inactive: users.length - active.length, trialUsed: trialUsedCount, byPlan });
});

router.get('/admin/users', (req, res) => {
  if (!adminAuth(req, res)) return;
  const { plan, status, q, page = 1, limit = 100 } = req.query;
  let users = Object.entries(store.users).map(([email, d]) => ({ email, ...d }));
  if (plan)   users = users.filter(u => u.plan === plan);
  if (status === 'active')   users = users.filter(u => u.active);
  if (status === 'inactive') users = users.filter(u => !u.active);
  if (q)      users = users.filter(u => u.email.toLowerCase().includes(q.toLowerCase()));
  users.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const start = (Number(page) - 1) * Number(limit);
  res.json({ users: users.slice(start, start + Number(limit)), total: users.length });
});

router.patch('/admin/users/:email', express.json(), (req, res) => {
  if (!adminAuth(req, res)) return;
  const email = decodeURIComponent(req.params.email).toLowerCase();
  const { plan, active } = req.body;
  const validPlans = ['trial', 'gratis', 'basico', 'pro', 'full', 'agencia'];
  if (!store.users[email]) store.users[email] = { createdAt: new Date().toISOString() };
  if (plan !== undefined && validPlans.includes(plan)) store.users[email].plan = plan;
  if (active !== undefined) {
    const isActive = active === true || active === 'true';
    store.users[email].active = isActive;
    if (isActive) { store.users[email].activatedAt = new Date().toISOString(); store.users[email].activatedBy = 'admin'; }
    else store.users[email].deactivatedAt = new Date().toISOString();
  }
  saveStore();
  res.json({ ok: true, user: { email, ...store.users[email] } });
});

router.delete('/admin/users/:email', (req, res) => {
  if (!adminAuth(req, res)) return;
  const email = decodeURIComponent(req.params.email).toLowerCase();
  delete store.users[email];
  delete (store.trials || {})[email];
  saveStore();
  res.json({ ok: true });
});


module.exports = router;
module.exports.PLAN_MAX_CLIPS = PLAN_MAX_CLIPS;

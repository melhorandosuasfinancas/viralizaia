const express = require('express');
const { sendWelcomeEmail, sendCancellationEmail } = require('../services/mailer');
const router = express.Router();
const fs = require('fs-extra');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/users.json');

// Maximo de clips por video (limite de processamento por job)
const PLAN_MAX_CLIPS = {
  trial:   2,
  gratis:  2,
  basico:  10,
  pro:     20,
  full:    50,
  agencia: 100,
};

// Creditos mensais por plano (resetam no mesmo dia da ativacao)
const PLAN_MONTHLY_CREDITS = {
  trial:   2,
  gratis:  2,
  basico:  10,
  pro:     20,
  full:    50,
  agencia: 100,
};

// Pacotes avulsos — mais caro por credito que qualquer plano
// Starter: 5 por R$19,90 | Plus: 10 por R$34,90 | Max: 20 por R$59,90
const AVULSO_PACKS = {
  'starter':  5,
  'pack 5':   5,
  'pack5':    5,
  'plus':     10,
  'pack 10':  10,
  'pack10':   10,
  'max':      20,
  'pack 20':  20,
  'pack20':   20,
  'credito':  0, // fallback, nao e avulso
};

let store = { users: {}, trials: {} };
fs.ensureDirSync(path.dirname(DATA_FILE));
try { store = fs.readJsonSync(DATA_FILE); } catch { /* arquivo nao existe ainda */ }

function saveStore() {
  fs.writeJsonSync(DATA_FILE, store, { spaces: 2 });
}

// ─── Sistema de Creditos ──────────────────────────────────────────────────────

function initCredits(key, plan, activatedAt) {
  const monthly = PLAN_MONTHLY_CREDITS[plan] || 0;
  const resetDay = new Date(activatedAt || Date.now()).getDate();
  store.users[key].monthlyCredits   = monthly;
  store.users[key].creditsResetDay  = resetDay;
  store.users[key].creditsResetAt   = activatedAt || new Date().toISOString();
  if (store.users[key].avulsoCredits === undefined) store.users[key].avulsoCredits = 0;
  if (store.users[key].totalCreditsUsed === undefined) store.users[key].totalCreditsUsed = 0;
}

function checkAndResetMonthlyCredits(key) {
  const user = store.users[key];
  if (!user || !user.active || user.plan === 'trial') return;
  const now = new Date();
  const resetDay = user.creditsResetDay || 1;
  const lastReset = user.creditsResetAt ? new Date(user.creditsResetAt) : null;
  if (!lastReset) return;
  const sameDay = now.getDate() === resetDay;
  const differentMonth = now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear();
  if (sameDay && differentMonth) {
    const monthly = PLAN_MONTHLY_CREDITS[user.plan] || 0;
    user.monthlyCredits = monthly;
    user.creditsResetAt = now.toISOString();
    saveStore();
    console.log('[CREDITS] Reset mensal:', key, '->', monthly, 'creditos (dia', resetDay + ')');
  }
}

function getRemainingCredits(email) {
  const key = email.toLowerCase();
  checkAndResetMonthlyCredits(key);
  const user = store.users[key];
  if (!user) return { monthly: 0, avulso: 0, total: 0 };
  const monthly = user.monthlyCredits !== undefined ? user.monthlyCredits : 0;
  const avulso  = user.avulsoCredits  !== undefined ? user.avulsoCredits  : 0;
  return { monthly, avulso, total: monthly + avulso };
}

function deductCredits(email, count) {
  const key = email.toLowerCase();
  checkAndResetMonthlyCredits(key);
  const user = store.users[key];
  if (!user || count <= 0) return;
  let remaining = count;
  // Deduz do mensal primeiro
  const fromMonthly = Math.min(remaining, user.monthlyCredits || 0);
  user.monthlyCredits = (user.monthlyCredits || 0) - fromMonthly;
  remaining -= fromMonthly;
  // Resto do avulso
  if (remaining > 0) {
    const fromAvulso = Math.min(remaining, user.avulsoCredits || 0);
    user.avulsoCredits = (user.avulsoCredits || 0) - fromAvulso;
  }
  user.totalCreditsUsed = (user.totalCreditsUsed || 0) + count;
  saveStore();
  console.log('[CREDITS] Deducted', count, 'from', key, '| monthly:', user.monthlyCredits, '| avulso:', user.avulsoCredits);
}

function addAvulsoCredits(email, count) {
  const key = email.toLowerCase();
  if (!store.users[key]) {
    store.users[key] = { active: false, plan: 'trial', createdAt: new Date().toISOString(), avulsoCredits: 0, monthlyCredits: 0, totalCreditsUsed: 0 };
  }
  store.users[key].avulsoCredits = (store.users[key].avulsoCredits || 0) + count;
  saveStore();
  console.log('[CREDITS] Avulso:', key, '+' + count, '-> total avulso:', store.users[key].avulsoCredits);
}

// ─── Webhook APPMAX ──────────────────────────────────────────────────────────
router.post('/webhook/appmax', express.json(), (req, res) => {
  const body = req.body;
  console.log('[APPMAX WEBHOOK] event:', body.event || body.type, '| email:', (body.data && body.data.customer && body.data.customer.email) || body.email || '?');

  const receivedToken =
    req.headers['x-appmax-token'] ||
    (req.headers['authorization'] || '').replace('Bearer ', '') ||
    req.query.token ||
    body.token ||
    body.access_token;

  if (process.env.APPMAX_WEBHOOK_TOKEN && receivedToken !== process.env.APPMAX_WEBHOOK_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const event = (body.event || body.type || '').toLowerCase().replace(/-/g, '_');
  const data  = body.data || body;

  const email =
    (data.customer && data.customer.email) ||
    data.email ||
    (body.customer && body.customer.email) ||
    body.email;

  if (!email) return res.status(400).json({ error: 'Email nao encontrado.' });

  const productId =
    String((data.products && data.products[0] && data.products[0].id) || '') ||
    String((data.subscription && data.subscription.plan_id) || '') ||
    String(data.product_id || '') ||
    String(body.product_id || '');
  const productName =
    (data.products && data.products[0] && data.products[0].name) ||
    (data.subscription && data.subscription.plan_name) ||
    (body.products && body.products[0] && body.products[0].name) ||
    '';

  switch (event) {
    case 'order_approved':
    case 'order_paid':
    case 'payment_approved':
    case 'subscription_activated':
    case 'subscription_active':
    case 'subscription_new': {
      const avulsoQty = getAvulsoCreditsFromProduct(productId, productName);
      if (avulsoQty > 0) {
        addAvulsoCredits(email, avulsoQty);
        console.log('[AVULSO] Adicionado', avulsoQty, 'creditos para', email);
      } else {
        activateUser(email, productId, productName);
      }
      break;
    }
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
      break;
  }

  res.json({ received: true });
});

// Verificar email
router.get('/check/:email', (req, res) => {
  const email = req.params.email;
  const credits = getRemainingCredits(email);
  res.json({ active: isUserActive(email), plan: getUserPlan(email), trialAvailable: !isTrialUsed(email) && !isUserActive(email), credits });
});

// Creditos restantes do usuario
router.get('/credits/:email', (req, res) => {
  const email = decodeURIComponent(req.params.email);
  res.json(getRemainingCredits(email));
});

// Login normal (assinatura)
router.post('/token', (req, res) => {
  const { email } = req.body;
  if (!isUserActive(email)) return res.status(403).json({ error: 'Assinatura inativa ou nao encontrada.' });
  const plan = getUserPlan(email);
  const credits = getRemainingCredits(email);
  res.json({ token: generateToken(email, plan), plan, maxClips: PLAN_MAX_CLIPS[plan] || 10, credits });
});

// Login trial (2 clips gratis)
router.post('/trial', (req, res) => {
  const { email, name } = req.body;
  if (!email || !email.includes('@')) return res.status(400).json({ error: 'E-mail invalido.' });
  if (isUserActive(email)) {
    const plan = getUserPlan(email);
    const credits = getRemainingCredits(email);
    return res.json({ token: generateToken(email, plan), plan, maxClips: PLAN_MAX_CLIPS[plan] || 10, credits });
  }
  if (isTrialUsed(email)) return res.status(403).json({ error: 'Voce ja usou seus clips gratuitos. Assine para continuar.' });
  const key = email.toLowerCase();
  if (!store.users[key]) {
    store.users[key] = {
      active: false, plan: 'trial',
      createdAt: new Date().toISOString(),
      trialStartedAt: new Date().toISOString(),
      monthlyCredits: PLAN_MONTHLY_CREDITS.trial,
      avulsoCredits: 0,
      totalCreditsUsed: 0,
    };
  } else {
    store.users[key].trialStartedAt = store.users[key].trialStartedAt || new Date().toISOString();
    if (store.users[key].monthlyCredits === undefined) store.users[key].monthlyCredits = PLAN_MONTHLY_CREDITS.trial;
    if (store.users[key].avulsoCredits  === undefined) store.users[key].avulsoCredits  = 0;
  }
  if (name) store.users[key].name = name;
  saveStore();
  const credits = getRemainingCredits(email);
  res.json({ token: generateToken(email, 'trial'), plan: 'trial', maxClips: PLAN_MAX_CLIPS.trial, isTrial: true, credits });
});

// Login via OAuth (Google)
router.post('/oauth-login', express.json(), (req, res) => {
  const { email, name } = req.body;
  if (!email || !email.includes('@')) return res.status(400).json({ error: 'E-mail invalido.' });
  if (isUserActive(email)) {
    const plan = getUserPlan(email);
    const credits = getRemainingCredits(email);
    return res.json({ token: generateToken(email, plan), plan, maxClips: PLAN_MAX_CLIPS[plan] || 10, credits });
  }
  const key = email.toLowerCase();
  if (!store.users[key]) {
    store.users[key] = {
      active: false, plan: 'trial',
      createdAt: new Date().toISOString(),
      trialStartedAt: new Date().toISOString(),
      provider: 'oauth',
      monthlyCredits: PLAN_MONTHLY_CREDITS.trial,
      avulsoCredits: 0,
      totalCreditsUsed: 0,
    };
  } else {
    store.users[key].trialStartedAt = store.users[key].trialStartedAt || new Date().toISOString();
    if (store.users[key].monthlyCredits === undefined) store.users[key].monthlyCredits = PLAN_MONTHLY_CREDITS.trial;
    if (store.users[key].avulsoCredits  === undefined) store.users[key].avulsoCredits  = 0;
  }
  if (name) store.users[key].name = name;
  saveStore();
  const trialUsed = isTrialUsed(email);
  const credits = getRemainingCredits(email);
  res.json({ token: generateToken(email, 'trial'), plan: 'trial', maxClips: PLAN_MAX_CLIPS.trial, isTrial: !trialUsed, credits });
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

// Admin activate (para testes e ativacoes manuais)
router.post('/admin/activate', express.json(), (req, res) => {
  const { email, plan, secret } = req.body;
  if (secret !== process.env.ADMIN_SECRET) return res.status(401).json({ error: 'Unauthorized' });
  const validPlans = ['basico', 'pro', 'full', 'agencia'];
  const targetPlan = validPlans.includes(plan) ? plan : 'basico';
  const key = email.toLowerCase();
  const now = new Date().toISOString();
  store.users[key] = {
    ...store.users[key],
    active: true,
    plan: targetPlan,
    activatedAt: now,
    activatedBy: 'admin',
  };
  initCredits(key, targetPlan, now);
  saveStore();
  const credits = getRemainingCredits(email);
  res.json({ ok: true, token: generateToken(email, targetPlan), credits });
});

// Admin: adicionar creditos avulsos manualmente
router.post('/admin/add-credits', express.json(), (req, res) => {
  if (!adminAuth(req, res)) return;
  const { email, credits } = req.body;
  if (!email || !credits || isNaN(credits)) return res.status(400).json({ error: 'Email e credits necessarios.' });
  addAvulsoCredits(email, parseInt(credits));
  res.json({ ok: true, avulsoCredits: store.users[email.toLowerCase()] && store.users[email.toLowerCase()].avulsoCredits });
});

// --- Helpers ---
function isUserActive(email) {
  const testEmails = (process.env.TEST_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
  if (testEmails.includes(email && email.toLowerCase())) return true;
  return store.users[email && email.toLowerCase()] && store.users[email.toLowerCase()].active === true;
}

function getUserPlan(email) {
  const testEmails = (process.env.TEST_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
  if (testEmails.includes(email && email.toLowerCase())) return 'pro';
  return (store.users[email && email.toLowerCase()] && store.users[email.toLowerCase()].plan) || 'basico';
}

function isTrialUsed(email) { return !!(store.trials[email && email.toLowerCase()]); }

function markTrialUsed(email) {
  store.trials[email.toLowerCase()] = { usedAt: new Date().toISOString() };
  saveStore();
}

function activateUser(email, productId, productName) {
  const plan = getPlanFromProduct(productId, productName);
  const key = email.toLowerCase();
  const now = new Date().toISOString();
  store.users[key] = {
    ...store.users[key],
    active: true,
    plan,
    activatedAt: now,
  };
  initCredits(key, plan, now);
  saveStore();
  console.log('Usuario ativado:', email, plan);
  sendWelcomeEmail(email, plan).catch(function() {});
}

function deactivateUser(email) {
  if (store.users[email.toLowerCase()]) {
    store.users[email.toLowerCase()].active = false;
    store.users[email.toLowerCase()].deactivatedAt = new Date().toISOString();
    saveStore();
    console.log('Usuario desativado:', email);
    sendCancellationEmail(email).catch(function() {});
  }
}

function getPlanFromProduct(productId, productName) {
  const id = String(productId || '');
  if (id && id !== 'placeholder') {
    if (id === String(process.env.APPMAX_BASICO_ID  || '')) return 'basico';
    if (id === String(process.env.APPMAX_PRO_ID     || '')) return 'pro';
    if (id === String(process.env.APPMAX_FULL_ID    || '')) return 'full';
    if (id === String(process.env.APPMAX_AGENCIA_ID || '')) return 'agencia';
  }
  const name = (productName || '').toLowerCase();
  if (name.includes('agencia') || name.includes('agencia') || name.includes('agenc')) return 'agencia';
  if (name.includes('full'))    return 'full';
  if (name.includes('pro'))     return 'pro';
  if (name.includes('basico') || name.includes('basico') || name.includes('basic')) return 'basico';
  const lower = id.toLowerCase();
  if (lower.includes('agencia')) return 'agencia';
  if (lower.includes('full'))    return 'full';
  if (lower.includes('pro'))     return 'pro';
  if (lower.includes('basico'))  return 'basico';
  console.log('getPlanFromProduct: plano nao identificado, id=' + id + ', name=' + productName + '. Usando basico.');
  return 'basico';
}

function getAvulsoCreditsFromProduct(productId, productName) {
  const id = String(productId || '');
  if (id && id !== 'placeholder') {
    if (id === String(process.env.APPMAX_AVULSO_STARTER_ID || '')) return 5;
    if (id === String(process.env.APPMAX_AVULSO_PLUS_ID    || '')) return 10;
    if (id === String(process.env.APPMAX_AVULSO_MAX_ID     || '')) return 20;
  }
  const name = (productName || '').toLowerCase();
  if (name.includes('starter') || name.includes('pack 5') || name.includes('pack5')) return 5;
  if (name.includes('plus')    || name.includes('pack 10') || name.includes('pack10')) return 10;
  if (name.includes('max')     || name.includes('pack 20') || name.includes('pack20')) return 20;
  return 0;
}

function generateToken(email, plan) {
  const maxClips = PLAN_MAX_CLIPS[plan] || 10;
  const payload = { email, plan, maxClips, exp: Date.now() + 24 * 60 * 60 * 1000 };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

// ─── Admin Routes ─────────────────────────────────────────────────────────────
function adminAuth(req, res) {
  const secret = req.headers['x-admin-secret'] || req.query.secret || (req.body && req.body.secret);
  if (secret !== process.env.ADMIN_SECRET) { res.status(401).json({ error: 'Unauthorized' }); return false; }
  return true;
}

router.get('/admin/stats', (req, res) => {
  if (!adminAuth(req, res)) return;
  const users = Object.entries(store.users).map(function(entry) { return Object.assign({ email: entry[0] }, entry[1]); });
  const active = users.filter(function(u) { return u.active; });
  const byPlan = {};
  active.forEach(function(u) { byPlan[u.plan] = (byPlan[u.plan] || 0) + 1; });
  const trialUsedCount = Object.keys(store.trials || {}).length;
  res.json({ total: users.length, active: active.length, inactive: users.length - active.length, trialUsed: trialUsedCount, byPlan });
});

router.get('/admin/users', (req, res) => {
  if (!adminAuth(req, res)) return;
  const { plan, status, q, page = 1, limit = 100 } = req.query;
  let users = Object.entries(store.users).map(function(entry) {
    const email = entry[0];
    checkAndResetMonthlyCredits(email);
    return Object.assign({ email }, entry[1], { credits: getRemainingCredits(email) });
  });
  if (plan)   users = users.filter(function(u) { return u.plan === plan; });
  if (status === 'active')   users = users.filter(function(u) { return u.active; });
  if (status === 'inactive') users = users.filter(function(u) { return !u.active; });
  if (q)      users = users.filter(function(u) { return u.email.toLowerCase().includes(q.toLowerCase()); });
  users.sort(function(a, b) { return new Date(b.createdAt || 0) - new Date(a.createdAt || 0); });
  const start = (Number(page) - 1) * Number(limit);
  res.json({ users: users.slice(start, start + Number(limit)), total: users.length });
});

router.patch('/admin/users/:email', express.json(), (req, res) => {
  if (!adminAuth(req, res)) return;
  const email = decodeURIComponent(req.params.email).toLowerCase();
  const { plan, active, avulsoCredits, monthlyCredits } = req.body;
  const validPlans = ['trial', 'gratis', 'basico', 'pro', 'full', 'agencia'];
  if (!store.users[email]) store.users[email] = { createdAt: new Date().toISOString() };
  if (plan !== undefined && validPlans.includes(plan)) {
    store.users[email].plan = plan;
    initCredits(email, plan, store.users[email].activatedAt || new Date().toISOString());
  }
  if (active !== undefined) {
    const isActive = active === true || active === 'true';
    store.users[email].active = isActive;
    if (isActive) { store.users[email].activatedAt = new Date().toISOString(); store.users[email].activatedBy = 'admin'; }
    else store.users[email].deactivatedAt = new Date().toISOString();
  }
  if (avulsoCredits !== undefined) store.users[email].avulsoCredits  = parseInt(avulsoCredits);
  if (monthlyCredits !== undefined) store.users[email].monthlyCredits = parseInt(monthlyCredits);
  saveStore();
  res.json({ ok: true, user: Object.assign({ email }, store.users[email], { credits: getRemainingCredits(email) }) });
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
module.exports.getRemainingCredits = getRemainingCredits;
module.exports.deductCredits = deductCredits;

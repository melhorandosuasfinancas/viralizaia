const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/users.json');

const PLAN_MAX_CLIPS = { trial: 1, starter: 15, pro: 40 };

let store = { users: {}, trials: {} };
fs.ensureDirSync(path.dirname(DATA_FILE));
try { store = fs.readJsonSync(DATA_FILE); } catch { /* arquivo nao existe ainda */ }

function saveStore() {
  fs.writeJsonSync(DATA_FILE, store, { spaces: 2 });
}

// Webhook Kiwify
router.post('/webhook/kiwify', express.json(), (req, res) => {
  const { event, data } = req.body;
  const secret = req.headers['x-kiwify-token'];
  if (secret !== process.env.KIWIFY_WEBHOOK_SECRET) return res.status(401).json({ error: 'Unauthorized' });
  const email = data?.customer?.email;
  if (!email) return res.status(400).json({ error: 'Email nao encontrado.' });
  switch (event) {
    case 'order.approved':
    case 'subscription.active':
      activateUser(email, data?.product?.id); break;
    case 'subscription.canceled':
    case 'subscription.overdue':
      deactivateUser(email); break;
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
  res.json({ token: generateToken(email, getUserPlan(email)), plan: getUserPlan(email), maxClips: PLAN_MAX_CLIPS[getUserPlan(email)] });
});

// Login trial
router.post('/trial', (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) return res.status(400).json({ error: 'E-mail invalido.' });
  if (isUserActive(email)) {
    const plan = getUserPlan(email);
    return res.json({ token: generateToken(email, plan), plan, maxClips: PLAN_MAX_CLIPS[plan] });
  }
  if (isTrialUsed(email)) return res.status(403).json({ error: 'Voce ja usou seu clip gratuito. Assine para continuar.' });
  res.json({ token: generateToken(email, 'trial'), plan: 'trial', maxClips: 1, isTrial: true });
});

// Login via OAuth (Google/Facebook) — cria conta trial se nao existir
router.post('/oauth-login', express.json(), (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) return res.status(400).json({ error: 'E-mail invalido.' });
  if (isUserActive(email)) {
    const plan = getUserPlan(email);
    return res.json({ token: generateToken(email, plan), plan, maxClips: PLAN_MAX_CLIPS[plan] });
  }
  // Novo usuario OAuth: cria entrada no store (nao usa trial ainda — clip gratis ao processar)
  if (!store.users[email.toLowerCase()]) {
    store.users[email.toLowerCase()] = { active: false, plan: 'trial', createdAt: new Date().toISOString(), provider: 'oauth' };
    saveStore();
  }
  const trialUsed = isTrialUsed(email);
  res.json({ token: generateToken(email, 'trial'), plan: 'trial', maxClips: 1, isTrial: !trialUsed });
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

// Admin activate
router.post('/admin/activate', express.json(), (req, res) => {
  const { email, plan, secret } = req.body;
  if (secret !== process.env.ADMIN_SECRET) return res.status(401).json({ error: 'Unauthorized' });
  activateUser(email, plan === 'pro' ? process.env.KIWIFY_PRO_ID : process.env.KIWIFY_STARTER_ID);
  res.json({ ok: true, token: generateToken(email, plan || 'starter') });
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

function isTrialUsed(email) { return !!store.trials[email?.toLowerCase()]; }

function markTrialUsed(email) {
  store.trials[email.toLowerCase()] = { usedAt: new Date().toISOString() };
  saveStore();
}

function activateUser(email, productId) {
  const plan = getPlanFromProduct(productId);
  store.users[email.toLowerCase()] = { ...store.users[email.toLowerCase()], active: true, plan, activatedAt: new Date().toISOString() };
  saveStore();
  console.log('Usuario ativado:', email, plan);
}

function deactivateUser(email) {
  if (store.users[email.toLowerCase()]) {
    store.users[email.toLowerCase()].active = false;
    saveStore();
    console.log('Usuario desativado:', email);
  }
}

function getPlanFromProduct(productId) {
  if (productId === process.env.KIWIFY_PRO_ID) return 'pro';
  if (productId === process.env.KIWIFY_STARTER_ID) return 'starter';
  return 'starter';
}

function generateToken(email, plan) {
  const maxClips = PLAN_MAX_CLIPS[plan] || 15;
  const payload = { email, plan, maxClips, exp: Date.now() + 24 * 60 * 60 * 1000 };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

module.exports = router;
module.exports.PLAN_MAX_CLIPS = PLAN_MAX_CLIPS;

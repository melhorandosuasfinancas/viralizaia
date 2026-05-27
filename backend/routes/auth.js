const express = require('express');
const router = express.Router();

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

// Verifica se email tem assinatura ativa (chamado pelo frontend)
router.get('/check/:email', (req, res) => {
  const active = isUserActive(req.params.email);
  res.json({ active });
});

// Gera token temporário para o app (validade 24h)
router.post('/token', (req, res) => {
  const { email } = req.body;
  if (!isUserActive(email)) {
    return res.status(403).json({ error: 'Assinatura inativa ou não encontrada.' });
  }
  const token = generateToken(email);
  res.json({ token });
});

// Ativa usuário diretamente via admin (para testes)
router.post('/admin/activate', express.json(), (req, res) => {
  const { email, plan, secret } = req.body;
  if (secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  activateUser(email, plan === 'pro' ? process.env.KIWIFY_PRO_ID : process.env.KIWIFY_STARTER_ID);
  const token = generateToken(email);
  res.json({ ok: true, token });
});

// Armazenamento em memória (produção: Supabase/PostgreSQL)
const activeUsers = new Map();

function activateUser(email, productId) {
  activeUsers.set(email.toLowerCase(), {
    active: true,
    plan: getPlanFromProduct(productId),
    activatedAt: new Date().toISOString()
  });
  console.log(`Usuário ativado: ${email}`);
}

function deactivateUser(email) {
  const user = activeUsers.get(email.toLowerCase());
  if (user) {
    user.active = false;
    console.log(`Usuário desativado: ${email}`);
  }
}

function isUserActive(email) {
  const user = activeUsers.get(email?.toLowerCase());
  return user?.active === true;
}

function getPlanFromProduct(productId) {
  const plans = {
    [process.env.KIWIFY_STARTER_ID]: 'starter',
    [process.env.KIWIFY_PRO_ID]: 'pro'
  };
  return plans[productId] || 'starter';
}

function generateToken(email) {
  const payload = { email, exp: Date.now() + 24 * 60 * 60 * 1000 };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

module.exports = router;

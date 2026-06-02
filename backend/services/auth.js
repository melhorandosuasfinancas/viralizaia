// Middleware de verificação de assinatura — extrai email e plano do token
function verifySubscription(req, res, next) {
  if (process.env.NODE_ENV === 'development') {
    req.userEmail = 'dev@test.com';
    req.userPlan = 'pro';
    return next();
  }

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Token de autenticação necessário.' });
  }

  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));

    if (payload.exp < Date.now()) {
      return res.status(401).json({ error: 'Token expirado. Faça login novamente.' });
    }

    req.userEmail = payload.email;
    req.userPlan = payload.plan || 'starter'; // trial | starter | pro
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido.' });
  }
}

module.exports = { verifySubscription };

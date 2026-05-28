require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs-extra');

const videoRoutes = require('./routes/video');
const authRoutes = require('./routes/auth');
const { cleanupOldFiles } = require('./services/cleanup');

const app = express();
const PORT = process.env.PORT || 3001;

// Render (and most PaaS) puts a proxy in front — trust it so rate-limit sees real IPs
app.set('trust proxy', 1);

// Diretórios de trabalho
const DIRS = ['./temp', './output', './uploads'];
DIRS.forEach(dir => fs.ensureDirSync(dir));

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Muitas requisições. Aguarde alguns minutos.' }
});
app.use('/api/', limiter);

app.use('/api/video', videoRoutes);
app.use('/api/auth', authRoutes);

// Servir arquivos de output para download
app.use('/download', express.static(path.join(__dirname, 'output')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', service: 'ViralizaIA Backend' });
});

// Limpeza automática a cada 2 horas
setInterval(cleanupOldFiles, 2 * 60 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`ViralizaIA Backend rodando na porta ${PORT}`);
});

module.exports = app;

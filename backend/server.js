require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs-extra');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

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
  max: 60,
  message: { error: 'Muitas requisições. Aguarde alguns minutos.' }
});
// Status polling precisa de limite mais generoso (frontend faz poll a cada 3s por ~2min = ~40 req)
const statusLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { error: 'Muitas requisições.' }
});
app.use('/api/video/status', statusLimiter);
app.use('/api/', limiter);

app.use('/api/video', videoRoutes);
app.use('/api/auth', authRoutes);

// Servir arquivos de output para download
app.use('/download', express.static(path.join(__dirname, 'output')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', service: 'ViralizaIA Backend' });
});

const os = require('os');
const COOKIES_FILE_DBG = path.join(os.tmpdir(), 'yt-cookies-debug.txt');

app.get('/debug/formats', async (req, res) => {
  if (req.query.secret !== 'vrlz_dbg_2026') {
    return res.status(403).json({ error: 'forbidden' });
  }
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'url required' });
  const client = req.query.client || 'web';
  const useCookies = req.query.cookies !== '0' && process.env.YOUTUBE_COOKIES_B64;

  let cookiesArg = '';
  if (useCookies) {
    await fs.writeFile(COOKIES_FILE_DBG, Buffer.from(process.env.YOUTUBE_COOKIES_B64, 'base64').toString('utf8'));
    cookiesArg = `--cookies "${COOKIES_FILE_DBG}"`;
  }

  try {
    const cmd = `yt-dlp --list-formats --extractor-args "youtube:player_client=${client}" --no-check-certificate --verbose --js-runtimes bun:/root/.bun/bin/bun --remote-components ejs:github ${cookiesArg} "${url}"`;
    const { stdout, stderr } = await execAsync(cmd, { timeout: 60000 });
    res.type('text').send('STDOUT:\n' + stdout + '\nSTDERR:\n' + stderr);
  } catch (err) {
    res.type('text').send('ERROR:\n' + (err.stderr || err.message || '') + '\nSTDOUT:\n' + (err.stdout || ''));
  }
});

app.get('/debug/env', async (req, res) => {
  if (req.query.secret !== 'vrlz_dbg_2026') return res.status(403).json({ error: 'forbidden' });
  try {
    const { stdout } = await execAsync(
      'echo "PATH=$PATH" && ' +
      '(which bun && bun --version || echo "bun: NOT FOUND") && ' +
      '(which node && node --version || echo "node: NOT FOUND") && ' +
      '(ls -la /root/.bun/bin/ 2>/dev/null || echo "/root/.bun/bin: missing") && ' +
      '(ls -la /usr/local/bin/bun 2>/dev/null || echo "/usr/local/bin/bun: missing") && ' +
      'echo "--- exec test ---" && ' +
      '(bun -e "process.stdout.write(String(1+2))" 2>&1 || echo "bun exec FAILED") && ' +
      '(node -e "process.stdout.write(String(1+2))" 2>&1 || echo "node exec FAILED") && ' +
      'echo "--- yt-dlp jsc options ---" && ' +
      '(yt-dlp --help 2>&1 | grep -i "jsc\\|runtime\\|challenge" || echo "no jsc opts") && ' +
      'echo "--- bun version ---" && (bun --version 2>&1)',
      { timeout: 20000 }
    );
    res.type('text').send(stdout);
  } catch (err) {
    res.type('text').send('ERROR:\n' + (err.stdout || '') + '\n' + err.message);
  }
});

// Limpeza automática a cada 2 horas
setInterval(cleanupOldFiles, 2 * 60 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`ViralizaIA Backend rodando na porta ${PORT}`);
});

module.exports = app;

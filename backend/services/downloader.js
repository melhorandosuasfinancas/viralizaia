const { exec } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const https = require('https');
const http = require('http');
const { promisify } = require('util');
const os = require('os');

const execAsync = promisify(exec);

const MAX_DURATION_SECONDS = 1200; // 20 minutos
const COOKIES_FILE = path.join(os.tmpdir(), 'yt-cookies.txt');

// Instâncias públicas do Invidious (fallback)
const INVIDIOUS_INSTANCES = [
  'https://inv.thepixora.com',
  'https://inv.nadeko.net',
  'https://y.com.sb',
  'https://invidious.perennialte.ch'
];

// Player clients do yt-dlp para tentar em sequência
// tv_embedded foi removido no yt-dlp v2026.03.17
const PLAYER_CLIENTS = ['web', 'mweb', 'android', 'ios', 'android_embedded', 'web_creator'];

let cookiesReady = false;

async function ensureCookies() {
  if (cookiesReady) return;
  const b64 = process.env.YOUTUBE_COOKIES_B64;
  if (b64) {
    await fs.writeFile(COOKIES_FILE, Buffer.from(b64, 'base64').toString('utf8'));
    cookiesReady = true;
  }
}

function cookiesArg() {
  return process.env.YOUTUBE_COOKIES_B64 ? `--cookies "${COOKIES_FILE}"` : '';
}

function extractVideoId(url) {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  return m ? m[1] : null;
}

function fetchJson(url, redirects = 0) {
  if (redirects > 5) return Promise.reject(new Error('Too many redirects'));
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { timeout: 15000 }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        res.resume();
        const location = res.headers.location;
        if (!location) return reject(new Error('Redirect without location'));
        return fetchJson(location, redirects + 1).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Invalid JSON')); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function buildYtDlpCmd(url, outputPath, playerClient) {
  return [
    'yt-dlp',
    '--format', '"bestvideo[height<=720]+bestaudio/best[height<=720]/bestvideo+bestaudio/best"',
    '--merge-output-format', 'mp4',
    '--output', `"${outputPath}"`,
    '--no-playlist',
    '--quiet',
    '--extractor-args', `"youtube:player_client=${playerClient}"`,
    '--no-check-certificate',
    '--concurrent-fragments', '1',
    '--no-warnings',
    '--js-runtimes', 'node:/usr/local/bin/node',
    cookiesArg(),
    `"${url}"`
  ].filter(Boolean).join(' ');
}

async function tryYtDlp(url, outputDir) {
  const outputPath = path.join(outputDir, 'source.%(ext)s');

  for (const client of PLAYER_CLIENTS) {
    console.log(`yt-dlp tentando player_client=${client}...`);
    const cmd = buildYtDlpCmd(url, outputPath, client);
    try {
      await execAsync(cmd, { timeout: 180000 });
      const files = await fs.readdir(outputDir);
      const videoFile = files.find(f => f.startsWith('source.') && f.endsWith('.mp4'));
      if (videoFile) {
        console.log(`yt-dlp sucesso com cliente: ${client}`);
        return path.join(outputDir, videoFile);
      }
    } catch (err) {
      const stderr = (err.stderr || '').toLowerCase();
      const msg = (err.message || '').toLowerCase();
      const errText = stderr || msg;
      const isBlocked = errText.includes('429') || errText.includes('sign in') || errText.includes('bot')
        || errText.includes('precondition') || errText.includes('forbidden') || errText.includes('403')
        || errText.includes('nsig') || errText.includes('cipher');
      const errShort = (err.stderr || err.message || '').slice(0, 300);
      console.log(`yt-dlp cliente ${client} falhou (blocked=${isBlocked}): ${errShort}`);
      // Tenta próximo cliente independente do erro
    }
  }

  return null; // todos os clientes falharam
}

async function downloadViaInvidious(url, outputDir) {
  const videoId = extractVideoId(url);
  if (!videoId) throw new Error('URL inválida');

  let lastError = 'Nenhuma instância disponível';
  let videoData = null;
  let usedInstance = null;

  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      console.log(`Tentando Invidious: ${instance}`);
      videoData = await fetchJson(`${instance}/api/v1/videos/${videoId}`);

      if (videoData && videoData.error) {
        const errLower = videoData.error.toLowerCase();
        // Detecta restrição de comunidade do YouTube
        if (errLower.includes('protect') || errLower.includes('sign in') || errLower.includes('age')) {
          console.error(`Invidious ${instance}: vídeo com restrição: ${videoData.error}`);
          lastError = 'restricted';
          continue;
        }
        console.error(`Invidious ${instance} erro: ${videoData.error}`);
        continue;
      }

      if (videoData && videoData.formatStreams && videoData.formatStreams.length > 0) {
        usedInstance = instance;
        break;
      }

      console.error(`Invidious ${instance}: sem streams disponíveis`);
    } catch (e) {
      console.error(`Invidious ${instance} falhou:`, e.message);
    }
  }

  if (!usedInstance) {
    if (lastError === 'restricted') {
      throw new Error(
        'Este vídeo tem restrição de comunidade do YouTube. ' +
        'Use um vídeo público sem restrições ou tente outro link.'
      );
    }
    throw new Error('Serviço temporariamente indisponível. Tente novamente em alguns minutos.');
  }

  const duration = videoData.lengthSeconds || 0;
  if (duration > MAX_DURATION_SECONDS) {
    throw new Error(`Vídeo muito longo (${Math.round(duration / 60)} min). Máximo: 20 minutos.`);
  }

  const streams = videoData.formatStreams || [];
  const best = streams.find(s => s.itag === '22')
             || streams.find(s => s.itag === '59')
             || streams.find(s => s.itag === '18')
             || streams.find(s => s.container === 'mp4')
             || streams[0];

  if (!best || !best.url) {
    throw new Error('Nenhum formato de vídeo disponível.');
  }

  console.log(`Baixando via Invidious ${usedInstance}, qualidade: ${best.qualityLabel || best.quality}`);

  const outputPath = path.join(outputDir, 'source.mp4');
  const ffmpeg = require('fluent-ffmpeg');

  await new Promise((resolve, reject) => {
    ffmpeg(best.url)
      .inputOptions(['-timeout', '120000000'])
      .outputOptions(['-c', 'copy', '-movflags', '+faststart'])
      .output(outputPath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });

  return outputPath;
}

async function downloadViaCobalt(url, outputDir) {
  console.log('Tentando Cobalt.tools...');
  const videoId = extractVideoId(url);
  const outputPath = path.join(outputDir, 'source.mp4');

  const cobaltUrl = 'https://api.cobalt.tools/';
  const body = JSON.stringify({ url, videoQuality: '720', filenameStyle: 'basic' });

  const data = await new Promise((resolve, reject) => {
    const req = https.request(cobaltUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      timeout: 20000
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); }
        catch (e) { reject(new Error('Cobalt resposta inválida')); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Cobalt timeout')); });
    req.write(body);
    req.end();
  });

  if (!data || !data.url || (data.status !== 'stream' && data.status !== 'redirect' && data.status !== 'tunnel')) {
    throw new Error(`Cobalt não retornou stream: ${JSON.stringify(data).slice(0, 100)}`);
  }

  console.log(`Cobalt retornou stream, baixando...`);
  const ffmpeg = require('fluent-ffmpeg');

  await new Promise((resolve, reject) => {
    ffmpeg(data.url)
      .inputOptions(['-timeout', '120000000'])
      .outputOptions(['-c', 'copy', '-movflags', '+faststart'])
      .output(outputPath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });

  return outputPath;
}

async function download(url, outputDir) {
  if (!isValidYoutubeUrl(url)) {
    throw new Error('URL inválida. Use um link do YouTube (youtube.com ou youtu.be).');
  }

  await ensureCookies();

  const info = await getVideoInfo(url);
  if (info.duration > MAX_DURATION_SECONDS) {
    throw new Error(`Vídeo muito longo (${Math.round(info.duration / 60)} min). Máximo: 20 minutos.`);
  }

  // 1. Tenta yt-dlp com múltiplos player clients
  const ytdlpResult = await tryYtDlp(url, outputDir);
  if (ytdlpResult) return ytdlpResult;

  // 2. Fallback: Cobalt.tools
  console.log('Todos os clientes yt-dlp falharam, tentando Cobalt.tools...');
  try {
    return await downloadViaCobalt(url, outputDir);
  } catch (cobaltErr) {
    console.error('Cobalt falhou:', cobaltErr.message);
  }

  // 3. Fallback: Invidious
  console.log('Cobalt falhou, tentando Invidious...');
  return downloadViaInvidious(url, outputDir);
}

async function getVideoInfo(url) {
  const videoId = extractVideoId(url);

  // Tenta yt-dlp com web client + bgutil PO token
  const cmd = `yt-dlp --print duration --print title --no-playlist --quiet --extractor-args "youtube:player_client=web" --no-check-certificate --js-runtimes node:/usr/local/bin/node ${cookiesArg()} "${url}"`;
  try {
    const { stdout } = await execAsync(cmd, { timeout: 30000 });
    const lines = stdout.trim().split('\n');
    const duration = parseFloat(lines[0]);
    if (duration > 0) return { duration, title: lines[1] || 'video' };
  } catch (e) {
    console.error('getVideoInfo yt-dlp falhou:', e.message.slice(0, 100));
  }

  // Fallback: Invidious para obter duração
  if (videoId) {
    for (const instance of INVIDIOUS_INSTANCES) {
      try {
        const data = await fetchJson(`${instance}/api/v1/videos/${videoId}?fields=title,lengthSeconds`);
        if (data && data.lengthSeconds && !data.error) {
          return { duration: data.lengthSeconds, title: data.title || 'video' };
        }
      } catch (e) { continue; }
    }
  }

  return { duration: 0, title: 'video' };
}

function isValidYoutubeUrl(url) {
  return /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/.test(url);
}

module.exports = { download, getVideoInfo };

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

// Instâncias públicas do Invidious (fallback quando YouTube bloqueia)
const INVIDIOUS_INSTANCES = [
  'https://inv.nadeko.net',
  'https://invidious.privacyredirect.com',
  'https://yt.cdaut.de',
  'https://invidious.perennialte.ch'
];

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

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { timeout: 15000 }, (res) => {
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

async function downloadViaInvidious(url, outputDir) {
  const videoId = extractVideoId(url);
  if (!videoId) throw new Error('URL inválida');

  let videoData = null;
  let usedInstance = null;

  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      console.log(`Tentando Invidious: ${instance}`);
      videoData = await fetchJson(`${instance}/api/v1/videos/${videoId}`);
      if (videoData && !videoData.error && videoData.formatStreams) {
        usedInstance = instance;
        break;
      }
    } catch (e) {
      console.error(`Invidious ${instance} falhou:`, e.message);
    }
  }

  if (!videoData || !videoData.formatStreams) {
    throw new Error('Nenhuma instância Invidious disponível. Tente novamente mais tarde.');
  }

  const duration = videoData.lengthSeconds || 0;
  if (duration > MAX_DURATION_SECONDS) {
    throw new Error(`Vídeo muito longo (${Math.round(duration / 60)} min). Máximo: 20 minutos.`);
  }

  // formatStreams tem vídeo+áudio combinados (até 720p)
  const streams = videoData.formatStreams || [];
  const best = streams.find(s => s.itag === '22')   // 720p mp4
             || streams.find(s => s.itag === '59')   // 480p mp4
             || streams.find(s => s.itag === '18')   // 360p mp4
             || streams.find(s => s.container === 'mp4')
             || streams[0];

  if (!best || !best.url) {
    throw new Error('Nenhum formato de vídeo disponível via Invidious.');
  }

  console.log(`Baixando via Invidious ${usedInstance}, qualidade: ${best.qualityLabel || best.quality}`);

  // Usar ffmpeg para baixar o stream diretamente
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

async function download(url, outputDir) {
  if (!isValidYoutubeUrl(url)) {
    throw new Error('URL inválida. Use um link do YouTube (youtube.com ou youtu.be).');
  }

  await ensureCookies();

  const outputPath = path.join(outputDir, 'source.%(ext)s');

  const info = await getVideoInfo(url);
  if (info.duration > MAX_DURATION_SECONDS) {
    throw new Error(`Vídeo muito longo (${Math.round(info.duration / 60)} min). Máximo: 20 minutos.`);
  }

  const cmd = [
    'yt-dlp',
    '--format', '"bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best[ext=mp4]/best"',
    '--merge-output-format', 'mp4',
    '--output', `"${outputPath}"`,
    '--no-playlist',
    '--quiet',
    '--extractor-args', '"youtube:player_client=android"',
    '--no-check-certificate',
    '--concurrent-fragments', '1',
    cookiesArg(),
    `"${url}"`
  ].filter(Boolean).join(' ');

  try {
    await execAsync(cmd, { timeout: 300000 });
    const files = await fs.readdir(outputDir);
    const videoFile = files.find(f => f.startsWith('source.') && f.endsWith('.mp4'));
    if (videoFile) return path.join(outputDir, videoFile);
  } catch (err) {
    const msg = err.message || '';
    const isBlocked = msg.includes('429') || msg.includes('Sign in') || msg.includes('bot');
    if (isBlocked) {
      console.log('yt-dlp bloqueado pelo YouTube, tentando Invidious...');
      return downloadViaInvidious(url, outputDir);
    }
    throw new Error(`Erro ao baixar vídeo: ${msg}`);
  }

  throw new Error('Arquivo de vídeo não encontrado após download.');
}

async function getVideoInfo(url) {
  const videoId = extractVideoId(url);

  // Tenta yt-dlp primeiro
  const cmd = `yt-dlp --print duration --print title --no-playlist --quiet --extractor-args "youtube:player_client=android" --no-check-certificate ${cookiesArg()} "${url}"`;
  try {
    const { stdout } = await execAsync(cmd, { timeout: 45000 });
    const lines = stdout.trim().split('\n');
    const duration = parseFloat(lines[0]);
    if (duration > 0) return { duration, title: lines[1] || 'video' };
  } catch (e) {
    console.error('getVideoInfo yt-dlp falhou:', e.message);
  }

  // Fallback: Invidious para obter duração
  if (videoId) {
    for (const instance of INVIDIOUS_INSTANCES) {
      try {
        const data = await fetchJson(`${instance}/api/v1/videos/${videoId}?fields=title,lengthSeconds`);
        if (data.lengthSeconds) {
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

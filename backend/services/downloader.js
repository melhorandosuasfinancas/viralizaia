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

// Instâncias públicas do Piped (fallback alternativo)
const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://pipedapi.leptons.xyz',
  'https://api.piped.yt',
  'https://piped-api.privacy.com.de'
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

function buildYtDlpCmd(url, outputPath, playerClient, sections = null) {
  const args = [
    'yt-dlp',
    '--format', '"bestvideo[height<=720]+bestaudio/bestvideo+bestaudio/best[height<=720]/best"',
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
  ];

  // Download only specific time sections (e.g. "*30-90" for 30s-90s)
  if (sections) {
    args.push('--download-sections', `"${sections}"`);
    args.push('--force-keyframes-at-cuts');
  }

  args.push(`"${url}"`);
  return args.filter(Boolean).join(' ');
}

// Download only a specific segment of the video (start/end in seconds)
async function downloadSection(url, start, end, outputDir, index = 0) {
  const outputPath = path.join(outputDir, `segment_${index}.%(ext)s`);
  const sections = `*${start}-${end}`;

  for (const client of PLAYER_CLIENTS) {
    const cmd = buildYtDlpCmd(url, outputPath, client, sections);
    try {
      await execAsync(cmd, { timeout: 120000 });
      const files = await fs.readdir(outputDir);
      const segFile = files.find(f => f.startsWith(`segment_${index}.`) && f.endsWith('.mp4'));
      if (segFile) {
        console.log(`downloadSection ${index} (${start}s-${end}s) ok, client=${client}`);
        return path.join(outputDir, segFile);
      }
    } catch (err) {
      console.log(`downloadSection client=${client} failed: ${(err.stderr || err.message || '').slice(0, 200)}`);
    }
  }

  // Fallback: Cobalt + ffmpeg trim
  console.log(`downloadSection ${index}: yt-dlp falhou, tentando Cobalt + trim...`);
  const cobaltTempDir = path.join(outputDir, `cobalt_${index}`);
  try {
    await fs.ensureDir(cobaltTempDir);
    const fullPath = await downloadViaCobalt(url, cobaltTempDir);
    const segOutputPath = path.join(outputDir, `segment_${index}.mp4`);
    const ffmpeg = require('fluent-ffmpeg');
    await new Promise((resolve, reject) => {
      ffmpeg(fullPath)
        .setStartTime(start)
        .setDuration(end - start)
        .outputOptions(['-c', 'copy'])
        .output(segOutputPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });
    await fs.remove(cobaltTempDir).catch(() => {});
    console.log(`downloadSection ${index} ok via Cobalt+trim`);
    return segOutputPath;
  } catch (cobaltErr) {
    console.log(`downloadSection ${index} Cobalt+trim falhou: ${cobaltErr.message}`);
    await fs.remove(cobaltTempDir).catch(() => {});
  }

  return null;
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

async function downloadViaPiped(url, outputDir) {
  const videoId = extractVideoId(url);
  if (!videoId) throw new Error('URL inválida');

  let lastErr = 'Nenhuma instância Piped disponível';
  let streams = null;
  let usedInstance = null;

  for (const instance of PIPED_INSTANCES) {
    try {
      console.log(`Tentando Piped: ${instance}`);
      const data = await fetchJson(`${instance}/streams/${videoId}`);
      if (data && (data.videoStreams || data.audioStreams)) {
        streams = data;
        usedInstance = instance;
        break;
      }
      lastErr = 'Sem streams';
    } catch (e) {
      console.error(`Piped ${instance} falhou:`, e.message);
      lastErr = e.message;
    }
  }

  if (!usedInstance) throw new Error(`Piped indisponível: ${lastErr}`);

  const duration = streams.duration || 0;
  if (duration > MAX_DURATION_SECONDS) {
    throw new Error(`Vídeo muito longo (${Math.round(duration / 60)} min). Máximo: 20 minutos.`);
  }

  // Procura stream combinado (vídeo+áudio) até 720p
  const videoStreams = streams.videoStreams || [];
  const audioStreams = streams.audioStreams || [];

  const combined = videoStreams
    .filter(s => !s.videoOnly && s.url)
    .sort((a, b) => (b.quality || 0) - (a.quality || 0))
    .find(s => (s.quality || 9999) <= 720) || videoStreams.find(s => !s.videoOnly && s.url);

  if (combined) {
    console.log(`Piped ${usedInstance}: stream combinado ${combined.quality}p`);
    const outputPath = path.join(outputDir, 'source.mp4');
    const ffmpeg = require('fluent-ffmpeg');
    await new Promise((resolve, reject) => {
      ffmpeg(combined.url)
        .inputOptions(['-timeout', '120000000'])
        .outputOptions(['-c', 'copy', '-movflags', '+faststart'])
        .output(outputPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });
    return outputPath;
  }

  // Fallback: melhor videoOnly + melhor audio → mux com ffmpeg
  const bestVideo = videoStreams
    .filter(s => s.videoOnly && s.url)
    .sort((a, b) => (b.quality || 0) - (a.quality || 0))
    .find(s => (s.quality || 9999) <= 720);

  const bestAudio = audioStreams
    .filter(s => s.url)
    .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0];

  if (!bestVideo || !bestAudio) throw new Error('Piped: sem formatos utilizáveis');

  console.log(`Piped ${usedInstance}: muxing ${bestVideo.quality}p video + audio`);
  const outputPath = path.join(outputDir, 'source.mp4');
  const ffmpeg = require('fluent-ffmpeg');
  await new Promise((resolve, reject) => {
    ffmpeg(bestVideo.url)
      .input(bestAudio.url)
      .inputOptions(['-timeout', '120000000'])
      .outputOptions(['-c:v', 'copy', '-c:a', 'aac', '-movflags', '+faststart'])
      .output(outputPath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
  return outputPath;
}

const COBALT_INSTANCES = [
  'https://cobalt.api.timelessnesses.me/',
  'https://cob.frisk.app/',
  'https://cobalt.canine.tools/',
  'https://cobalt.lunar.icu/',
  'https://api.cobalt.tools/',
];

async function tryCobaltInstance(instanceUrl, url) {
  const body = JSON.stringify({ url, videoQuality: '720', filenameStyle: 'basic' });
  return new Promise((resolve, reject) => {
    const req = https.request(instanceUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      timeout: 20000
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const data = JSON.parse(d);
          if (data && data.url && (data.status === 'stream' || data.status === 'redirect' || data.status === 'tunnel')) {
            resolve(data.url);
          } else {
            reject(new Error(`Cobalt ${instanceUrl}: ${JSON.stringify(data).slice(0, 80)}`));
          }
        } catch (e) { reject(new Error(`Cobalt ${instanceUrl}: resposta inválida`)); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error(`Cobalt ${instanceUrl}: timeout`)); });
    req.write(body);
    req.end();
  });
}

async function downloadViaCobalt(url, outputDir) {
  const outputPath = path.join(outputDir, 'source.mp4');
  let streamUrl = null;

  for (const instance of COBALT_INSTANCES) {
    try {
      console.log(`Tentando Cobalt: ${instance}`);
      streamUrl = await tryCobaltInstance(instance, url);
      console.log(`Cobalt ${instance} ok`);
      break;
    } catch (e) {
      console.log(`Cobalt ${instance} falhou: ${e.message}`);
    }
  }

  if (!streamUrl) throw new Error('Cobalt: todas instâncias falharam');

  console.log('Cobalt retornou stream, baixando...');
  const ffmpeg = require('fluent-ffmpeg');

  await new Promise((resolve, reject) => {
    ffmpeg(streamUrl)
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

  // 2. Fallback: Cobalt (servidor terceiro, bypass bot detection)
  console.log('yt-dlp falhou, tentando Cobalt...');
  try {
    return await downloadViaCobalt(url, outputDir);
  } catch (cobaltErr) {
    console.error('Cobalt falhou:', cobaltErr.message);
  }

  // 3. Fallback: Piped
  console.log('Cobalt falhou, tentando Piped...');
  try {
    return await downloadViaPiped(url, outputDir);
  } catch (pipedErr) {
    console.error('Piped falhou:', pipedErr.message);
  }

  // 4. Fallback: Invidious
  console.log('Piped falhou, tentando Invidious...');
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

module.exports = { download, getVideoInfo, downloadSection };

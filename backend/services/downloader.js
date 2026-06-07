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
const PLAYER_CLIENTS = ['android', 'ios', 'web', 'mweb', 'android_embedded', 'web_creator'];
const WARP_PROXY = 'socks5://127.0.0.1:40000';

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
        try { resolve(JSON.parse(data)); } catch (e) { reject(new Error('Invalid JSON')); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function buildYtDlpCmd(url, outputPath, playerClient, sections = null, proxy = null) {
  const args = [
    'yt-dlp',
    '--format', '"bv*[height<=720]+ba/b[height<=720]/bv*+ba/b"',
    '--merge-output-format', 'mp4',
    '--output', `"${outputPath}"`,
    '--no-playlist',
    '--quiet',
    '--extractor-args', `"youtube:player_client=${playerClient}"`,
    '--no-check-certificate',
    '--concurrent-fragments', '1',
    '--no-warnings',
    '--js-runtimes', 'bun:/root/.bun/bin/bun',
    '--remote-components', 'ejs:github',
    cookiesArg(),
  ];

  if (proxy) {
    args.push('--proxy', proxy);
  }

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

  // WARP proxy fallback
  console.log(`downloadSection ${index}: direto falhou, tentando via WARP proxy...`);
  for (const warpClient of PLAYER_CLIENTS) {
    console.log(`yt-dlp WARP tentando player_client=${warpClient}...`);
    const cmdWarp = buildYtDlpCmd(url, outputPath, warpClient, sections, WARP_PROXY);
    try {
      await execAsync(cmdWarp, { timeout: 120000 });
      const wFiles = await fs.readdir(outputDir);
      const wSeg = wFiles.find(f => f.startsWith(`segment_${index}.`) && f.endsWith('.mp4'));
      if (wSeg) {
        console.log(`downloadSection ${index} WARP sucesso, client=${warpClient}`);
        return path.join(outputDir, wSeg);
      }
    } catch (warpErr) {
      console.log(`downloadSection WARP ${warpClient} falhou: ${(warpErr.stderr || warpErr.message || '').slice(0, 150)}`);
    }
  }

  // Fallback: Cobalt + ffmpeg trim (cache compartilhado por job para evitar re-download por segmento)
  console.log(`downloadSection ${index}: yt-dlp falhou, tentando Cobalt + trim...`);
  const cobaltCachePath = path.join(outputDir, 'cobalt_full.mp4');
  try {
    let fullPath;
    if (await fs.pathExists(cobaltCachePath)) {
      console.log(`downloadSection ${index}: reusando cache Cobalt`);
      fullPath = cobaltCachePath;
    } else {
      const cobaltTempDir = path.join(outputDir, `cobalt_${index}`);
      await fs.ensureDir(cobaltTempDir);
      const downloaded = await downloadViaCobalt(url, cobaltTempDir);
      await fs.move(downloaded, cobaltCachePath);
      await fs.remove(cobaltTempDir).catch(() => {});
      fullPath = cobaltCachePath;
    }
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
    console.log(`downloadSection ${index} ok via Cobalt+trim`);
    return segOutputPath;
  } catch (cobaltErr) {
    console.log(`downloadSection ${index} Cobalt+trim falhou: ${cobaltErr.message}`);
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
      const isBlocked = errText.includes('429') || errText.includes('sign in') || errText.includes('bot') ||
        errText.includes('precondition') || errText.includes('forbidden') || errText.includes('403') ||
        errText.includes('nsig') || errText.includes('cipher');
      const errShort = (err.stderr || err.message || '').slice(0, 300);
      console.log(`yt-dlp cliente ${client} falhou (blocked=${isBlocked}): ${errShort}`);
    }
  }

  // WARP proxy fallback
  console.log('yt-dlp direto falhou, tentando via WARP proxy...');
  for (const warpClient of PLAYER_CLIENTS) {
    console.log(`yt-dlp WARP tentando player_client=${warpClient}...`);
    const cmdWarp = buildYtDlpCmd(url, outputPath, warpClient, null, WARP_PROXY);
    try {
      await execAsync(cmdWarp, { timeout: 180000 });
      const files = await fs.readdir(outputDir);
      const videoFile = files.find(f => f.startsWith('source.') && f.endsWith('.mp4'));
      if (videoFile) {
        console.log(`yt-dlp WARP sucesso com cliente: ${warpClient}`);
        return path.join(outputDir, videoFile);
      }
    } catch (warpErr) {
      const wErrShort = (warpErr.stderr || warpErr.message || '').slice(0, 300);
      console.log(`yt-dlp WARP cliente ${warpClient} falhou: ${wErrShort}`);
    }
  }

  return null;
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
        if (errLower.includes('protect') || errLower.includes('sign in') || errLower.includes('age'

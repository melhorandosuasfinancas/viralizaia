const { exec } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const { promisify } = require('util');
const os = require('os');

const execAsync = promisify(exec);

const MAX_DURATION_SECONDS = 1200; // 20 minutos
const COOKIES_FILE = path.join(os.tmpdir(), 'yt-cookies.txt');

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

async function download(url, outputDir) {
  if (!isValidYoutubeUrl(url)) {
    throw new Error('URL inválida. Use um link do YouTube (youtube.com ou youtu.be).');
  }

  await ensureCookies();

  const outputPath = path.join(outputDir, 'source.%(ext)s');

  const info = await getVideoInfo(url);
  if (info.duration > MAX_DURATION_SECONDS) {
    throw new Error(`Vídeo muito longo (${Math.round(info.duration / 60)} min). Máximo: 10 minutos.`);
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
    '--add-header', '"Accept-Language:pt-BR,pt;q=0.9"',
    cookiesArg(),
    `"${url}"`
  ].filter(Boolean).join(' ');

  try {
    await execAsync(cmd, { timeout: 300000 }); // 5 minutos
  } catch (err) {
    throw new Error(`Erro ao baixar vídeo: ${err.message}`);
  }

  const files = await fs.readdir(outputDir);
  const videoFile = files.find(f => f.startsWith('source.') && f.endsWith('.mp4'));

  if (!videoFile) {
    throw new Error('Arquivo de vídeo não encontrado após download.');
  }

  return path.join(outputDir, videoFile);
}

async function getVideoInfo(url) {
  const cmd = `yt-dlp --print duration --print title --no-playlist --quiet --extractor-args "youtube:player_client=android" --no-check-certificate ${cookiesArg()} "${url}"`;
  try {
    const { stdout } = await execAsync(cmd, { timeout: 45000 });
    const lines = stdout.trim().split('\n');
    return {
      duration: parseFloat(lines[0]) || 0,
      title: lines[1] || 'video'
    };
  } catch (err) {
    console.error('getVideoInfo failed:', err.message);
    return { duration: 0, title: 'video' };
  }
}

function isValidYoutubeUrl(url) {
  return /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/.test(url);
}

module.exports = { download, getVideoInfo };

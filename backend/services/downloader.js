const { exec } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const { promisify } = require('util');

const execAsync = promisify(exec);

const MAX_DURATION_SECONDS = 600; // 10 minutos máximo

async function download(url, outputDir) {
  // Valida URL do YouTube
  if (!isValidYoutubeUrl(url)) {
    throw new Error('URL inválida. Use um link do YouTube (youtube.com ou youtu.be).');
  }

  const outputPath = path.join(outputDir, 'source.%(ext)s');

  // Verifica duração antes de baixar
  const info = await getVideoInfo(url);
  if (info.duration > MAX_DURATION_SECONDS) {
    throw new Error(`Vídeo muito longo (${Math.round(info.duration / 60)} min). Máximo: 10 minutos.`);
  }

  // Baixa em melhor qualidade até 1080p
  const cmd = [
    'yt-dlp',
    '--format', '"bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080][ext=mp4]/best"',
    '--merge-output-format', 'mp4',
    '--output', `"${outputPath}"`,
    '--no-playlist',
    '--quiet',
    '--extractor-args', '"youtube:player_client=android,ios,web"',
    '--js-runtimes', 'nodejs',
    '--no-check-certificate',
    `"${url}"`
  ].join(' ');

  try {
    await execAsync(cmd, { timeout: 120000 });
  } catch (err) {
    throw new Error(`Erro ao baixar vídeo: ${err.message}`);
  }

  // Encontra o arquivo baixado
  const files = await fs.readdir(outputDir);
  const videoFile = files.find(f => f.startsWith('source.') && f.endsWith('.mp4'));

  if (!videoFile) {
    throw new Error('Arquivo de vídeo não encontrado após download.');
  }

  return path.join(outputDir, videoFile);
}

async function getVideoInfo(url) {
  const cmd = `yt-dlp --print duration --print title --no-playlist --quiet --extractor-args "youtube:player_client=android,ios,web" --js-runtimes nodejs --no-check-certificate "${url}"`;
  try {
    const { stdout } = await execAsync(cmd, { timeout: 30000 });
    const lines = stdout.trim().split('\n');
    return {
      duration: parseFloat(lines[0]) || 0,
      title: lines[1] || 'video'
    };
  } catch {
    return { duration: 0, title: 'video' };
  }
}

function isValidYoutubeUrl(url) {
  return /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/.test(url);
}

module.exports = { download, getVideoInfo };

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs-extra');
const multer = require('multer');

const downloader = require('../services/downloader');
const transcriber = require('../services/transcriber');
const analyzer = require('../services/analyzer');
const processor = require('../services/processor');
const { getTranscript } = require('../services/youtube-transcript');
const { verifySubscription } = require('../services/auth');

const upload = multer({
  dest: path.join(__dirname, '../uploads'),
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB
  fileFilter: (req, file, cb) => {
    const ok = /video\/|application\/octet-stream/.test(file.mimetype) || /\.(mp4|mov|avi|mkv|webm)$/i.test(file.originalname);
    cb(null, ok);
  }
});

const MAX_DURATION_SECONDS = 1200; // 20 minutos

// Status dos jobs em memória (produção: usar Redis)
const jobs = new Map();

// POST /api/video/upload — envia arquivo de vídeo e inicia processamento
router.post('/upload', verifySubscription, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Arquivo de vídeo é obrigatório.' });

  const { platforms = '["tiktok","instagram"]', mode = 'ai', maxClips = '3' } = req.body;
  let parsedPlatforms;
  try { parsedPlatforms = JSON.parse(platforms); } catch { parsedPlatforms = ['tiktok', 'instagram']; }

  const jobId = uuidv4();
  jobs.set(jobId, { status: 'queued', progress: 0, clips: [], error: null });
  res.json({ jobId, message: 'Processamento iniciado.' });

  const tempDir = path.join(__dirname, '../temp', jobId);
  await fs.ensureDir(tempDir);
  const destPath = path.join(tempDir, 'source.mp4');
  await fs.move(req.file.path, destPath);

  processVideoFromFile(jobId, destPath, tempDir, parsedPlatforms, mode, Math.min(Math.max(parseInt(maxClips) || 3, 1), 3))
    .catch(err => jobs.set(jobId, { status: 'error', progress: 0, clips: [], error: err.message }));
});

// POST /api/video/process — envia URL e inicia processamento
router.post('/process', verifySubscription, async (req, res) => {
  const { url, platforms = ['tiktok', 'instagram', 'facebook'], mode = 'ai', maxClips = 3 } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL do YouTube é obrigatória.' });
  }

  const jobId = uuidv4();
  jobs.set(jobId, { status: 'queued', progress: 0, clips: [], error: null });

  res.json({ jobId, message: 'Processamento iniciado.' });

  // Processar em background
  processVideo(jobId, url, platforms, mode, Math.min(Math.max(parseInt(maxClips) || 3, 1), 3)).catch(err => {
    jobs.set(jobId, { status: 'error', progress: 0, clips: [], error: err.message });
  });
});

// GET /api/video/status/:jobId — consulta status do job
router.get('/status/:jobId', (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job não encontrado.' });
  res.json(job);
});

// DELETE /api/video/job/:jobId — limpa arquivos do job
router.delete('/job/:jobId', async (req, res) => {
  const jobId = req.params.jobId;
  const outputDir = path.join(__dirname, '../output', jobId);
  const tempDir = path.join(__dirname, '../temp', jobId);

  await fs.remove(outputDir).catch(() => {});
  await fs.remove(tempDir).catch(() => {});
  jobs.delete(jobId);

  res.json({ message: 'Job removido.' });
});

async function processVideo(jobId, url, platforms, mode, maxClips = 3) {
  const updateJob = (update) => jobs.set(jobId, { ...jobs.get(jobId), ...update });
  const tempDir = path.join(__dirname, '../temp', jobId);
  const outputDir = path.join(__dirname, '../output', jobId);

  await fs.ensureDir(tempDir);
  await fs.ensureDir(outputDir);

  try {
    // 1. Busca transcrição via YouTube (sem baixar o vídeo — funciona de qualquer IP)
    updateJob({ status: 'transcribing', progress: 15 });
    let segments;
    let usedTranscriptAPI = false;

    try {
      console.log('Buscando transcrição via YouTube Transcript API...');
      const { segments: ytSegments, fullText, duration } = await getTranscript(url);
      console.log(`Transcrição obtida: ${ytSegments.length} segmentos, ${duration}s`);

      if (duration > MAX_DURATION_SECONDS) {
        throw new Error(`Vídeo muito longo (${Math.round(duration / 60)} min). Máximo: 20 minutos.`);
      }

      // 2. IA analisa o texto e identifica os melhores momentos
      updateJob({ status: 'analyzing', progress: 35 });
      if (mode === 'ai') {
        segments = await analyzer.findBestSegments(ytSegments, url, maxClips);
      } else {
        segments = analyzer.splitEqually(ytSegments, maxClips);
      }
      usedTranscriptAPI = true;
    } catch (transcriptErr) {
      console.log(`Transcript API falhou (${transcriptErr.message}), usando download completo como fallback`);
    }

    if (usedTranscriptAPI && segments && segments.length > 0) {
      // 3. Baixa apenas os segmentos identificados (não o vídeo inteiro)
      updateJob({ status: 'downloading', progress: 50 });
      const clips = [];

      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        const padding = 2; // 2s de margem para garantir o keyframe
        const startWithPad = Math.max(0, seg.start - padding);
        const endWithPad = seg.end + padding;

        console.log(`Baixando segmento ${i + 1}/${segments.length}: ${seg.start}s-${seg.end}s`);
        const segPath = await downloader.downloadSection(url, startWithPad, endWithPad, tempDir, i);

        if (segPath) {
          // Re-corta com FFmpeg para remover o padding
          const trimStart = seg.start - startWithPad;
          const trimDuration = seg.end - seg.start;
          const clipsResult = await processor.createClips(
            segPath,
            [{ ...seg, start: trimStart, end: trimStart + trimDuration, duration: trimDuration }],
            platforms,
            outputDir,
            jobId,
            (done, total) => updateJob({ progress: Math.round(50 + ((i * total + done) / (segments.length * total)) * 45) })
          );
          clips.push(...clipsResult);
        } else {
          console.log(`Segmento ${i + 1} não baixou, pulando`);
        }
      }

      if (clips.length > 0) {
        updateJob({ status: 'done', progress: 100, clips });
        return;
      }
      // Se nenhum segmento baixou, cai no fallback abaixo
      console.log('Nenhum segmento baixado via sections, tentando download completo...');
    }

    // Fallback: download completo + processamento tradicional
    updateJob({ status: 'downloading', progress: 20 });
    const videoPath = await downloader.download(url, tempDir);
    await processFromPath(jobId, videoPath, tempDir, outputDir, platforms, mode, maxClips, url);

  } catch (err) {
    updateJob({ status: 'error', error: err.message });
    throw err;
  } finally {
    await fs.remove(tempDir).catch(() => {});
  }
}

async function processVideoFromFile(jobId, videoPath, tempDir, platforms, mode, maxClips = 3) {
  const outputDir = path.join(__dirname, '../output', jobId);
  await fs.ensureDir(outputDir);
  const updateJob = (update) => jobs.set(jobId, { ...jobs.get(jobId), ...update });
  try {
    await processFromPath(jobId, videoPath, tempDir, outputDir, platforms, mode, maxClips, null);
  } catch (err) {
    updateJob({ status: 'error', error: err.message });
    throw err;
  } finally {
    await fs.remove(tempDir).catch(() => {});
  }
}

async function processFromPath(jobId, videoPath, tempDir, outputDir, platforms, mode, maxClips, url) {
  const updateJob = (update) => jobs.set(jobId, { ...jobs.get(jobId), ...update });

  updateJob({ status: 'transcribing', progress: 30 });
  const transcript = await transcriber.transcribe(videoPath);

  updateJob({ status: 'analyzing', progress: 50 });
  let segments;
  if (mode === 'ai') {
    segments = await analyzer.findBestSegments(transcript, url || 'upload', maxClips);
  } else {
    segments = analyzer.splitEqually(transcript, maxClips);
  }

  updateJob({ status: 'processing', progress: 70 });
  const clips = await processor.createClips(videoPath, segments, platforms, outputDir, jobId, (done, total) => {
    updateJob({ progress: Math.round(70 + (done / total) * 25) });
  });

  updateJob({ status: 'done', progress: 100, clips });
}

module.exports = router;

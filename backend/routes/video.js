const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs-extra');

const downloader = require('../services/downloader');
const transcriber = require('../services/transcriber');
const analyzer = require('../services/analyzer');
const processor = require('../services/processor');
const { verifySubscription } = require('../services/auth');

// Status dos jobs em memória (produção: usar Redis)
const jobs = new Map();

// POST /api/video/process — envia URL e inicia processamento
router.post('/process', verifySubscription, async (req, res) => {
  const { url, platforms = ['tiktok', 'instagram', 'facebook'], mode = 'ai' } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL do YouTube é obrigatória.' });
  }

  const jobId = uuidv4();
  jobs.set(jobId, { status: 'queued', progress: 0, clips: [], error: null });

  res.json({ jobId, message: 'Processamento iniciado.' });

  // Processar em background
  processVideo(jobId, url, platforms, mode).catch(err => {
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

async function processVideo(jobId, url, platforms, mode) {
  const updateJob = (update) => jobs.set(jobId, { ...jobs.get(jobId), ...update });
  const tempDir = path.join(__dirname, '../temp', jobId);
  const outputDir = path.join(__dirname, '../output', jobId);

  await fs.ensureDir(tempDir);
  await fs.ensureDir(outputDir);

  try {
    // 1. Download do vídeo
    updateJob({ status: 'downloading', progress: 10 });
    const videoPath = await downloader.download(url, tempDir);

    // 2. Transcrição com Whisper
    updateJob({ status: 'transcribing', progress: 30 });
    const transcript = await transcriber.transcribe(videoPath);

    // 3. IA identifica melhores momentos
    updateJob({ status: 'analyzing', progress: 50 });
    let segments;
    if (mode === 'ai') {
      segments = await analyzer.findBestSegments(transcript, url);
    } else {
      // Modo manual: divide em segmentos de 60s
      segments = analyzer.splitEqually(transcript);
    }

    // 4. FFmpeg corta e redimensiona para cada plataforma
    updateJob({ status: 'processing', progress: 70 });
    const clips = await processor.createClips(videoPath, segments, platforms, outputDir, jobId, (done, total) => {
      updateJob({ progress: Math.round(70 + (done / total) * 25) });
    });

    updateJob({ status: 'done', progress: 100, clips });

  } catch (err) {
    updateJob({ status: 'error', error: err.message });
    throw err;
  } finally {
    await fs.remove(tempDir).catch(() => {});
  }
}

module.exports = router;

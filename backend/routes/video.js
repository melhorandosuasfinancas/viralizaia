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
const authRouter = require('./auth');

const PLAN_MAX_CLIPS = authRouter.PLAN_MAX_CLIPS || { trial: 1, starter: 5, pro: 20 };
const MAX_DURATION_SECONDS = 1200; // 20 min

const upload = multer({
  dest: path.join(__dirname, '../uploads'),
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /video\/|application\/octet-stream/.test(file.mimetype) || /\.(mp4|mov|avi|mkv|webm)$/i.test(file.originalname);
    cb(null, ok);
  }
});

const jobs = new Map();

// POST /api/video/upload
router.post('/upload', verifySubscription, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Arquivo de vídeo é obrigatório.' });

  const { platforms = '["tiktok","instagram"]', mode = 'ai', maxClips, captionStyle = 'tiktok' } = req.body;

  let parsedPlatforms;
  try { parsedPlatforms = JSON.parse(platforms); } catch { parsedPlatforms = ['tiktok', 'instagram']; }

  const planMax = PLAN_MAX_CLIPS[req.userPlan] || 5;
  const clipsToProcess = Math.min(Math.max(parseInt(maxClips) || planMax, 1), planMax);

  const jobId = uuidv4();
  jobs.set(jobId, { status: 'queued', progress: 0, clips: [], error: null });
  res.json({ jobId, message: 'Processamento iniciado.' });

  const tempDir = path.join(__dirname, '../temp', jobId);
  await fs.ensureDir(tempDir);
  const destPath = path.join(tempDir, 'source.mp4');
  await fs.move(req.file.path, destPath);

  processVideoFromFile(jobId, destPath, tempDir, parsedPlatforms, mode, clipsToProcess, captionStyle, req.userEmail, req.userPlan)
    .catch(err => jobs.set(jobId, { status: 'error', progress: 0, clips: [], error: err.message }));
});

// POST /api/video/process
router.post('/process', verifySubscription, async (req, res) => {
  const { url, platforms = ['tiktok', 'instagram'], mode = 'ai', maxClips, captionStyle = 'tiktok' } = req.body;

  if (!url) return res.status(400).json({ error: 'URL do YouTube é obrigatória.' });

  const planMax = PLAN_MAX_CLIPS[req.userPlan] || 5;
  const clipsToProcess = Math.min(Math.max(parseInt(maxClips) || planMax, 1), planMax);

  const jobId = uuidv4();
  jobs.set(jobId, { status: 'queued', progress: 0, clips: [], error: null });
  res.json({ jobId, message: 'Processamento iniciado.' });

  processVideo(jobId, url, platforms, mode, clipsToProcess, captionStyle, req.userEmail, req.userPlan)
    .catch(err => jobs.set(jobId, { status: 'error', progress: 0, clips: [], error: err.message }));
});

// GET /api/video/status/:jobId
router.get('/status/:jobId', (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job não encontrado.' });
  res.json(job);
});

// DELETE /api/video/job/:jobId
router.delete('/job/:jobId', async (req, res) => {
  const jobId = req.params.jobId;
  await fs.remove(path.join(__dirname, '../output', jobId)).catch(() => {});
  await fs.remove(path.join(__dirname, '../temp', jobId)).catch(() => {});
  jobs.delete(jobId);
  res.json({ message: 'Job removido.' });
});

// --- Processamento via URL do YouTube ---
async function processVideo(jobId, url, platforms, mode, maxClips, captionStyle, userEmail, userPlan) {
  const updateJob = (update) => jobs.set(jobId, { ...jobs.get(jobId), ...update });
  const tempDir = path.join(__dirname, '../temp', jobId);
  const outputDir = path.join(__dirname, '../output', jobId);
  await fs.ensureDir(tempDir);
  await fs.ensureDir(outputDir);

  try {
    updateJob({ status: 'transcribing', progress: 15 });
    let segments;
    let transcriptSegs = [];
    let usedTranscriptAPI = false;

    try {
      console.log('Buscando transcrição via YouTube Transcript API...');
      const { segments: ytSegments, duration } = await getTranscript(url);
      console.log(`Transcrição obtida: ${ytSegments.length} segmentos, ${duration}s`);

      if (duration > MAX_DURATION_SECONDS) {
        throw new Error(`Vídeo muito longo (${Math.round(duration / 60)} min). Máximo: 20 minutos.`);
      }

      transcriptSegs = ytSegments;
      updateJob({ status: 'analyzing', progress: 35 });
      segments = mode === 'ai'
        ? await analyzer.findBestSegments(ytSegments, url, maxClips)
        : analyzer.splitEqually(ytSegments, maxClips);
      usedTranscriptAPI = true;
    } catch (transcriptErr) {
      console.log(`Transcript API falhou (${transcriptErr.message}), usando download completo`);
    }

    if (usedTranscriptAPI && segments && segments.length > 0) {
      updateJob({ status: 'downloading', progress: 50 });
      const clips = [];

      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        const padding = 2;
        const startWithPad = Math.max(0, seg.start - padding);
        const endWithPad = seg.end + padding;

        console.log(`Baixando segmento ${i + 1}/${segments.length}: ${seg.start}s-${seg.end}s`);
        const segPath = await downloader.downloadSection(url, startWithPad, endWithPad, tempDir, i);

        if (segPath) {
          const trimStart = seg.start - startWithPad;
          const trimDuration = seg.end - seg.start;
          const adjustedSeg = { ...seg, start: trimStart, end: trimStart + trimDuration };

          // Ajusta timestamps da transcrição para o segmento baixado
          const adjustedTranscript = transcriptSegs.map(t => ({
            ...t,
            start: t.start - startWithPad,
            end: t.end - startWithPad
          }));

          const clipsResult = await processor.createClips(
            segPath,
            [adjustedSeg],
            platforms,
            outputDir,
            jobId,
            (done, total) => updateJob({ progress: Math.round(50 + ((i * total + done) / (segments.length * total)) * 45) }),
            adjustedTranscript,
            captionStyle
          );
          clips.push(...clipsResult);
        } else {
          console.log(`Segmento ${i + 1} não baixou, pulando`);
        }
      }

      if (clips.length > 0) {
        markTrialIfNeeded(userEmail, userPlan);
        updateJob({ status: 'done', progress: 100, clips });
        return;
      }
    }

    // Fallback: download completo
    updateJob({ status: 'downloading', progress: 20 });
    const videoPath = await downloader.download(url, tempDir);
    await processFromPath(jobId, videoPath, tempDir, outputDir, platforms, mode, maxClips, captionStyle, url, null, userEmail, userPlan);

  } catch (err) {
    updateJob({ status: 'error', error: err.message });
    throw err;
  } finally {
    await fs.remove(tempDir).catch(() => {});
  }
}

// --- Processamento via upload de arquivo ---
async function processVideoFromFile(jobId, videoPath, tempDir, platforms, mode, maxClips, captionStyle, userEmail, userPlan) {
  const outputDir = path.join(__dirname, '../output', jobId);
  await fs.ensureDir(outputDir);
  const updateJob = (update) => jobs.set(jobId, { ...jobs.get(jobId), ...update });
  try {
    await processFromPath(jobId, videoPath, tempDir, outputDir, platforms, mode, maxClips, captionStyle, null, null, userEmail, userPlan);
  } catch (err) {
    updateJob({ status: 'error', error: err.message });
    throw err;
  } finally {
    await fs.remove(tempDir).catch(() => {});
  }
}

// --- Pipeline comum (transcrição Whisper + análise + cortes) ---
async function processFromPath(jobId, videoPath, tempDir, outputDir, platforms, mode, maxClips, captionStyle, url, existingTranscript, userEmail, userPlan) {
  const updateJob = (update) => jobs.set(jobId, { ...jobs.get(jobId), ...update });

  updateJob({ status: 'transcribing', progress: 30 });
  const transcriptSegs = existingTranscript || await transcriber.transcribe(videoPath);

  updateJob({ status: 'analyzing', progress: 50 });
  const segments = mode === 'ai'
    ? await analyzer.findBestSegments(transcriptSegs, url || 'upload', maxClips)
    : analyzer.splitEqually(transcriptSegs, maxClips);

  updateJob({ status: 'processing', progress: 70 });
  const clips = await processor.createClips(
    videoPath,
    segments,
    platforms,
    outputDir,
    jobId,
    (done, total) => updateJob({ progress: Math.round(70 + (done / total) * 25) }),
    transcriptSegs,
    captionStyle
  );

  markTrialIfNeeded(userEmail, userPlan);
  updateJob({ status: 'done', progress: 100, clips });
}

function markTrialIfNeeded(email, plan) {
  if (plan === 'trial' && email) {
    // Notifica o auth que o trial foi usado
    try {
      require('./auth'); // já carregado
      const data = require('../data/users.json').trials || {};
      if (!data[email.toLowerCase()]) {
        const fs2 = require('fs-extra');
        const dataPath = require('path').join(__dirname, '../data/users.json');
        const store = fs2.readJsonSync(dataPath);
        store.trials[email.toLowerCase()] = { usedAt: new Date().toISOString() };
        fs2.writeJsonSync(dataPath, store, { spaces: 2 });
      }
    } catch {}
  }
}

module.exports = router;

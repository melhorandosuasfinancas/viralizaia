const fs = require('fs');
const path = '/root/viralizaia/backend/routes/video.js';
let content = fs.readFileSync(path, 'utf8');

const OLD = `    // Fallback: download completo
    updateJob({ status: 'downloading', progress: 20 });
    const videoPath = await downloader.download(url, tempDir);
    await processFromPath(jobId, videoPath, tempDir, outputDir, platforms, mode, maxClips, captionStyle, url, null, userEmail, userPlan, targetDuration, captionColor);`;

const NEW = `    // Fallback: audio-only (10-20x mais rapido que download completo)
    updateJob({ status: 'downloading', progress: 20 });
    let videoPath;
    try {
      console.log('[video.js] Fallback: tentando audio-only para transcricao...');
      const audioPath = await downloader.downloadAudioOnly(url, tempDir);
      updateJob({ status: 'transcribing', progress: 35 });
      const transcript = await transcriber.transcribe(audioPath);
      updateJob({ status: 'analyzing', progress: 55 });
      const segments = await analyzer.analyze(transcript, maxClips, targetDuration);
      updateJob({ status: 'processing', progress: 65 });
      const segDownloads = await Promise.all(segments.map(async (seg, i) => {
        try {
          const segPath = await downloader.downloadSegment(url, tempDir, seg.start, seg.end, i);
          return { ...seg, segPath };
        } catch (e) {
          console.error('[video.js] Falha ao baixar segmento', i, e.message);
          return { ...seg, segPath: null };
        }
      }));
      const clips = [];
      for (let i = 0; i < segDownloads.length; i++) {
        const seg = segDownloads[i];
        if (!seg.segPath) continue;
        const adjustedTranscript = transcript
          .map(t => ({ ...t, start: t.start - seg.start, end: t.end - seg.start }))
          .filter(t => t.end > 0 && t.start < (seg.end - seg.start));
        const clipsResult = await processor.processSegment(
          seg.segPath, outputDir, platforms, seg, i + 1, mode, captionStyle,
          (done, total) => updateJob({ progress: Math.round(65 + ((i * total + done) / (segDownloads.length * total)) * 30) }),
          adjustedTranscript, captionStyle, userPlan === 'trial', captionColor
        );
        clips.push(...clipsResult);
      }
      if (clips.length > 0) {
        finalizeJob(userEmail, userPlan, segDownloads.filter(s => s.segPath).length);
        updateJob({ status: 'done', progress: 100, clips });
        return;
      }
      videoPath = audioPath;
    } catch (audioErr) {
      console.error('[video.js] Audio-only falhou, baixando video completo:', audioErr.message);
      videoPath = await downloader.download(url, tempDir);
    }
    await processFromPath(jobId, videoPath, tempDir, outputDir, platforms, mode, maxClips, captionStyle, url, null, userEmail, userPlan, targetDuration, captionColor);`;

if (!content.includes(OLD.trim())) {
  // Try with normalized whitespace search
  const idx = content.indexOf('// Fallback: download completo');
  if (idx === -1) {
    console.log('ERRO: marcador nao encontrado no arquivo');
    process.exit(1);
  }
  console.log('Encontrado em index:', idx);
  console.log('Contexto:', content.substring(idx, idx + 300));
  process.exit(1);
}

content = content.replace(OLD, NEW);
fs.writeFileSync(path, content, 'utf8');
console.log('OK: video.js atualizado com fallback audio-only');

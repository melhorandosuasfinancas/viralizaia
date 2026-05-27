const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function transcribe(videoPath) {
  const audioPath = videoPath.replace('.mp4', '_audio.mp3');

  // Extrai áudio antes de enviar para Whisper
  await extractAudio(videoPath, audioPath);

  try {
    const response = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: 'whisper-1',
      language: 'pt',
      response_format: 'verbose_json',
      timestamp_granularities: ['segment']
    });

    // Retorna segmentos com timestamps
    return response.segments.map(seg => ({
      start: seg.start,
      end: seg.end,
      text: seg.text.trim(),
      id: seg.id
    }));

  } finally {
    fs.unlink(audioPath, () => {});
  }
}

function extractAudio(videoPath, audioPath) {
  const ffmpeg = require('fluent-ffmpeg');
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .noVideo()
      .audioCodec('libmp3lame')
      .audioBitrate('64k') // qualidade suficiente para transcrição
      .output(audioPath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}

module.exports = { transcribe };

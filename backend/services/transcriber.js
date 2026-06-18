const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1'
});

async function transcribe(videoPath) {
  const audioPath = videoPath.replace(/\.[^.]+$/, '_audio.mp3');

  // Extrai áudio antes de enviar para Whisper
  await extractAudio(videoPath, audioPath);

  try {
    const response = await groq.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: 'whisper-large-v3-turbo',
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

function extractAudio(videoPath, audioPath, maxDuration = 600) {
  const ffmpeg = require('fluent-ffmpeg');
  return new Promise((resolve, reject) => {
    const cmd = ffmpeg(videoPath)
      .noVideo()
      .audioCodec('libmp3lame')
      .audioBitrate('64k'); // qualidade suficiente para transcrição
    if (maxDuration) cmd.setDuration(maxDuration); // evita 413 no Groq Whisper
    cmd
      .output(audioPath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}

module.exports = { transcribe };

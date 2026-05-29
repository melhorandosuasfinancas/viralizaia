const { YoutubeTranscript } = require('youtube-transcript');

// Busca transcrição do YouTube com timestamps (sem baixar o vídeo)
// Funciona de qualquer IP — usa o endpoint público de legendas do YouTube
async function getTranscript(url) {
  const videoId = extractVideoId(url);
  if (!videoId) throw new Error('URL do YouTube inválida.');

  let transcript;
  try {
    transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'pt' });
  } catch {
    // Fallback: inglês ou qualquer idioma disponível
    try {
      transcript = await YoutubeTranscript.fetchTranscript(videoId);
    } catch (e) {
      throw new Error(`Transcrição não disponível para este vídeo: ${e.message}`);
    }
  }

  if (!transcript || transcript.length === 0) {
    throw new Error('Este vídeo não tem legendas automáticas disponíveis.');
  }

  // Formata como texto com timestamps para o LLM
  const segments = transcript.map(item => ({
    start: Math.round(item.offset / 1000),       // ms → segundos
    end: Math.round((item.offset + item.duration) / 1000),
    text: item.text.trim()
  }));

  const fullText = segments
    .map(s => `[${formatTime(s.start)}] ${s.text}`)
    .join('\n');

  return { segments, fullText, duration: segments[segments.length - 1]?.end || 0 };
}

function extractVideoId(url) {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  return m ? m[1] : null;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

module.exports = { getTranscript };

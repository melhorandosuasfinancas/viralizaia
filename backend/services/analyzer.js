const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1'
});

const CLIP_MIN_SECONDS = 20;
const CLIP_MAX_SECONDS = 120;

async function findBestSegments(transcript, originalUrl = '', maxClips = 3, targetDuration = 60) {
  if (!transcript || transcript.length === 0) {
    return splitEqually(transcript, maxClips, targetDuration);
  }

  const MAX_CHARS = 14000; // ~3500 tokens — evita 413 no Groq
  let fullText = transcript.map(s => `[${s.start.toFixed(1)}s] ${s.text}`).join('\n');
  if (fullText.length > MAX_CHARS) {
    // Preserva começo e fim do vídeo (mais ricos em conteúdo viral)
    const half = Math.floor(MAX_CHARS / 2);
    fullText = fullText.slice(0, half) + '\n[...trecho do meio omitido...]\n' + fullText.slice(-half);
  }
  const videoDuration = transcript[transcript.length - 1]?.end || 0;

  const prompt = `Você é um especialista em criação de conteúdo viral para TikTok e Instagram.

Analise a transcrição abaixo de um vídeo (duração total: ${Math.round(videoDuration)}s) e identifique os ${maxClips} melhores momentos para criar cortes virais.

Critérios para selecionar os melhores momentos:
- Momentos com informação valiosa ou surpreendente
- Piadas, histórias emocionantes ou revelações
- Pontos de virada, dicas práticas
- Trechos que gerem curiosidade ou engajamento
- Cada corte deve ter APROXIMADAMENTE ${targetDuration} segundos (tolerancia: ${Math.round(targetDuration * 0.3)}s)

Transcrição:
${fullText}

Responda SOMENTE com JSON válido neste formato (sem explicações):
{
  "segments": [
    {
      "start": 0.0,
      "end": 60.0,
      "title": "Título curto e chamativo para o clip",
      "hook": "Frase de gancho para legenda (máx 100 chars)",
      "viralScore": 8
    }
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1000
    });

    const parsed = JSON.parse(response.choices[0].message.content);
    let segments = parsed.segments || [];

    // Valida e corrige timestamps
    segments = segments
      .filter(s => s.start >= 0 && s.end > s.start)
      .map(s => ({
        ...s,
        start: Math.max(0, s.start),
        end: Math.min(videoDuration, s.end),
        duration: s.end - s.start
      }))
      .filter(s => s.duration >= Math.round(targetDuration * 0.5))
      .slice(0, maxClips);

    return segments.length > 0 ? segments : splitEqually(transcript, maxClips, targetDuration);

  } catch (err) {
    console.error('GPT analysis failed, using equal split:', err.message);
    return splitEqually(transcript, maxClips, targetDuration);
  }
}

function splitEqually(transcript, maxClips = 3, targetDuration = 60) {
  if (!transcript || transcript.length === 0) return [];

  const videoDuration = transcript[transcript.length - 1]?.end || 60;
  const clipDuration = targetDuration;
  const segments = [];

  for (let start = 0; start < videoDuration && segments.length < maxClips; start += clipDuration) {
    const end = Math.min(start + clipDuration, videoDuration);
    if (end - start < 15) break;

    segments.push({
      start,
      end,
      title: `Parte ${segments.length + 1}`,
      hook: 'Confira esse trecho incrível!',
      viralScore: 5,
      duration: end - start
    });
  }

  return segments;
}

module.exports = { findBestSegments, splitEqually };

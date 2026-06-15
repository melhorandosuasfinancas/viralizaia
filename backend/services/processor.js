const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');

const PLATFORM_CONFIGS = {
  tiktok:           { width: 1080, height: 1920, aspectRatio: '9:16', label: 'TikTok' },
  instagram_reels:  { width: 1080, height: 1920, aspectRatio: '9:16', label: 'Instagram Reels' },
  instagram_feed:   { width: 1080, height: 1350, aspectRatio: '4:5',  label: 'Instagram Feed' },
  instagram_square: { width: 1080, height: 1080, aspectRatio: '1:1',  label: 'Instagram Quadrado' },
  facebook:         { width: 1280, height: 720,  aspectRatio: '16:9', label: 'Facebook' },
  youtube_shorts:   { width: 1080, height: 1920, aspectRatio: '9:16', label: 'YouTube Shorts' }
};

const PLATFORM_MAP = {
  tiktok:    ['tiktok'],
  instagram: ['instagram_reels', 'instagram_feed'],
  facebook:  ['facebook'],
  youtube:   ['youtube_shorts'],
  all:       Object.keys(PLATFORM_CONFIGS)
};

// Presets de legenda — inspirados em Opus Clip, Submagic, Klap
// Cores em formato ASS: &HAABBGGRR (alpha, blue, green, red)
const CAPTION_PRESETS = {
  tiktok: {
    fontName: 'Liberation Sans',
    fontSize: 58,
    primaryColour: '&H00FFFFFF',
    outlineColour: '&H00000000',
    backColour: '&H00000000',
    bold: true,
    outline: 3,
    shadow: 0,
    borderStyle: 1,
    alignment: 2,
    marginV: 130,
    animation: 'pop'       // fade-in + scale bounce
  },
  hormozi: {
    fontName: 'Liberation Sans',
    fontSize: 62,
    primaryColour: '&H00FFFFFF',
    outlineColour: '&H0000BFFF', // amarelo (BGR)
    backColour: '&H00000000',
    bold: true,
    outline: 4,
    shadow: 0,
    borderStyle: 1,
    alignment: 2,
    marginV: 110,
    animation: 'zoom'      // zoom in do centro
  },
  dark: {
    fontName: 'Liberation Sans',
    fontSize: 52,
    primaryColour: '&H00FFFFFF',
    outlineColour: '&H00000000',
    backColour: '&H99000000', // caixa semi-transparente
    bold: true,
    outline: 0,
    shadow: 0,
    borderStyle: 3, // box
    alignment: 2,
    marginV: 110,
    animation: 'slide'     // desliza de baixo para cima
  },
  clean: {
    fontName: 'Liberation Sans',
    fontSize: 48,
    primaryColour: '&H00F5F5F5',
    outlineColour: '&H00000000',
    backColour: '&H00000000',
    bold: false,
    outline: 2,
    shadow: 1,
    borderStyle: 1,
    alignment: 2,
    marginV: 130,
    animation: 'fade'      // fade simples, sem bounce
  },
  opensans: {
    fontName: 'Open Sans',
    fontSize: 56,
    primaryColour: '&H00FFFFFF',
    outlineColour: '&H00000000',
    backColour: '&H00000000',
    bold: true,
    outline: 3,
    shadow: 0,
    borderStyle: 1,
    alignment: 2,
    marginV: 125,
    animation: 'pop'
  },
  ubuntu: {
    fontName: 'Ubuntu',
    fontSize: 56,
    primaryColour: '&H00FFFFFF',
    outlineColour: '&H00ED3A7C',
    backColour: '&H00000000',
    bold: true,
    outline: 3,
    shadow: 0,
    borderStyle: 1,
    alignment: 2,
    marginV: 120,
    animation: 'zoom'
  },
  montserrat: {
    fontName: 'Montserrat',
    fontSize: 60,
    primaryColour: '&H00FFFFFF',
    outlineColour: '&H00000000',
    backColour: '&H00000000',
    bold: true,
    outline: 3,
    shadow: 1,
    borderStyle: 1,
    alignment: 2,
    marginV: 115,
    animation: 'slide'
  },
  neon: {
    fontName: 'DejaVu Sans',
    fontSize: 54,
    primaryColour: '&H00FFFF00',
    outlineColour: '&H00000000',
    backColour: '&H00000000',
    bold: true,
    outline: 3,
    shadow: 1,
    borderStyle: 1,
    alignment: 2,
    marginV: 120,
    animation: 'pop'
  }
};


function hexToASS(hex) {
  const r = hex.slice(1, 3);
  const g = hex.slice(3, 5);
  const b = hex.slice(5, 7);
  return ('&H00' + b + g + r).toUpperCase();
}

async function createClips(videoPath, segments, platforms, outputDir, jobId, onProgress, transcriptSegs, captionStyle, addWatermark = false, captionColor = null) {
  const clips = [];
  const configs = getConfigs(platforms);
  const total = segments.length * configs.length;
  let done = 0;

  // Renderiza todos os clips em paralelo (segmento × plataforma)
  const tasks = [];
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    for (const configKey of configs) {
      tasks.push({ i, segment, configKey });
    }
  }

  // Processa em lotes de 3 para não sobrecarregar o servidor
  const CONCURRENCY = 3;
  for (let t = 0; t < tasks.length; t += CONCURRENCY) {
    const batch = tasks.slice(t, t + CONCURRENCY);
    const results = await Promise.all(batch.map(async ({ i, segment, configKey }) => {
      const config = PLATFORM_CONFIGS[configKey];
      const fileName = `clip_${i + 1}_${configKey}.mp4`;
      const outputPath = path.join(outputDir, fileName);

      let assPath = null;
      if (transcriptSegs && transcriptSegs.length > 0) {
        const assContent = buildAssContent(transcriptSegs, segment.start, segment.end, config.width, config.height, captionStyle || 'tiktok', captionColor);
        if (assContent) {
          assPath = path.join(os.tmpdir(), `sub_${jobId}_${i}_${configKey}.ass`);
          await fs.writeFile(assPath, assContent, 'utf8');
        }
      }

      try {
        await renderClip(videoPath, segment, config, outputPath, assPath, addWatermark);
        return {
          clipNumber: i + 1,
          platform: configKey,
          platformLabel: config.label,
          title: segment.title || `Clip ${i + 1}`,
          hook: segment.hook || '',
          viralScore: segment.viralScore || 5,
          duration: Math.round(segment.end - segment.start),
          fileName,
          downloadUrl: `/download/${jobId}/${fileName}`,
          aspectRatio: config.aspectRatio
        };
      } catch (err) {
        console.error(`Erro ao renderizar ${fileName}:`, err.message);
        return null;
      } finally {
        if (assPath) await fs.remove(assPath).catch(() => {});
      }
    }));

    results.forEach(r => { if (r) clips.push(r); });
    done += batch.length;
    if (onProgress) onProgress(done, total);
  }

  return clips;
}

function renderClip(videoPath, segment, config, outputPath, assPath, addWatermark = false) {
  const { width, height } = config;
  const isVertical = height > width;
  const isSquare = width === height;

  return new Promise((resolve, reject) => {
    const cmd = ffmpeg(videoPath)
      .setStartTime(segment.start)
      .setDuration(segment.end - segment.start)
      .videoCodec('libx264')
      .audioCodec('aac')
      .audioBitrate('128k')
      .outputOptions([
        '-preset fast',
        '-crf 19',
        '-movflags +faststart',
        '-pix_fmt yuv420p',
        '-threads 2'
      ])
      .output(outputPath)
      .on('end', resolve)
      .on('error', (err) => reject(err));

    if (isVertical || isSquare) {
      // Blurred background: full content visible (no aggressive crop) + blurred fill
      // Same technique used by Opus Clip, Klap, Submagic for 16:9 → 9:16 conversion
      const filterParts = [
        `[0:v]split=2[bg_in][fg_in]`,
        `[bg_in]scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height},boxblur=20:5[bg]`,
        `[fg_in]scale=${width}:${height}:force_original_aspect_ratio=decrease[fg]`,
        `[bg][fg]overlay=(W-w)/2:(H-h)/2[base]`
      ];
      let lastOut = 'base';
      if (assPath) {
        const safePath = assPath.replace(/\\/g, '/').replace(/'/g, "\\'");
        filterParts.push(`[base]ass='${safePath}'[sub]`);
        lastOut = 'sub';
      }
      if (addWatermark) {
        const wFontSize = Math.max(20, Math.round(height / 42));
        const wY       = Math.max(10, Math.round(height / 30));
        filterParts.push(`[${lastOut}]drawtext=text='Viraliza Cortes':x=(w-text_w)/2:y=h-th-${wY}:fontsize=${wFontSize}:fontcolor=white@0.65:shadowcolor=black@0.75:shadowx=2:shadowy=2[wm]`);
        lastOut = 'wm';
      }
      cmd.complexFilter(filterParts.join(';'));
      cmd.outputOptions(['-map', `[${lastOut}]`, '-map', '0:a:0?']);
    } else {
      // Horizontal (16:9): scale to fit with black letterbox
      const filters = [
        `scale=${width}:${height}:force_original_aspect_ratio=decrease`,
        `pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:black`
      ];
      if (assPath) {
        const safePath = assPath.replace(/\\/g, '/').replace(/'/g, "\\'");
        filters.push(`ass='${safePath}'`);
      }
      if (addWatermark) {
        const wFontSize = Math.max(20, Math.round(height / 42));
        const wY       = Math.max(10, Math.round(height / 30));
        filters.push(`drawtext=text='Viraliza Cortes':x=(w-text_w)/2:y=h-th-${wY}:fontsize=${wFontSize}:fontcolor=white@0.65:shadowcolor=black@0.75:shadowx=2:shadowy=2`);
      }
      cmd.videoFilters(filters);
    }

    cmd.run();
  });
}

function buildAssContent(transcriptSegs, clipStart, clipEnd, width, height, style, captionColor) {
  const preset = Object.assign({}, CAPTION_PRESETS[style] || CAPTION_PRESETS.tiktok);
  if (captionColor && /^#[0-9A-Fa-f]{6}$/.test(captionColor)) {
    preset.primaryColour = hexToASS(captionColor);
  }

  const scaledFontSize = Math.round(preset.fontSize * height / 1280);
  const scaledMarginV  = Math.round(preset.marginV  * height / 1280);

  const segs = transcriptSegs
    .filter(s => s.end > clipStart && s.start < clipEnd)
    .map(s => ({ ...s, start: s.start - clipStart, end: s.end - clipStart }))
    .filter(s => s.end > s.start && s.text);

  if (!segs.length) return null;

  const bold        = preset.bold ? '-1' : '0';
  const outline     = preset.outline;
  const shadow      = preset.shadow;
  const alignment   = preset.alignment  || 2;
  const borderStyle = preset.borderStyle || 1;

  // ── Word-chunk events (viral pop-in style) ─────────────────────────────
  // Each chunk = up to 3 words that appear together as the speaker says them.
  // Words are distributed evenly within each transcript segment's time range.
  const CHUNK_SIZE = 3;
  const wordEvents = [];

  for (const seg of segs) {
    const words = seg.text.trim().split(/\s+/).filter(Boolean);
    if (!words.length) continue;
    const wordDur = (seg.end - seg.start) / words.length;

    for (let i = 0; i < words.length; i += CHUNK_SIZE) {
      const chunk    = words.slice(i, i + CHUNK_SIZE);
      const chunkStart = seg.start + i * wordDur;
      const chunkEnd   = seg.start + Math.min(i + CHUNK_SIZE, words.length) * wordDur;
      wordEvents.push({ start: chunkStart, end: chunkEnd, text: chunk.join(' ') });
    }
  }

  if (!wordEvents.length) return null;

  const header = [
    '[Script Info]',
    'ScriptType: v4.00+',
    'PlayResX: ' + width,
    'PlayResY: ' + height,
    'WrapStyle: 0',
    '',
    '[V4+ Styles]',
    'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
    `Style: Default,${preset.fontName},${scaledFontSize},${preset.primaryColour},${preset.primaryColour},${preset.outlineColour},${preset.backColour},${bold},0,0,0,100,100,0,0,${borderStyle},${outline},${shadow},${alignment},30,30,${scaledMarginV},1`,
    '',
    '[Events]',
    'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text'
  ];

  // Pop-in animation: fade in 80ms + quick scale bounce (105% → 100%)
  const pop = '{\\fad(60,0)\\t(0,100,\\fscx105\\fscy105)\\t(100,180,\\fscx100\\fscy100)}';
  const zoom = '{\\fad(60,0)\\fscx30\\fscy30\\t(0,160,\\fscx100\\fscy100)}';
  const fadein = '{\\fad(120,60)}';

  const animType = preset.animation || 'pop';

  // Slide: moves from slideOffset below final position upward
  const slideOffsetPx = Math.round(40 * height / 1280);
  const centerX = Math.round(width / 2);
  const finalY = height - scaledMarginV;

  function getAnimTag() {
    if (animType === 'zoom')  return zoom;
    if (animType === 'fade')  return fadein;
    if (animType === 'slide') return `{\\fad(80,0)\\move(${centerX},${finalY + slideOffsetPx},${centerX},${finalY},0,200)}`;
    return pop; // default: pop
  }

  const events = wordEvents.map(e =>
    `Dialogue: 0,${assTime(e.start)},${assTime(e.end)},Default,,0,0,0,,${getAnimTag()}${e.text}`
  );

  return [...header, ...events].join('\n');
}

function wrapText(text, maxWidth) {
  if (text.length <= maxWidth) return text;
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    if (line.length + word.length + 1 > maxWidth && line) {
      lines.push(line.trim());
      line = '';
    }
    line += (line ? ' ' : '') + word;
  }
  if (line) lines.push(line.trim());
  return lines.slice(0, 2).join('\\N'); // máx 2 linhas
}

function assTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const cs = Math.round((seconds % 1) * 100);
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

function getConfigs(platforms) {
  const configs = new Set();
  for (const platform of platforms) {
    const mapped = PLATFORM_MAP[platform] || [platform];
    mapped.forEach(c => { if (PLATFORM_CONFIGS[c]) configs.add(c); });
  }
  return configs.size > 0 ? [...configs] : ['tiktok', 'instagram_reels'];
}

module.exports = { createClips, PLATFORM_CONFIGS, CAPTION_PRESETS };

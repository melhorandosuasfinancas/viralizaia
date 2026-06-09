const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');

const PLATFORM_CONFIGS = {
  tiktok:           { width: 720,  height: 1280, aspectRatio: '9:16', label: 'TikTok' },
  instagram_reels:  { width: 720,  height: 1280, aspectRatio: '9:16', label: 'Instagram Reels' },
  instagram_feed:   { width: 720,  height: 900,  aspectRatio: '4:5',  label: 'Instagram Feed' },
  instagram_square: { width: 720,  height: 720,  aspectRatio: '1:1',  label: 'Instagram Quadrado' },
  facebook:         { width: 854,  height: 480,  aspectRatio: '16:9', label: 'Facebook' },
  youtube_shorts:   { width: 720,  height: 1280, aspectRatio: '9:16', label: 'YouTube Shorts' }
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
    marginV: 130
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
    marginV: 110
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
    marginV: 110
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
    marginV: 130
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
    marginV: 125
  },
  ubuntu: {
    fontName: 'Ubuntu',
    fontSize: 56,
    primaryColour: '&H00FFFFFF',
    outlineColour: '&H007C3AED',
    backColour: '&H00000000',
    bold: true,
    outline: 3,
    shadow: 0,
    borderStyle: 1,
    alignment: 2,
    marginV: 120
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
    marginV: 115
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
    marginV: 120
  }
};

async function createClips(videoPath, segments, platforms, outputDir, jobId, onProgress, transcriptSegs, captionStyle, addWatermark = false) {
  const clips = [];
  const configs = getConfigs(platforms);
  const total = segments.length * configs.length;
  let done = 0;

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];

    for (const configKey of configs) {
      const config = PLATFORM_CONFIGS[configKey];
      const fileName = `clip_${i + 1}_${configKey}.mp4`;
      const outputPath = path.join(outputDir, fileName);

      // Cria arquivo ASS de legenda para este clip se houver transcrição
      let assPath = null;
      if (transcriptSegs && transcriptSegs.length > 0) {
        const assContent = buildAssContent(transcriptSegs, segment.start, segment.end, config.width, config.height, captionStyle || 'tiktok');
        if (assContent) {
          assPath = path.join(os.tmpdir(), `sub_${jobId}_${i}_${configKey}.ass`);
          await fs.writeFile(assPath, assContent, 'utf8');
        }
      }

      try {
        await renderClip(videoPath, segment, config, outputPath, assPath, addWatermark);

        clips.push({
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
        });
      } catch (err) {
        console.error(`Erro ao renderizar ${fileName}:`, err.message);
      } finally {
        if (assPath) await fs.remove(assPath).catch(() => {});
      }

      done++;
      if (onProgress) onProgress(done, total);
    }
  }

  return clips;
}

function renderClip(videoPath, segment, config, outputPath, assPath, addWatermark = false) {
  const { width, height } = config;

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
    const wY = Math.max(10, Math.round(height / 30));
    filters.push(`drawtext=text='Viraliza Cortes':x=(w-text_w)/2:y=h-th-${wY}:fontsize=${wFontSize}:fontcolor=white@0.65:shadowcolor=black@0.75:shadowx=2:shadowy=2`);
  }

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .setStartTime(segment.start)
      .setDuration(segment.end - segment.start)
      .videoFilters(filters)
      .videoCodec('libx264')
      .audioCodec('aac')
      .audioBitrate('128k')
      .videoBitrate('1500k')
      .outputOptions([
        '-preset ultrafast',
        '-crf 23',
        '-movflags +faststart',
        '-pix_fmt yuv420p',
        '-threads 2'
      ])
      .output(outputPath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}

function buildAssContent(transcriptSegs, clipStart, clipEnd, width, height, style) {
  const preset = CAPTION_PRESETS[style] || CAPTION_PRESETS.tiktok;

  // Escala fonte proporcionalmente à altura (referência: 1280px)
  const scaledFontSize = Math.round(preset.fontSize * height / 1280);
  const scaledMarginV = Math.round(preset.marginV * height / 1280);

  const segs = transcriptSegs
    .filter(s => s.end > clipStart && s.start < clipEnd)
    .map(s => ({
      start: Math.max(0, s.start - clipStart),
      end: Math.min(clipEnd - clipStart, s.end - clipStart),
      text: wrapText(s.text.trim(), width < 600 ? 40 : 32)
    }))
    .filter(s => s.end > s.start && s.text);

  if (segs.length === 0) return null;

  const bold = preset.bold ? -1 : 0;
  const outline = preset.outline || 2;
  const shadow = preset.shadow || 0;
  const borderStyle = preset.borderStyle || 1;
  const alignment = preset.alignment || 2;

  const header = [
    '[Script Info]',
    'ScriptType: v4.00+',
    `PlayResX: ${width}`,
    `PlayResY: ${height}`,
    'Collisions: Normal',
    'WrapStyle: 0',
    '',
    '[V4+ Styles]',
    'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
    `Style: Default,${preset.fontName},${scaledFontSize},${preset.primaryColour},${preset.primaryColour},${preset.outlineColour},${preset.backColour},${bold},0,0,0,100,100,0,0,${borderStyle},${outline},${shadow},${alignment},30,30,${scaledMarginV},1`,
    '',
    '[Events]',
    'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text'
  ].join('\n');

  const events = segs.map(seg =>
    `Dialogue: 0,${assTime(seg.start)},${assTime(seg.end)},Default,,0,0,0,,${seg.text}`
  );

  return header + '\n' + events.join('\n');
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

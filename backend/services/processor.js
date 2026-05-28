const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs-extra');

// Formatos por plataforma
const PLATFORM_CONFIGS = {
  tiktok: {
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    label: 'TikTok'
  },
  instagram_reels: {
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    label: 'Instagram Reels'
  },
  instagram_feed: {
    width: 1080,
    height: 1350,
    aspectRatio: '4:5',
    label: 'Instagram Feed'
  },
  instagram_square: {
    width: 1080,
    height: 1080,
    aspectRatio: '1:1',
    label: 'Instagram Quadrado'
  },
  facebook: {
    width: 1280,
    height: 720,
    aspectRatio: '16:9',
    label: 'Facebook'
  },
  youtube_shorts: {
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    label: 'YouTube Shorts'
  }
};

// Mapeia plataforma solicitada para configs específicas
const PLATFORM_MAP = {
  tiktok: ['tiktok'],
  instagram: ['instagram_reels', 'instagram_feed'],
  facebook: ['facebook'],
  youtube: ['youtube_shorts'],
  all: Object.keys(PLATFORM_CONFIGS)
};

async function createClips(videoPath, segments, platforms, outputDir, jobId) {
  const clips = [];
  const configs = getConfigs(platforms);

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];

    for (const configKey of configs) {
      const config = PLATFORM_CONFIGS[configKey];
      const fileName = `clip_${i + 1}_${configKey}.mp4`;
      const outputPath = path.join(outputDir, fileName);

      try {
        await renderClip(videoPath, segment, config, outputPath);

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
      }
    }
  }

  return clips;
}

function renderClip(videoPath, segment, config, outputPath) {
  const { width, height } = config;

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .setStartTime(segment.start)
      .setDuration(segment.end - segment.start)
      .videoFilters([
        `scale=${width}:${height}:force_original_aspect_ratio=decrease`,
        `pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:black`
      ])
      .videoCodec('libx264')
      .audioCodec('aac')
      .audioBitrate('128k')
      .videoBitrate('1500k')
      .outputOptions([
        '-preset ultrafast',
        '-crf 23',
        '-movflags +faststart',
        '-pix_fmt yuv420p',
        '-threads 1'
      ])
      .output(outputPath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}

function getConfigs(platforms) {
  const configs = new Set();
  for (const platform of platforms) {
    const mapped = PLATFORM_MAP[platform] || [platform];
    mapped.forEach(c => {
      if (PLATFORM_CONFIGS[c]) configs.add(c);
    });
  }
  return configs.size > 0 ? [...configs] : ['tiktok', 'instagram_reels'];
}

module.exports = { createClips, PLATFORM_CONFIGS };

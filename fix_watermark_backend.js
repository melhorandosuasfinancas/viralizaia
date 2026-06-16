const fs = require('fs');
const filePath = '/root/viralizaia/backend/routes/video.js';
let content = fs.readFileSync(filePath, 'utf8');
let changed = 0;

function replace(old, neu) {
  if (!content.includes(old)) {
    console.log('MISS:', old.slice(0, 80));
    return;
  }
  content = content.replace(old, neu);
  changed++;
}

// 1. Upload route: extract addWatermark from body
replace(
  `  const { platforms = '["tiktok","instagram"]', mode = 'ai', maxClips, captionStyle = 'tiktok', targetDuration = 60, captionColor = '#FFFFFF' } = req.body;`,
  `  const { platforms = '["tiktok","instagram"]', mode = 'ai', maxClips, captionStyle = 'tiktok', targetDuration = 60, captionColor = '#FFFFFF', addWatermark: bodyWatermark } = req.body;
  const addWatermarkUpload = (req.userPlan === 'trial' || req.userPlan === 'gratis') ? true : (bodyWatermark !== false && bodyWatermark !== 'false');`
);

// 2. Upload route: pass addWatermark to processVideoFromFile
replace(
  `  processVideoFromFile(jobId, destPath, tempDir, parsedPlatforms, mode, clipsToProcess, captionStyle, req.userEmail, req.userPlan, parseInt(targetDuration) || 60, captionColor)`,
  `  processVideoFromFile(jobId, destPath, tempDir, parsedPlatforms, mode, clipsToProcess, captionStyle, req.userEmail, req.userPlan, parseInt(targetDuration) || 60, captionColor, addWatermarkUpload)`
);

// 3. Process route: extract addWatermark + forward
replace(
  `  const { url, platforms = ['tiktok', 'instagram'], mode = 'ai', maxClips, captionStyle = 'tiktok', targetDuration = 60, captionColor = '#FFFFFF' } = req.body;`,
  `  const { url, platforms = ['tiktok', 'instagram'], mode = 'ai', maxClips, captionStyle = 'tiktok', targetDuration = 60, captionColor = '#FFFFFF', addWatermark: bodyWatermarkP } = req.body;
  const addWatermarkProcess = (req.userPlan === 'trial' || req.userPlan === 'gratis') ? true : (bodyWatermarkP !== false && bodyWatermarkP !== 'false');`
);

replace(
  `  processVideo(jobId, url, platforms, mode, clipsToProcess, captionStyle, req.userEmail, req.userPlan, parseInt(targetDuration) || 60, captionColor)`,
  `  processVideo(jobId, url, platforms, mode, clipsToProcess, captionStyle, req.userEmail, req.userPlan, parseInt(targetDuration) || 60, captionColor, addWatermarkProcess)`
);

// 4. processVideo signature
replace(
  `async function processVideo(jobId, url, platforms, mode, maxClips, captionStyle, userEmail, userPlan, targetDuration = 60, captionColor = '#FFFFFF') {`,
  `async function processVideo(jobId, url, platforms, mode, maxClips, captionStyle, userEmail, userPlan, targetDuration = 60, captionColor = '#FFFFFF', addWatermark = true) {`
);

// 5. processVideoFromFile signature
replace(
  `async function processVideoFromFile(jobId, videoPath, tempDir, platforms, mode, maxClips, captionStyle, userEmail, userPlan, targetDuration = 60, captionColor = '#FFFFFF') {`,
  `async function processVideoFromFile(jobId, videoPath, tempDir, platforms, mode, maxClips, captionStyle, userEmail, userPlan, targetDuration = 60, captionColor = '#FFFFFF', addWatermark = true) {`
);

// 6. processVideoFromFile → processFromPath: pass addWatermark
replace(
  `    await processFromPath(jobId, videoPath, tempDir, outputDir, platforms, mode, maxClips, captionStyle, null, null, userEmail, userPlan, targetDuration, captionColor);`,
  `    await processFromPath(jobId, videoPath, tempDir, outputDir, platforms, mode, maxClips, captionStyle, null, null, userEmail, userPlan, targetDuration, captionColor, addWatermark);`
);

// 7. processVideo → processFromPath (fallback path): pass addWatermark
replace(
  `    await processFromPath(jobId, videoPath, tempDir, outputDir, platforms, mode, maxClips, captionStyle, url, null, userEmail, userPlan, targetDuration, captionColor);`,
  `    await processFromPath(jobId, videoPath, tempDir, outputDir, platforms, mode, maxClips, captionStyle, url, null, userEmail, userPlan, targetDuration, captionColor, addWatermark);`
);

// 8. processFromPath signature
replace(
  `async function processFromPath(jobId, videoPath, tempDir, outputDir, platforms, mode, maxClips, captionStyle, url, existingTranscript, userEmail, userPlan, targetDuration = 60, captionColor = '#FFFFFF') {`,
  `async function processFromPath(jobId, videoPath, tempDir, outputDir, platforms, mode, maxClips, captionStyle, url, existingTranscript, userEmail, userPlan, targetDuration = 60, captionColor = '#FFFFFF', addWatermark = true) {`
);

// 9. processFromPath → createClips: replace userPlan === 'trial' with addWatermark
replace(
  `    userPlan === 'trial',
    captionColor
  );

  finalizeJob(userEmail, userPlan, segments.length);`,
  `    addWatermark,
    captionColor
  );

  finalizeJob(userEmail, userPlan, segments.length);`
);

// 10. Fast path createClips (transcript API, segments loop)
replace(
  `          userPlan === 'trial',
          captionColor
        );
        clips.push(...clipsResult);
      }

      if (clips.length > 0) {
        finalizeJob(userEmail, userPlan, segDownloads.filter(s => s.segPath).length);
        updateJob({ status: 'done', progress: 100, clips });
        return;
      }
    }

    // Fallback: audio-only`,
  `          addWatermark,
          captionColor
        );
        clips.push(...clipsResult);
      }

      if (clips.length > 0) {
        finalizeJob(userEmail, userPlan, segDownloads.filter(s => s.segPath).length);
        updateJob({ status: 'done', progress: 100, clips });
        return;
      }
    }

    // Fallback: audio-only`
);

// 11. Audio-only fallback createClips
replace(
  `          userPlan === 'trial',
          captionColor
        );
        clips.push(...clipsResult);
      }

      if (clips.length > 0) {
        finalizeJob(userEmail, userPlan, segDownloads.filter(s => s.segPath).length);
        updateJob({ status: 'done', progress: 100, clips });
        return;
      }
      videoPath = audioPath;`,
  `          addWatermark,
          captionColor
        );
        clips.push(...clipsResult);
      }

      if (clips.length > 0) {
        finalizeJob(userEmail, userPlan, segDownloads.filter(s => s.segPath).length);
        updateJob({ status: 'done', progress: 100, clips });
        return;
      }
      videoPath = audioPath;`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log(`OK: ${changed} substituicoes realizadas`);

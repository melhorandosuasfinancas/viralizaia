const fs = require('fs');

// Fix 1: processor.js — add clipOffset parameter
const procPath = '/root/viralizaia/backend/services/processor.js';
let proc = fs.readFileSync(procPath, 'utf8');

proc = proc.replace(
  'async function createClips(videoPath, segments, platforms, outputDir, jobId, onProgress, transcriptSegs, captionStyle, addWatermark = false, captionColor = null) {',
  'async function createClips(videoPath, segments, platforms, outputDir, jobId, onProgress, transcriptSegs, captionStyle, addWatermark = false, captionColor = null, clipOffset = 0) {'
);

proc = proc.replace(
  'const fileName = `clip_${i + 1}_${configKey}.mp4`;',
  'const fileName = `clip_${clipOffset + i + 1}_${configKey}.mp4`;'
);

// Also fix the clipNumber returned
proc = proc.replace(
  'clipNumber: i + 1,',
  'clipNumber: clipOffset + i + 1,'
);

// Also fix the title fallback
proc = proc.replace(
  'title: segment.title || `Clip ${i + 1}`,',
  'title: segment.title || `Clip ${clipOffset + i + 1}`,'
);

fs.writeFileSync(procPath, proc);
console.log('OK: processor.js clipOffset added');

// Fix 2: video.js — pass i as clipOffset in the transcript fast path loop
const videoPath = '/root/viralizaia/backend/routes/video.js';
let video = fs.readFileSync(videoPath, 'utf8');

// Fix transcript API fast path (first createClips call in the loop)
const OLD_FAST = `        const clipsResult = await processor.createClips(
          segPath,
          [adjustedSeg],
          platforms,
          outputDir,
          jobId,
          (done, total) => updateJob({ progress: Math.round(50 + ((i * total + done) / (segments.length * total)) * 45) }),
          adjustedTranscript,
          captionStyle,
          addWatermark,
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

    // Fallback: audio-only`;

const NEW_FAST = `        const clipsResult = await processor.createClips(
          segPath,
          [adjustedSeg],
          platforms,
          outputDir,
          jobId,
          (done, total) => updateJob({ progress: Math.round(50 + ((i * total + done) / (segments.length * total)) * 45) }),
          adjustedTranscript,
          captionStyle,
          addWatermark,
          captionColor,
          i
        );
        clips.push(...clipsResult);
      }

      if (clips.length > 0) {
        finalizeJob(userEmail, userPlan, segDownloads.filter(s => s.segPath).length);
        updateJob({ status: 'done', progress: 100, clips });
        return;
      }
    }

    // Fallback: audio-only`;

if (video.includes(OLD_FAST)) {
  video = video.replace(OLD_FAST, NEW_FAST);
  console.log('OK: video.js transcript fast path fixed');
} else {
  console.log('MISS: transcript fast path pattern not found');
}

// Fix audio-only fallback path
const OLD_AUDIO = `        const clipsResult = await processor.createClips(
          segPath,
          [adjustedSeg],
          platforms,
          outputDir,
          jobId,
          (done, total) => updateJob({ progress: Math.round(65 + ((i * total + done) / (audioSegments.length * total)) * 30) }),
          adjustedTranscript,
          captionStyle,
          addWatermark,
          captionColor
        );
        clips.push(...clipsResult);
      }

      if (clips.length > 0) {
        finalizeJob(userEmail, userPlan, segDownloads.filter(s => s.segPath).length);
        updateJob({ status: 'done', progress: 100, clips });
        return;
      }
      videoPath = audioPath;`;

const NEW_AUDIO = `        const clipsResult = await processor.createClips(
          segPath,
          [adjustedSeg],
          platforms,
          outputDir,
          jobId,
          (done, total) => updateJob({ progress: Math.round(65 + ((i * total + done) / (audioSegments.length * total)) * 30) }),
          adjustedTranscript,
          captionStyle,
          addWatermark,
          captionColor,
          i
        );
        clips.push(...clipsResult);
      }

      if (clips.length > 0) {
        finalizeJob(userEmail, userPlan, segDownloads.filter(s => s.segPath).length);
        updateJob({ status: 'done', progress: 100, clips });
        return;
      }
      videoPath = audioPath;`;

if (video.includes(OLD_AUDIO)) {
  video = video.replace(OLD_AUDIO, NEW_AUDIO);
  console.log('OK: video.js audio-only fallback fixed');
} else {
  console.log('MISS: audio-only fallback pattern not found');
}

fs.writeFileSync(videoPath, video);
console.log('DONE: clip numbering fixed in both files');

const fs = require('fs');
const path = '/root/viralizaia/backend/services/processor.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Speed: veryfast + crf 21 + all threads + strip metadata
const OLD_OPTIONS = `      .outputOptions([
        '-preset fast',
        '-crf 19',
        '-movflags +faststart',
        '-pix_fmt yuv420p',
        '-threads 2'
      ])`;
const NEW_OPTIONS = `      .outputOptions([
        '-preset veryfast',
        '-crf 21',
        '-movflags +faststart',
        '-pix_fmt yuv420p',
        '-threads 0',
        '-map_metadata -1'
      ])`;

if (content.includes(OLD_OPTIONS)) {
  content = content.replace(OLD_OPTIONS, NEW_OPTIONS);
  console.log('OK: preset veryfast + threads 0 + strip metadata');
} else {
  console.log('MISS: outputOptions block not found');
  const ctxLines = content.split('\n').filter(l => l.includes('preset') || l.includes('threads'));
  ctxLines.forEach(l => console.log(' ', l.trim()));
}

// 2. Filename: use sanitized title instead of clip_N_platform
// Function to sanitize title for use as filename
const SANITIZE_FN = `
function slugify(title) {
  return title
    .normalize('NFD').replace(/[\\u0300-\\u036f]/g, '') // remove accents
    .replace(/[^a-zA-Z0-9 _-]/g, '')                    // keep alphanumeric, space, dash, underscore
    .trim()
    .replace(/\\s+/g, '_')
    .slice(0, 60) || 'clip';
}
`;

// Insert slugify before createClips function
const CREATE_CLIPS_LINE = 'async function createClips(';
if (!content.includes('function slugify')) {
  content = content.replace(CREATE_CLIPS_LINE, SANITIZE_FN + CREATE_CLIPS_LINE);
  console.log('OK: slugify function added');
} else {
  console.log('INFO: slugify already present');
}

// 3. Change fileName to use title
const OLD_FILENAME = 'const fileName = `clip_${clipOffset + i + 1}_${configKey}.mp4`;';
const NEW_FILENAME = `const clipTitle = segment.title ? slugify(segment.title) : \`clip_\${clipOffset + i + 1}\`;
      const fileName = \`\${clipTitle}_\${configKey}.mp4\`;`;

if (content.includes(OLD_FILENAME)) {
  content = content.replace(OLD_FILENAME, NEW_FILENAME);
  console.log('OK: filename now uses title');
} else {
  console.log('MISS: fileName line not found');
  const lines = content.split('\n').filter(l => l.includes('fileName'));
  lines.forEach(l => console.log(' ', l.trim()));
}

fs.writeFileSync(path, content, 'utf8');
console.log('DONE');

const fs = require('fs');
const filePath = '/root/viralizaia/backend/services/processor.js';
let content = fs.readFileSync(filePath, 'utf8');

// Find and replace the broken vertical (complex filter) watermark block
// After the previous fix, it now has:
//   const logoScale = ...
//   const logoY = ...
//   const logoX = `(w-text_w)/2-${logoScale + 6}`;  <- WRONG, text_w unavailable in overlay
//   filterParts.push(`movie='...',scale=...[logo]`);
//   filterParts.push(`[lastOut][logo]overlay=x=${logoX}:y=${logoY}[withlogo]`);
//   filterParts.push(`[withlogo]drawtext=...y=${logoY}...[wm]`);

// Read current state
const lines = content.split('\n');
const startIdx = lines.findIndex(l => l.includes('const logoScale'));
const endIdx = lines.findIndex(l => l.includes("filterParts.push(`[withlogo]drawtext"));

if (startIdx === -1 || endIdx === -1) {
  console.log('Pattern not found. Lines around watermark:');
  lines.filter(l => l.includes('logo') || l.includes('drawtext') || l.includes('wm]')).forEach(l => console.log(' ', l.trim()));
  process.exit(1);
}

// Remove those lines and replace with corrected version
const before = lines.slice(0, startIdx);
const after = lines.slice(endIdx + 1);

// Detect indentation from startIdx line
const indent = lines[startIdx].match(/^(\s*)/)[1];

const newBlock = [
  `${indent}const logoScale = Math.max(20, Math.round(height / 30));`,
  `${indent}const logoY = Math.max(6, Math.round(height / 40));`,
  `${indent}const textY = logoY + logoScale + 4;`,
  `${indent}filterParts.push(\`movie='/root/viralizaia/frontend/public/logo-viraliza-cortes.png',scale=\${logoScale}:\${logoScale}[logo]\`);`,
  `${indent}filterParts.push(\`[\${lastOut}][logo]overlay=x=(W-w)/2:y=\${logoY}[withlogo]\`);`,
  `${indent}filterParts.push(\`[withlogo]drawtext=text=ViralizaIA:x=(w-text_w)/2:y=\${textY}:fontsize=\${wFontSize}:fontcolor=white@0.9:shadowcolor=black@0.85:shadowx=2:shadowy=2[wm]\`);`,
];

content = [...before, ...newBlock, ...after].join('\n');
fs.writeFileSync(filePath, content, 'utf8');
console.log('OK: watermark fixed — logo top-center + text below logo');

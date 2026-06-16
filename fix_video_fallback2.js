const fs = require('fs');
const path = '/root/viralizaia/backend/routes/video.js';
let content = fs.readFileSync(path, 'utf8');

// Fix: downloadSegment -> downloadSection with correct signature
const OLD = `          const segPath = await downloader.downloadSegment(url, tempDir, seg.start, seg.end, i);`;
const NEW = `          const segPath = await downloader.downloadSection(url, seg.start, seg.end, tempDir, i);`;

if (!content.includes(OLD)) {
  console.log('ERRO: downloadSegment nao encontrado');
  process.exit(1);
}

content = content.replace(OLD, NEW);
fs.writeFileSync(path, content, 'utf8');
console.log('OK: downloadSegment -> downloadSection corrigido');

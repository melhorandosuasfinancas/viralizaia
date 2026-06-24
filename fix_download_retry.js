const fs = require('fs');
const path = '/root/viralizaia/backend/services/downloader.js';
let content = fs.readFileSync(path, 'utf8');

const OLD = `async function downloadSection(url, start, end, outputDir, index = 0) {
  const outputPath = path.join(outputDir, \`segment_\${index}.%(ext)s\`);
  const sections = \`*\${start}-\${end}\`;

  for (const client of PLAYER_CLIENTS) {
    const cmd = buildYtDlpCmd(url, outputPath, client, sections);
    try {
      await execAsync(cmd, { timeout: 120000 });
      const files = await fs.readdir(outputDir);
      const segFile = files.find(f => f.startsWith(\`segment_\${index}.\`) && f.endsWith('.mp4'));
      if (segFile) {
        console.log(\`downloadSection \${index} (\${start}s-\${end}s) ok, client=\${client}\`);
        return path.join(outputDir, segFile);
      }
    } catch (err) {
      const segErr = (err.stderr || err.message || '').toLowerCase();
      const segBlocked = segErr.includes('sign in') || segErr.includes('bot') || segErr.includes('429') || segErr.includes('403');
      console.log(\`downloadSection client=\${client} failed: \${(err.stderr || err.message || '').slice(0, 200)}\`);
      if (segBlocked) { console.log(\`downloadSection \${index}: bot detection — pulando para WARP\`); break; }
    }
  }

  // Retry via WARP proxy
  console.log(\`downloadSection \${index}: yt-dlp direto falhou, tentando via WARP...\`);
  for (const client of PLAYER_CLIENTS) {
    const cmd = buildYtDlpCmd(url, outputPath, client, sections, WARP_PROXY);
    try {
      await execAsync(cmd, { timeout: 120000 });
      const files = await fs.readdir(outputDir);
      const segFile = files.find(f => f.startsWith(\`segment_\${index}.\`) && f.endsWith('.mp4'));
      if (segFile) {
        console.log(\`downloadSection \${index} (\${start}s-\${end}s) ok via WARP, client=\${client}\`);
        return path.join(outputDir, segFile);
      }
    } catch (err) {
      console.log(\`downloadSection WARP client=\${client} failed: \${(err.stderr || err.message || '').slice(0, 200)}\`);
    }
  }

  // Fallback: Cobalt + ffmpeg trim
  console.log(\`downloadSection \${index}: yt-dlp falhou, tentando Cobalt + trim...\`);
  const cobaltTempDir = path.join(outputDir, \`cobalt_\${index}\`);
  try {
    await fs.ensureDir(cobaltTempDir);
    const fullPath = await downloadViaCobalt(url, cobaltTempDir);
    const segOutputPath = path.join(outputDir, \`segment_\${index}.mp4\`);
    const ffmpeg = require('fluent-ffmpeg');
    await new Promise((resolve, reject) => {
      ffmpeg(fullPath)
        .setStartTime(start)
        .setDuration(end - start)
        .outputOptions(['-c', 'copy'])
        .output(segOutputPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });
    await fs.remove(cobaltTempDir).catch(() => {});
    console.log(\`downloadSection \${index} ok via Cobalt+trim\`);
    return segOutputPath;
  } catch (cobaltErr) {
    console.log(\`downloadSection \${index} Cobalt+trim falhou: \${cobaltErr.message}\`);
    await fs.remove(cobaltTempDir).catch(() => {});
  }

  return null;
}`;

const NEW = `async function downloadSection(url, start, end, outputDir, index = 0) {
  const outputPath = path.join(outputDir, \`segment_\${index}.%(ext)s\`);
  const sections = \`*\${start}-\${end}\`;
  const FAST_CLIENTS = ['android', 'ios'];
  const WARP_CLIENTS = ['android', 'android_embedded', 'ios', 'web'];
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  // 1. Tentativa direta rápida (android/ios — sem overhead de proxy)
  for (const client of FAST_CLIENTS) {
    const cmd = buildYtDlpCmd(url, outputPath, client, sections);
    try {
      await execAsync(cmd, { timeout: 90000 });
      const files = await fs.readdir(outputDir);
      const segFile = files.find(f => f.startsWith(\`segment_\${index}.\`) && f.endsWith('.mp4'));
      if (segFile) {
        console.log(\`downloadSection \${index} (\${start}s-\${end}s) ok direto, client=\${client}\`);
        return path.join(outputDir, segFile);
      }
    } catch (err) {
      const segErr = (err.stderr || err.message || '').toLowerCase();
      const blocked = segErr.includes('sign in') || segErr.includes('bot') || segErr.includes('429');
      if (blocked) break;
    }
  }

  // 2. WARP proxy — 3 rounds com pausa entre eles (IP rotation)
  console.log(\`downloadSection \${index}: tentando via WARP...\`);
  for (let round = 0; round < 3; round++) {
    for (const client of WARP_CLIENTS) {
      const cmd = buildYtDlpCmd(url, outputPath, client, sections, WARP_PROXY);
      try {
        await execAsync(cmd, { timeout: 90000 });
        const files = await fs.readdir(outputDir);
        const segFile = files.find(f => f.startsWith(\`segment_\${index}.\`) && f.endsWith('.mp4'));
        if (segFile) {
          console.log(\`downloadSection \${index} (\${start}s-\${end}s) ok WARP round=\${round} client=\${client}\`);
          return path.join(outputDir, segFile);
        }
      } catch (err) {
        console.log(\`downloadSection WARP round=\${round} client=\${client} failed\`);
      }
    }
    if (round < 2) await sleep(3000); // pausa para o WARP rotacionar IP
  }

  console.log(\`downloadSection \${index}: todos os métodos falharam\`);
  return null;
}`;

if (content.includes(OLD)) {
  content = content.replace(OLD, NEW);
  fs.writeFileSync(path, content, 'utf8');
  console.log('OK: downloadSection otimizado — Cobalt removido, WARP retry com 3 rounds');
} else {
  console.log('MISS: padrão não encontrado');
  // Mostra as primeiras linhas da função para debug
  const idx = content.indexOf('async function downloadSection');
  if (idx !== -1) console.log(content.slice(idx, idx + 200));
}

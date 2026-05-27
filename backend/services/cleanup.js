const fs = require('fs-extra');
const path = require('path');

const MAX_AGE_HOURS = 4;
const OUTPUT_DIR = path.join(__dirname, '../output');
const TEMP_DIR = path.join(__dirname, '../temp');

async function cleanupOldFiles() {
  const cutoff = Date.now() - MAX_AGE_HOURS * 60 * 60 * 1000;
  await cleanDir(OUTPUT_DIR, cutoff);
  await cleanDir(TEMP_DIR, cutoff);
}

async function cleanDir(dir, cutoff) {
  try {
    const entries = await fs.readdir(dir);
    for (const entry of entries) {
      const entryPath = path.join(dir, entry);
      const stat = await fs.stat(entryPath);
      if (stat.mtimeMs < cutoff) {
        await fs.remove(entryPath);
        console.log(`Cleanup: removido ${entryPath}`);
      }
    }
  } catch (err) {
    console.error('Cleanup error:', err.message);
  }
}

module.exports = { cleanupOldFiles };

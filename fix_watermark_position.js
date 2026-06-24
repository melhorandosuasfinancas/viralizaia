const fs = require('fs');
const filePath = '/root/viralizaia/backend/services/processor.js';
let content = fs.readFileSync(filePath, 'utf8');

// Fix the broken y= that sed left behind (y=:fontsize -> correct ones)
// and also fix any remaining y=h-th-${wY}
// The current broken state has: y=:fontsize (sed removed the value)

const LOGO_PATH = '/root/viralizaia/frontend/public/logo-viraliza-cortes.png';

// Fix vertical filter path (complex filter with filterParts array)
// Current broken: ...y=:fontsize=${wFontSize}:fontcolor=white@0.65:shadowcolor=black@0.75:shadowx=2:shadowy=2[wm]
// Also fix any y=h-th-${wY} that might remain

// Replace the broken vertical watermark (complex filter path)
const OLD_VERTICAL = "filterParts.push(`[${lastOut}]drawtext=text=Viraliza Cortes:x=(w-text_w)/2:y=:fontsize=${wFontSize}:fontcolor=white@0.65:shadowcolor=black@0.75:shadowx=2:shadowy=2[wm]`);";
const NEW_VERTICAL = `const logoScale = Math.max(24, Math.round(height / 28));
        const logoY = Math.max(8, Math.round(height / 35));
        const logoX = \`(w-text_w)/2-\${logoScale + 6}\`;
        filterParts.push(\`movie='\${LOGO_PATH}',scale=\${logoScale}:\${logoScale}[logo]\`);
        filterParts.push(\`[\${lastOut}][logo]overlay=x=\${logoX}:y=\${logoY}[withlogo]\`);
        filterParts.push(\`[withlogo]drawtext=text=Viraliza Cortes:x=(w-text_w)/2:y=\${logoY}:fontsize=\${wFontSize}:fontcolor=white@0.9:shadowcolor=black@0.85:shadowx=2:shadowy=2[wm]\`);`;

// Replace the broken horizontal watermark (simple videoFilters path)
const OLD_HORIZONTAL = "filters.push(`drawtext=text=Viraliza Cortes:x=(w-text_w)/2:y=:fontsize=${wFontSize}:fontcolor=white@0.65:shadowcolor=black@0.75:shadowx=2:shadowy=2`);";
const NEW_HORIZONTAL = "filters.push(`drawtext=text=Viraliza Cortes:x=(w-text_w)/2:y=${wY}:fontsize=${wFontSize}:fontcolor=white@0.9:shadowcolor=black@0.85:shadowx=2:shadowy=2`);";

let changed = 0;
if (content.includes(OLD_VERTICAL)) {
  content = content.replace(OLD_VERTICAL, NEW_VERTICAL);
  changed++;
  console.log('OK: vertical watermark fixed (top + logo)');
} else {
  console.log('MISS: vertical watermark not found, checking for broken state...');
  // Try the broken state where wY was removed but structure changed
  console.log('Current drawtext lines:');
  content.split('\n').filter(l => l.includes('drawtext') || l.includes('y=')).slice(0, 10).forEach(l => console.log('  ' + l.trim()));
}

if (content.includes(OLD_HORIZONTAL)) {
  content = content.replace(OLD_HORIZONTAL, NEW_HORIZONTAL);
  changed++;
  console.log('OK: horizontal watermark fixed (top)');
} else {
  console.log('MISS: horizontal watermark not found');
}

// Add LOGO_PATH constant near top of file if not already there
if (!content.includes('LOGO_PATH')) {
  content = content.replace(
    "const ffmpeg = require('fluent-ffmpeg');",
    "const ffmpeg = require('fluent-ffmpeg');\nconst LOGO_PATH = '/root/viralizaia/frontend/public/logo-viraliza-cortes.png';"
  );
  console.log('OK: LOGO_PATH constant added');
}

if (changed > 0) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('File saved with', changed, 'changes');
} else {
  console.log('No changes made');
  process.exit(1);
}

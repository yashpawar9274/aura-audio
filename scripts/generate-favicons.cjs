const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const src = path.join(root, 'src', 'assets', 'logo.png');
const destDir = path.join(root, 'public');

if (!fs.existsSync(src)) {
  console.error('Source logo not found:', src);
  process.exit(1);
}

const targets = [
  'favicon-32x32.png',
  'favicon-16x16.png',
  'favicon.png',
  'favicon.ico'
];

for (const name of targets) {
  const dest = path.join(destDir, name);
  try {
    fs.copyFileSync(src, dest);
    console.log('Wrote', dest);
  } catch (err) {
    console.error('Failed to write', dest, err);
  }
}

console.log('Done. You can run `npm run generate:favicons` to regenerate.');

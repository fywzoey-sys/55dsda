import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const publicTesseractDir = path.join(rootDir, 'public', 'tesseract');
const coreDir = path.join(publicTesseractDir, 'core');
const langDir = path.join(publicTesseractDir, 'lang');

fs.mkdirSync(coreDir, { recursive: true });
fs.mkdirSync(langDir, { recursive: true });

// Required assets manifest for Tesseract.js 7 local browser execution
const REQUIRED_CORE_FILES = [
  'tesseract-core-lstm.wasm.js',
  'tesseract-core-simd-lstm.wasm.js',
  'tesseract-core-relaxedsimd-lstm.wasm.js',
  'tesseract-core.wasm.js',
  'tesseract-core-simd.wasm.js',
  'tesseract-core-relaxedsimd.wasm.js',
];

const ASSET_SPECS = [
  {
    name: 'worker.min.js',
    src: path.join(rootDir, 'node_modules', 'tesseract.js', 'dist', 'worker.min.js'),
    dest: path.join(publicTesseractDir, 'worker.min.js'),
  },
  ...REQUIRED_CORE_FILES.map((filename) => ({
    name: `core/${filename}`,
    src: path.join(rootDir, 'node_modules', 'tesseract.js-core', filename),
    dest: path.join(coreDir, filename),
  })),
  {
    name: 'lang/eng.traineddata.gz',
    src: path.join(rootDir, 'node_modules', '@tesseract.js-data', 'eng', '4.0.0_best_int', 'eng.traineddata.gz'),
    dest: path.join(langDir, 'eng.traineddata.gz'),
  },
  {
    name: 'lang/chi_sim.traineddata.gz',
    src: path.join(rootDir, 'node_modules', '@tesseract.js-data', 'chi_sim', '4.0.0_best_int', 'chi_sim.traineddata.gz'),
    dest: path.join(langDir, 'chi_sim.traineddata.gz'),
  },
];

console.log('[copy-ocr-assets] Copying and verifying all required Tesseract.js 7 assets...');

for (const asset of ASSET_SPECS) {
  if (!fs.existsSync(asset.src)) {
    console.error(`[copy-ocr-assets] ERROR: Required source file missing: ${asset.src}`);
    process.exit(1);
  }

  const stat = fs.statSync(asset.src);
  if (stat.size === 0) {
    console.error(`[copy-ocr-assets] ERROR: Source file is empty (0 bytes): ${asset.src}`);
    process.exit(1);
  }

  fs.copyFileSync(asset.src, asset.dest);
  console.log(`Copied ${asset.name} (${(stat.size / 1024).toFixed(1)} KB)`);

  // Verify destination exists and matches size
  if (!fs.existsSync(asset.dest)) {
    console.error(`[copy-ocr-assets] ERROR: Destination file was not created: ${asset.dest}`);
    process.exit(1);
  }
  const destStat = fs.statSync(asset.dest);
  if (destStat.size !== stat.size) {
    console.error(`[copy-ocr-assets] ERROR: Copied file size mismatch for ${asset.name}`);
    process.exit(1);
  }
}

console.log('[copy-ocr-assets] All 9 required Tesseract OCR static assets copied and verified successfully.');

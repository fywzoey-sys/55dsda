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

// 1. Copy worker.min.js
const workerSrc = path.join(rootDir, 'node_modules', 'tesseract.js', 'dist', 'worker.min.js');
if (fs.existsSync(workerSrc)) {
  fs.copyFileSync(workerSrc, path.join(publicTesseractDir, 'worker.min.js'));
  console.log('Copied worker.min.js');
}

// 2. Copy core files
const coreSrcDir = path.join(rootDir, 'node_modules', 'tesseract.js-core');
if (fs.existsSync(coreSrcDir)) {
  const coreFiles = [
    'tesseract-core-lstm.wasm.js',
    'tesseract-core-simd-lstm.wasm.js',
    'tesseract-core.wasm.js',
    'tesseract-core-simd.wasm.js',
  ];
  for (const file of coreFiles) {
    const src = path.join(coreSrcDir, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(coreDir, file));
      console.log(`Copied core: ${file}`);
    }
  }
}

// 3. Copy traineddata
const engSrc = path.join(rootDir, 'node_modules', '@tesseract.js-data', 'eng', '4.0.0_best_int', 'eng.traineddata.gz');
if (fs.existsSync(engSrc)) {
  fs.copyFileSync(engSrc, path.join(langDir, 'eng.traineddata.gz'));
  console.log('Copied eng.traineddata.gz');
}

const chiSimSrc = path.join(rootDir, 'node_modules', '@tesseract.js-data', 'chi_sim', '4.0.0_best_int', 'chi_sim.traineddata.gz');
if (fs.existsSync(chiSimSrc)) {
  fs.copyFileSync(chiSimSrc, path.join(langDir, 'chi_sim.traineddata.gz'));
  console.log('Copied chi_sim.traineddata.gz');
}

console.log('Tesseract OCR static assets copied successfully.');

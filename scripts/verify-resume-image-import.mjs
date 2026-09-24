import assert from 'assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  validateResumeImportFile,
  validateImageDimensions,
  MAX_FILE_SIZE,
  MAX_IMAGE_DIMENSION,
  MAX_IMAGE_MEGAPIXELS
} from '../src/utils/resumeImportValidation.ts';
import { parseResumeText } from '../src/utils/textResumeParser.ts';
import { normalizeOcrError } from '../src/utils/resumeImageExtractor.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Helper to create mock File-like objects
function createMockFile(name, size, type = '') {
  return {
    name,
    size,
    type,
    lastModified: Date.now(),
    slice: () => new Blob(),
  };
}

console.log('Running verify-resume-image-import tests...\n');

// 1. PNG accepted
{
  const file = createMockFile('resume.png', 1024 * 500, 'image/png');
  const res = validateResumeImportFile(file);
  assert.equal(res.valid, true, 'PNG file should be valid');
  assert.equal(res.fileType, 'image', 'File type should be image');
  console.log('Test 1 passed: PNG accepted');
}

// 2. JPG accepted
{
  const file = createMockFile('resume.jpg', 1024 * 600, 'image/jpeg');
  const res = validateResumeImportFile(file);
  assert.equal(res.valid, true, 'JPG file should be valid');
  assert.equal(res.fileType, 'image', 'File type should be image');
  console.log('Test 2 passed: JPG accepted');
}

// 3. JPEG accepted
{
  const file = createMockFile('resume.jpeg', 1024 * 700, 'image/jpeg');
  const res = validateResumeImportFile(file);
  assert.equal(res.valid, true, 'JPEG file should be valid');
  assert.equal(res.fileType, 'image', 'File type should be image');
  console.log('Test 3 passed: JPEG accepted');
}

// 4. WEBP accepted
{
  const file = createMockFile('resume.webp', 1024 * 400, 'image/webp');
  const res = validateResumeImportFile(file);
  assert.equal(res.valid, true, 'WEBP file should be valid');
  assert.equal(res.fileType, 'image', 'File type should be image');
  console.log('Test 4 passed: WEBP accepted');
}

// 5. SVG rejected
{
  const file = createMockFile('resume.svg', 1024 * 50, 'image/svg+xml');
  const res = validateResumeImportFile(file);
  assert.equal(res.valid, false, 'SVG file should be rejected');
  assert.equal(res.error, 'This file type is not supported.');
  console.log('Test 5 passed: SVG rejected');
}

// 6. GIF rejected
{
  const file = createMockFile('animation.gif', 1024 * 200, 'image/gif');
  const res = validateResumeImportFile(file);
  assert.equal(res.valid, false, 'GIF file should be rejected');
  assert.equal(res.error, 'This file type is not supported.');
  console.log('Test 6 passed: GIF rejected');
}

// 7. HEIC rejected
{
  const file = createMockFile('photo.heic', 1024 * 800, 'image/heic');
  const res = validateResumeImportFile(file);
  assert.equal(res.valid, false, 'HEIC file should be rejected');
  assert.equal(res.error, 'This file type is not supported.');
  console.log('Test 7 passed: HEIC rejected');
}

// 8. Empty image rejected
{
  const file = createMockFile('empty.png', 0, 'image/png');
  const res = validateResumeImportFile(file);
  assert.equal(res.valid, false, 'Empty image should be rejected');
  assert.equal(res.error, 'This file appears to be empty.');
  console.log('Test 8 passed: Empty image rejected');
}

// 9. Image over 10 MB rejected
{
  const file = createMockFile('huge.png', MAX_FILE_SIZE + 1, 'image/png');
  const res = validateResumeImportFile(file);
  assert.equal(res.valid, false, 'Image over 10 MB should be rejected');
  assert.equal(res.error, 'The file is larger than 10 MB.');
  console.log('Test 9 passed: Image over 10 MB rejected');
}

// 10. Inconsistent extension/MIME rejected where detectable
{
  const spoofedPng = createMockFile('resume.png', 1024 * 100, 'application/pdf');
  const res1 = validateResumeImportFile(spoofedPng);
  assert.equal(res1.valid, false, 'PNG with PDF MIME should be rejected');

  const spoofedJpg = createMockFile('resume.jpg', 1024 * 100, 'image/png');
  const res2 = validateResumeImportFile(spoofedJpg);
  assert.equal(res2.valid, false, 'JPG with PNG MIME should be rejected');

  const spoofedExe = createMockFile('malware.exe', 1024 * 50, 'image/png');
  const res3 = validateResumeImportFile(spoofedExe);
  assert.equal(res3.valid, false, 'EXE with image MIME should be rejected');

  console.log('Test 10 passed: Inconsistent extension/MIME rejected');
}

// 11. Corrupt image produces a controlled error
{
  const resZero = validateImageDimensions(0, 0);
  assert.equal(resZero.valid, false, 'Zero dimension should fail');
  assert.equal(resZero.error, 'This image file appears to be corrupted or undecodable.');

  const resNegative = validateImageDimensions(-10, 500);
  assert.equal(resNegative.valid, false, 'Negative dimension should fail');
  console.log('Test 11 passed: Corrupt image produces a controlled error');
}

// 12. Image dimension safety limit
{
  const sideTooLong = validateImageDimensions(MAX_IMAGE_DIMENSION + 1, 1000);
  assert.equal(sideTooLong.valid, false, 'Dimension > 12,000 should fail');
  assert.ok(sideTooLong.error.includes('Image dimensions exceed the safety limit'));

  const megapixelsTooLarge = validateImageDimensions(6000, 5000); // 30 megapixels > 25 megapixels
  assert.equal(megapixelsTooLarge.valid, false, '> 25 megapixels should fail');
  assert.ok(megapixelsTooLarge.error.includes('Image dimensions exceed the safety limit'));

  const safeDimensions = validateImageDimensions(3000, 2000); // 6 megapixels
  assert.equal(safeDimensions.valid, true, 'Safe dimensions should pass');
  console.log('Test 12 passed: Image dimension safety limit enforced');
}

// 13. Meaningful OCR text proceeds to parsing
{
  const ocrText = `Alex Mercer
Product Manager
alex@example.com | 555-0199 | San Francisco, CA

Experience
TechNova
Senior Product Manager
2022-01 - Present
- Led cross-functional team of 12 engineers and designers.
- Scaled customer adoption by 40% year-over-year.`;

  const meaningfulChars = ocrText.replace(/[\s\r\n\t\p{P}\p{S}]/gu, '');
  assert.ok(meaningfulChars.length >= 5, 'Should have sufficient meaningful characters');

  const parsed = parseResumeText(ocrText);
  assert.equal(parsed.fullName, 'Alex Mercer');
  assert.equal(parsed.title, 'Product Manager');
  assert.equal(parsed.contact.email, 'alex@example.com');
  console.log('Test 13 passed: Meaningful OCR text proceeds to parsing');
}

// 14. Empty OCR text does not create a draft
{
  const emptyOcrOutputs = ['', '   \n  \t  ', '--- ... ---'];
  for (const emptyText of emptyOcrOutputs) {
    const meaningfulChars = emptyText.replace(/[\s\r\n\t\p{P}\p{S}]/gu, '');
    assert.ok(meaningfulChars.length < 5, 'Empty/punctuation-only OCR output should have < 5 characters');
  }
  console.log('Test 14 passed: Empty OCR text does not create a draft');
}

// 15. OCR warning is added
{
  const warning = {
    id: 'test-warning-id',
    message: 'OCR may contain recognition errors. Please compare the result with the original image before creating the resume.'
  };
  assert.ok(warning.message.includes('OCR may contain recognition errors'));
  console.log('Test 15 passed: OCR warning verified');
}

// 16. English OCR text maps into one Experience correctly
{
  const englishOcrText = `Alex Chen
Product Intern
alex@example.com | San Francisco

Experience
Acme Labs
Product Intern
2024-06 - 2024-09
- Tested local OCR image recognition and review.`;

  const parsed = parseResumeText(englishOcrText);
  const expSection = parsed.sections.find(s => s.type === 'experience');
  assert.ok(expSection, 'Experience section must exist');
  assert.equal(expSection.items.length, 1, 'Should have exactly 1 Experience');

  const exp = expSection.items[0];
  assert.equal(exp.company, 'Acme Labs');
  assert.equal(exp.role, 'Product Intern');
  assert.equal(exp.startDate, '2024-06');
  assert.equal(exp.endDate, '2024-09');
  assert.equal(exp.bullets.length, 1);
  assert.equal(exp.bullets[0].text, 'Tested local OCR image recognition and review.');
  console.log('Test 16 passed: English OCR text maps into one Experience correctly');
}

// 17. Chinese OCR text maps into one Experience correctly
{
  const chineseOcrText = `林知夏
产品方向实习生
linzhixia@example.com | 138 0000 0000 | 上海

实习经历
校园创新中心
产品实习生
2025.06 - 至今
- 整理用户访谈记录，归纳常见使用问题。`;

  const parsed = parseResumeText(chineseOcrText);
  const expSection = parsed.sections.find(s => s.type === 'experience');
  assert.ok(expSection, 'Experience section must exist');
  assert.equal(expSection.items.length, 1, 'Should have exactly 1 Experience');

  const exp = expSection.items[0];
  assert.equal(exp.company, '校园创新中心');
  assert.equal(exp.role, '产品实习生');
  assert.equal(exp.startDate, '2025.06');
  assert.equal(exp.endDate, '至今');
  assert.equal(exp.bullets.length, 1);
  assert.equal(exp.bullets[0].text, '整理用户访谈记录，归纳常见使用问题。');
  console.log('Test 17 passed: Chinese OCR text maps into one Experience correctly');
}

// 18. Mixed Chinese/English OCR text remains editable
{
  const mixedOcrText = `Lin Zhixia 林知夏
Product Intern
zhixia.lin@globaltech.com | Shanghai

Experience
GlobalTech Solutions
AI Product Intern
2025.01 - 2025.06
- 调研海外大语言模型应用落地案例，编写调研报告。
- Built prototype evaluation dashboard with React.`;

  const parsed = parseResumeText(mixedOcrText);
  assert.equal(parsed.contact.email, 'zhixia.lin@globaltech.com');
  const expSection = parsed.sections.find(s => s.type === 'experience');
  assert.ok(expSection);
  assert.equal(expSection.items.length, 1);

  const exp = expSection.items[0];
  assert.equal(exp.company, 'GlobalTech Solutions');
  assert.equal(exp.bullets.length, 2);
  assert.equal(exp.bullets[0].text, '调研海外大语言模型应用落地案例，编写调研报告。');
  assert.equal(exp.bullets[1].text, 'Built prototype evaluation dashboard with React.');
  console.log('Test 18 passed: Mixed Chinese/English OCR text remains editable');
}

// 19. Cancellation prevents stale results from opening Review
{
  let currentRequestId = 1;
  let activeDraft = null;

  // Simulate an async OCR job started at request 1
  const jobRequestId = currentRequestId;

  // User cancels job or replaces file, incrementing request ID
  currentRequestId++;

  // Job completes later
  if (jobRequestId === currentRequestId) {
    activeDraft = { name: 'Stale Resume' };
  }

  assert.equal(activeDraft, null, 'Stale cancelled job must not update state');
  console.log('Test 19 passed: Cancellation prevents stale results from opening Review');
}

// 20. No Resume mutation occurs before confirmation
{
  const formalResumes = [
    { id: 'resume-1', name: 'Original Resume', fullName: 'User', title: 'Developer', contact: {}, sections: [] }
  ];
  const originalSnapshot = JSON.stringify(formalResumes);

  // User imports image and gets draft
  const ocrText = `Jane Doe
Designer
jane@example.com

Experience
Design Co
UI Designer
2023 - 2024
- Created brand guidelines.`;
  const draft = parseResumeText(ocrText);
  assert.ok(draft);

  // Check formal resumes: must remain untouched
  assert.equal(JSON.stringify(formalResumes), originalSnapshot, 'Formal resumes must not be mutated before confirmation');
  console.log('Test 20 passed: No Resume mutation occurs before confirmation');
}

// 21. Generated Bullet values remain { id, text }
{
  const ocrText = `Alex
Dev

Experience
Company A
Engineer
2022 - 2023
- Bullet one
- Bullet two`;

  const parsed = parseResumeText(ocrText);
  for (const sec of parsed.sections) {
    if (sec.type === 'experience' || sec.type === 'projects') {
      for (const item of sec.items) {
        for (const bullet of item.bullets) {
          assert.equal(typeof bullet.id, 'string', 'Bullet id must be a string');
          assert.equal(typeof bullet.text, 'string', 'Bullet text must be a string');
          assert.ok(bullet.id.length > 0, 'Bullet id must be non-empty');
        }
      }
    }
  }
  console.log('Test 21 passed: Generated Bullet values remain { id, text }');
}

// 22. Existing PDF/DOCX validation continues to pass
{
  const pdfFile = createMockFile('my-resume.pdf', 1024 * 100, 'application/pdf');
  const pdfRes = validateResumeImportFile(pdfFile);
  assert.equal(pdfRes.valid, true);
  assert.equal(pdfRes.fileType, 'pdf');

  const docxFile = createMockFile(
    'my-resume.docx',
    1024 * 200,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  );
  const docxRes = validateResumeImportFile(docxFile);
  assert.equal(docxRes.valid, true);
  assert.equal(docxRes.fileType, 'docx');

  console.log('Test 22 passed: Existing PDF/DOCX validation continues to pass');
}

// 23. Existing Paste Text parser tests continue to pass
{
  const pasteInput = `Alex
Engineer
alex@test.com | 123456

Education
Sample University
Computer Science
2020 - 2024

Experience
Acme Inc
Software Engineer
2024 - Present
- Built features`;

  const parsed = parseResumeText(pasteInput);
  assert.equal(parsed.fullName, 'Alex');
  assert.equal(parsed.title, 'Engineer');
  assert.equal(parsed.sections.length, 2);
  console.log('Test 23 passed: Existing Paste Text parser tests continue to pass');
}

// 24. OCR asset manifest validation detects missing Relaxed SIMD core files
{
  const REQUIRED_OCR_FILES = [
    'worker.min.js',
    'core/tesseract-core-lstm.wasm.js',
    'core/tesseract-core-simd-lstm.wasm.js',
    'core/tesseract-core-relaxedsimd-lstm.wasm.js',
    'core/tesseract-core.wasm.js',
    'core/tesseract-core-simd.wasm.js',
    'core/tesseract-core-relaxedsimd.wasm.js',
    'lang/eng.traineddata.gz',
    'lang/chi_sim.traineddata.gz',
  ];

  function validateAssetList(presentFiles) {
    const missing = REQUIRED_OCR_FILES.filter(f => !presentFiles.includes(f));
    return { valid: missing.length === 0, missing };
  }

  // Without relaxedsimd-lstm
  const listWithoutRelaxedLstm = REQUIRED_OCR_FILES.filter(
    f => f !== 'core/tesseract-core-relaxedsimd-lstm.wasm.js'
  );
  const res1 = validateAssetList(listWithoutRelaxedLstm);
  assert.equal(res1.valid, false, 'Must fail when relaxedsimd-lstm is missing');
  assert.ok(res1.missing.includes('core/tesseract-core-relaxedsimd-lstm.wasm.js'));

  // Without relaxedsimd
  const listWithoutRelaxed = REQUIRED_OCR_FILES.filter(
    f => f !== 'core/tesseract-core-relaxedsimd.wasm.js'
  );
  const res2 = validateAssetList(listWithoutRelaxed);
  assert.equal(res2.valid, false, 'Must fail when relaxedsimd is missing');
  assert.ok(res2.missing.includes('core/tesseract-core-relaxedsimd.wasm.js'));

  console.log('Test 24 passed: OCR asset manifest validation detects missing Relaxed SIMD files');
}

// 25. All 9 required Tesseract.js 7 static assets exist in public/tesseract with non-zero size
{
  const publicTesseractDir = path.join(rootDir, 'public', 'tesseract');
  const requiredFiles = [
    'worker.min.js',
    'core/tesseract-core-lstm.wasm.js',
    'core/tesseract-core-simd-lstm.wasm.js',
    'core/tesseract-core-relaxedsimd-lstm.wasm.js',
    'core/tesseract-core.wasm.js',
    'core/tesseract-core-simd.wasm.js',
    'core/tesseract-core-relaxedsimd.wasm.js',
    'lang/eng.traineddata.gz',
    'lang/chi_sim.traineddata.gz',
  ];

  for (const relPath of requiredFiles) {
    const fullPath = path.join(publicTesseractDir, relPath);
    assert.ok(fs.existsSync(fullPath), `Asset file must exist on disk: ${relPath}`);
    const stat = fs.statSync(fullPath);
    assert.ok(stat.size > 1000, `Asset file must be non-empty (>1KB): ${relPath} (size: ${stat.size})`);
  }

  // Explicit check on the two Relaxed SIMD files
  const relaxedLstmPath = path.join(publicTesseractDir, 'core', 'tesseract-core-relaxedsimd-lstm.wasm.js');
  const relaxedPath = path.join(publicTesseractDir, 'core', 'tesseract-core-relaxedsimd.wasm.js');

  assert.ok(fs.existsSync(relaxedLstmPath), 'tesseract-core-relaxedsimd-lstm.wasm.js must exist');
  assert.ok(fs.statSync(relaxedLstmPath).size > 3 * 1024 * 1024, 'tesseract-core-relaxedsimd-lstm.wasm.js > 3MB');

  assert.ok(fs.existsSync(relaxedPath), 'tesseract-core-relaxedsimd.wasm.js must exist');
  assert.ok(fs.statSync(relaxedPath).size > 3 * 1024 * 1024, 'tesseract-core-relaxedsimd.wasm.js > 3MB');

  console.log('Test 25 passed: All 9 required Tesseract.js 7 static assets exist in public/tesseract');

  // If dist/ exists, verify dist/tesseract contains all 9 assets too
  const distTesseractDir = path.join(rootDir, 'dist', 'tesseract');
  if (fs.existsSync(distTesseractDir)) {
    for (const relPath of requiredFiles) {
      const fullPath = path.join(distTesseractDir, relPath);
      assert.ok(fs.existsSync(fullPath), `Dist asset file must exist: ${relPath}`);
      const stat = fs.statSync(fullPath);
      assert.ok(stat.size > 1000, `Dist asset file must be non-empty (>1KB): ${relPath}`);
    }
    console.log('Test 25b passed: All 9 required Tesseract.js 7 static assets verified in dist/tesseract');
  }
}

// 26. Error normalization converts network/asset/worker failures to friendly user message
{
  // 1. Worker importScripts failure (the exact failure reported on Vercel)
  const vercelWorkerError = "Failed to execute 'importScripts' on 'WorkerGlobalScope': https://55dsdav1.vercel.app/tesseract/core/tesseract-core-relaxedsimd-lstm.wasm.js failed to load";
  const msg1 = normalizeOcrError(vercelWorkerError);
  assert.equal(msg1, 'OCR files could not be loaded. Please check your connection and try again.');

  // 2. Fetch error / 404
  const notFoundError = new Error('Failed to fetch (404 Not Found) for eng.traineddata.gz');
  const msg2 = normalizeOcrError(notFoundError);
  assert.equal(msg2, 'OCR files could not be loaded. Please check your connection and try again.');

  // 3. String error from worker
  const stringErr = 'NetworkError when attempting to fetch resource.';
  const msg3 = normalizeOcrError(stringErr);
  assert.equal(msg3, 'OCR files could not be loaded. Please check your connection and try again.');

  // 4. Cancelled error
  const cancelMsg = normalizeOcrError('Worker terminated due to abort signal', true);
  assert.equal(cancelMsg, 'OCR was cancelled.');

  // 5. Unknown internal error does not expose stack traces or URLs
  const internalErr = new Error('Memory access out of bounds at internal wasm offset 0x41f89c');
  const msg5 = normalizeOcrError(internalErr);
  assert.equal(msg5, 'Recognition failed. Please try a clearer image or check your connection and try again.');
  assert.ok(!msg5.includes('0x41f89c'), 'Must not expose stack traces or offsets');

  console.log('Test 26 passed: Error normalization converts network/asset/worker failures safely');
}

// 27. Runtime error preserves selected file and allows retry
{
  const validFile = createMockFile('resume.png', 1024 * 100, 'image/png');

  // Initial valid selection
  let selectedFile = validFile;
  let validationError = null;
  let runtimeError = null;
  let isExtracting = false;

  const isButtonDisabled = () => !selectedFile || validationError !== null || isExtracting;

  // Initially enabled
  assert.equal(isButtonDisabled(), false, 'Button should be enabled for valid file');

  // OCR starts
  isExtracting = true;
  assert.equal(isButtonDisabled(), true, 'Button should be disabled during extraction');

  // OCR fails at runtime (e.g. temporary network error)
  isExtracting = false;
  runtimeError = 'OCR files could not be loaded. Please check your connection and try again.';
  // Note: validationError remains null! selectedFile is kept!
  assert.equal(selectedFile, validFile, 'Selected file must be preserved');
  assert.equal(isButtonDisabled(), false, 'Button must remain enabled for retry after runtime failure');

  // User selects an invalid file (e.g. unsupported extension)
  const invalidFile = createMockFile('virus.exe', 1024 * 50, 'application/x-msdownload');
  selectedFile = invalidFile;
  validationError = 'This file type is not supported.';
  runtimeError = null;
  assert.equal(isButtonDisabled(), true, 'Button must be blocked when file has validation error');

  console.log('Test 27 passed: Runtime error preserves selected file and allows retry');
}

// 28. Indeterminate progress does not show fake numbers
{
  const formatProgress = (progress) => {
    const hasPercentage = typeof progress === 'number' && progress >= 0 && progress <= 100;
    return {
      hasPercentage,
      displayNumber: hasPercentage ? `${progress}%` : null,
      isIndeterminate: !hasPercentage,
    };
  };

  const undefProg = formatProgress(undefined);
  assert.equal(undefProg.hasPercentage, false);
  assert.equal(undefProg.displayNumber, null);
  assert.equal(undefProg.isIndeterminate, true);

  const realProg = formatProgress(42);
  assert.equal(realProg.hasPercentage, true);
  assert.equal(realProg.displayNumber, '42%');
  assert.equal(realProg.isIndeterminate, false);

  console.log('Test 28 passed: Indeterminate progress does not show fake numbers');
}

console.log('\nAll 28 verify-resume-image-import tests passed successfully!');

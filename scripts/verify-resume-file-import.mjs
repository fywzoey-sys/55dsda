import assert from 'assert/strict';
import { validateResumeImportFile } from '../src/utils/resumeFileExtractor.ts';

// Helper to create mock File-like objects
function createMockFile(name, size, type = '') {
  return {
    name,
    size,
    type
  };
}

console.log('Running verify-resume-file-import tests...');

// 1. Valid PDF
{
  const file = createMockFile('resume.pdf', 1024 * 50, 'application/pdf');
  const res = validateResumeImportFile(file);
  assert.equal(res.valid, true, 'Valid PDF should pass');
  assert.equal(res.fileType, 'pdf', 'File type should be pdf');
}

// 2. Valid DOCX
{
  const file = createMockFile('resume.docx', 1024 * 100, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  const res = validateResumeImportFile(file);
  assert.equal(res.valid, true, 'Valid DOCX should pass');
  assert.equal(res.fileType, 'docx', 'File type should be docx');
}

// 3. Unsupported extension
{
  const file = createMockFile('resume.xyz', 1024 * 20, '');
  const res = validateResumeImportFile(file);
  assert.equal(res.valid, false, 'Unsupported extension should fail');
  assert.equal(res.error, 'This file type is not supported.');
}

// 4. Empty MIME with valid extension (.pdf and .docx)
{
  const pdfFile = createMockFile('resume.pdf', 1024 * 30, '');
  const pdfRes = validateResumeImportFile(pdfFile);
  assert.equal(pdfRes.valid, true, 'PDF with empty MIME should pass');
  assert.equal(pdfRes.fileType, 'pdf');

  const docxFile = createMockFile('resume.docx', 1024 * 30, '');
  const docxRes = validateResumeImportFile(docxFile);
  assert.equal(docxRes.valid, true, 'DOCX with empty MIME should pass');
  assert.equal(docxRes.fileType, 'docx');
}

// 5. Oversized file (> 10 MB)
{
  const file = createMockFile('huge.pdf', 10 * 1024 * 1024 + 1, 'application/pdf');
  const res = validateResumeImportFile(file);
  assert.equal(res.valid, false, 'Oversized file should fail');
  assert.equal(res.error, 'The file is larger than 10 MB.');
}

// 6. Empty file (size 0)
{
  const file = createMockFile('empty.pdf', 0, 'application/pdf');
  const res = validateResumeImportFile(file);
  assert.equal(res.valid, false, 'Empty file should fail');
  assert.equal(res.error, 'This file appears to be empty.');
}

// 7. Legacy .doc rejection
{
  const file = createMockFile('legacy.doc', 1024 * 40, 'application/msword');
  const res = validateResumeImportFile(file);
  assert.equal(res.valid, false, 'Legacy .doc should be rejected');
  assert.equal(res.error, 'This file type is not supported.');
}

// 8. Image rejection
{
  const filePng = createMockFile('scan.png', 1024 * 50, 'image/png');
  const resPng = validateResumeImportFile(filePng);
  assert.equal(resPng.valid, false, 'Image should be rejected');
  assert.equal(resPng.error, 'This file type is not supported.');

  const fileJpg = createMockFile('photo.jpg', 1024 * 50, 'image/jpeg');
  const resJpg = validateResumeImportFile(fileJpg);
  assert.equal(resJpg.valid, false, 'JPEG should be rejected');
  assert.equal(resJpg.error, 'This file type is not supported.');

  // Renamed image disguised as pdf
  const fakePdf = createMockFile('fake.pdf', 1024 * 50, 'image/png');
  const resFake = validateResumeImportFile(fakePdf);
  assert.equal(resFake.valid, false, 'Disguised image should be rejected');
  assert.equal(resFake.error, 'This file type is not supported.');
}

console.log('All file validation assertions passed!');

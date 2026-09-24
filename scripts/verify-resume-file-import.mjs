import assert from 'assert/strict';
import { validateResumeImportFile, normalizeDocxText } from '../src/utils/resumeFileExtractor.ts';
import { parseResumeText } from '../src/utils/textResumeParser.ts';

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

// Regression Test 1 — Single DOCX-style Experience
{
  const test1Input = `Alex Chen

Product Intern

alex@example.com | San Francisco



Experience

Acme Labs

Product Intern

2024-06 - 2024-09

- Tested local DOCX import.`;

  const parsed = parseResumeText(normalizeDocxText(test1Input));
  const expSection = parsed.sections.find(s => s.type === 'experience');
  assert.ok(expSection, 'Experience section should exist');
  assert.equal(expSection.items.length, 1, 'Should have exactly 1 Experience');

  const item = expSection.items[0];
  assert.equal(item.company, 'Acme Labs', 'company should be Acme Labs');
  assert.equal(item.role, 'Product Intern', 'role should be Product Intern');
  assert.equal(item.startDate, '2024-06', 'startDate should be 2024-06');
  assert.equal(item.endDate, '2024-09', 'endDate should be 2024-09');
  assert.equal(item.bullets.length, 1, 'Should have exactly 1 Bullet');
  assert.equal(item.bullets[0].text, 'Tested local DOCX import.', 'Bullet text is preserved');
  console.log('Regression Test 1 (Single DOCX-style Experience) passed!');
}

// Regression Test 2 — Multiple DOCX-style Experiences
{
  const test2Input = `Experience

Acme Labs

Product Intern

2024-06 - 2024-09

- Tested local DOCX import.

Beta Corp

Software Engineer

2023-01 - 2024-05

- Developed features.`;

  const parsed = parseResumeText(normalizeDocxText(test2Input));
  const expSection = parsed.sections.find(s => s.type === 'experience');
  assert.ok(expSection, 'Experience section should exist');
  assert.equal(expSection.items.length, 2, 'Should have exactly 2 Experiences');

  const item1 = expSection.items[0];
  assert.equal(item1.company, 'Acme Labs');
  assert.equal(item1.role, 'Product Intern');
  assert.equal(item1.startDate, '2024-06');
  assert.equal(item1.endDate, '2024-09');
  assert.equal(item1.bullets.length, 1);
  assert.equal(item1.bullets[0].text, 'Tested local DOCX import.');

  const item2 = expSection.items[1];
  assert.equal(item2.company, 'Beta Corp');
  assert.equal(item2.role, 'Software Engineer');
  assert.equal(item2.startDate, '2023-01');
  assert.equal(item2.endDate, '2024-05');
  assert.equal(item2.bullets.length, 1);
  assert.equal(item2.bullets[0].text, 'Developed features.');
  console.log('Regression Test 2 (Multiple DOCX-style Experiences) passed!');
}

// Regression Test 3 — Chinese DOCX-style Experience
{
  const test3Input = `实习经历

校园创新中心

产品实习生

2025.06 - 至今

- 整理用户访谈记录，归纳常见使用问题。`;

  const parsed = parseResumeText(normalizeDocxText(test3Input));
  const expSection = parsed.sections.find(s => s.type === 'experience');
  assert.ok(expSection, 'Experience section should exist');
  assert.equal(expSection.items.length, 1, 'Should have exactly 1 Experience');

  const item = expSection.items[0];
  assert.equal(item.company, '校园创新中心');
  assert.equal(item.role, '产品实习生');
  assert.equal(item.startDate, '2025.06');
  assert.equal(item.endDate, '至今');
  assert.equal(item.bullets.length, 1);
  assert.equal(item.bullets[0].text, '整理用户访谈记录，归纳常见使用问题。');
  console.log('Regression Test 3 (Chinese DOCX-style Experience) passed!');
}

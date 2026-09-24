import { generateId } from './id';

export type ResumeImportFileType = 'pdf' | 'docx';

export interface FileExtractionWarning {
  id: string;
  message: string;
}

export interface FileExtractionResult {
  text: string;
  fileType: ResumeImportFileType;
  warnings: FileExtractionWarning[];
  pageCount?: number;
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  fileType?: ResumeImportFileType;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export function validateResumeImportFile(file: File): FileValidationResult {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  if (file.size === 0) {
    return { valid: false, error: 'This file appears to be empty.' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'The file is larger than 10 MB.' };
  }

  const fileName = (file.name || '').trim();
  const lastDotIndex = fileName.lastIndexOf('.');
  const ext = lastDotIndex !== -1 ? fileName.slice(lastDotIndex + 1).toLowerCase() : '';
  const mimeType = (file.type || '').toLowerCase();

  // Reject unsupported common extensions
  const explicitlyRejectedExts = [
    'doc', 'txt', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg',
    'exe', 'bat', 'sh', 'cmd', 'bin', 'zip', 'rar', '7z', 'tar', 'gz',
    'rtf', 'odt', 'pages', 'html', 'htm', 'js', 'ts', 'json'
  ];
  if (explicitlyRejectedExts.includes(ext)) {
    return { valid: false, error: 'This file type is not supported.' };
  }

  // Reject explicitly non-document MIME types even if extension is missing/spoofed
  if (
    mimeType.startsWith('image/') ||
    mimeType.startsWith('text/') ||
    mimeType.startsWith('audio/') ||
    mimeType.startsWith('video/') ||
    mimeType === 'application/x-msdownload' ||
    mimeType === 'application/msword'
  ) {
    return { valid: false, error: 'This file type is not supported.' };
  }

  if (ext === 'pdf') {
    // If MIME type is present, allow application/pdf
    if (mimeType !== '' && mimeType !== 'application/pdf') {
      return { valid: false, error: 'This file type is not supported.' };
    }
    return { valid: true, fileType: 'pdf' };
  }

  if (ext === 'docx') {
    const validDocxMimes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip',
      'application/x-zip-compressed'
    ];
    if (mimeType !== '' && !validDocxMimes.includes(mimeType)) {
      return { valid: false, error: 'This file type is not supported.' };
    }
    return { valid: true, fileType: 'docx' };
  }

  return { valid: false, error: 'This file type is not supported.' };
}

let pdfWorkerConfigured = false;

async function configurePdfWorker(pdfjs: typeof import('pdfjs-dist')) {
  if (pdfWorkerConfigured) return;
  try {
    // In Vite, ?url imports worker asset as a bundled URL
    // @ts-ignore
    const workerMod = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
    const workerUrl = typeof workerMod === 'string' ? workerMod : (workerMod.default || workerMod);
    if (typeof workerUrl === 'string') {
      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
    }
  } catch {
    // In test / non-Vite environments, workerSrc can remain default
  }
  pdfWorkerConfigured = true;
}

export async function extractResumeTextFromPdf(file: File): Promise<FileExtractionResult> {
  const validation = validateResumeImportFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'This file type is not supported.');
  }

  let pdfjs: typeof import('pdfjs-dist');
  try {
    pdfjs = await import('pdfjs-dist');
    await configurePdfWorker(pdfjs);
  } catch {
    throw new Error('This document could not be read.');
  }

  let arrayBuffer: ArrayBuffer;
  try {
    arrayBuffer = await file.arrayBuffer();
  } catch {
    throw new Error('This document could not be read.');
  }

  let pdf: import('pdfjs-dist').PDFDocumentProxy;
  try {
    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(arrayBuffer),
      useWorkerFetch: false,
      useSystemFonts: true
    });
    pdf = await loadingTask.promise;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message.toLowerCase() : '';
    const errorName = err instanceof Error ? err.name : '';
    if (errorName === 'PasswordException' || errorMessage.includes('password')) {
      throw new Error('This document is password-protected.');
    }
    throw new Error('This document could not be read.');
  }

  if (pdf.numPages > 50) {
    throw new Error('PDF exceeds the maximum limit of 50 pages.');
  }

  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    try {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      let pageText = '';

      for (const item of textContent.items) {
        if ('str' in item) {
          const str = item.str;
          if (str) {
            if (pageText && !pageText.endsWith('\n') && !pageText.endsWith(' ') && !str.startsWith(' ')) {
              pageText += ' ';
            }
            pageText += str;
          }
          if (item.hasEOL) {
            pageText += '\n';
          }
        }
      }

      pageTexts.push(pageText.trim());
    } catch {
      throw new Error('This document could not be read.');
    }
  }

  const fullText = pageTexts.filter(Boolean).join('\n\n');

  // Check if selectable text exists (not a scanned image-only PDF)
  // Strip whitespace and punctuation/symbols
  const meaningfulChars = fullText.replace(/[\s\r\n\t\p{P}\p{S}]/gu, '');
  if (meaningfulChars.length < 5) {
    throw new Error('No selectable text was found. This may be a scanned PDF. Image and OCR import will be added in Phase 4C.');
  }

  const warnings: FileExtractionWarning[] = [
    {
      id: generateId('warning'),
      message: 'PDF layout may affect recognition. Please review the imported content.'
    }
  ];

  return {
    text: fullText,
    fileType: 'pdf',
    warnings,
    pageCount: pdf.numPages
  };
}

export async function extractResumeTextFromDocx(file: File): Promise<FileExtractionResult> {
  const validation = validateResumeImportFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'This file type is not supported.');
  }

  let mammothMod: unknown;
  try {
    mammothMod = await import('mammoth');
  } catch {
    throw new Error('This document could not be read.');
  }

  const mammoth = (mammothMod as { default?: { extractRawText: (opts: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string; messages: unknown[] }> }; extractRawText?: (opts: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string; messages: unknown[] }> }).default || (mammothMod as { extractRawText: (opts: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string; messages: unknown[] }> });

  let arrayBuffer: ArrayBuffer;
  try {
    arrayBuffer = await file.arrayBuffer();
  } catch {
    throw new Error('This document could not be read.');
  }

  let result: { value: string; messages: unknown[] };
  try {
    result = await mammoth.extractRawText({ arrayBuffer });
  } catch {
    throw new Error('This document could not be read.');
  }

  const text = (result.value || '').trim();
  const meaningfulChars = text.replace(/[\s\r\n\t\p{P}\p{S}]/gu, '');
  if (meaningfulChars.length === 0) {
    throw new Error('No readable text was found in this DOCX file.');
  }

  const warnings: FileExtractionWarning[] = [];
  if (result.messages && result.messages.length > 0) {
    warnings.push({
      id: generateId('warning'),
      message: 'Some document formatting may not have been preserved. Please review the imported content.'
    });
  }

  return {
    text,
    fileType: 'docx',
    warnings
  };
}

export async function extractResumeTextFromFile(file: File): Promise<FileExtractionResult> {
  const validation = validateResumeImportFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'This file type is not supported.');
  }

  if (validation.fileType === 'pdf') {
    return extractResumeTextFromPdf(file);
  } else if (validation.fileType === 'docx') {
    return extractResumeTextFromDocx(file);
  }

  throw new Error('This file type is not supported.');
}

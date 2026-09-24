import { generateId } from './id';
import {
  validateResumeImportFile,
  ResumeImportFileType,
  FileValidationResult,
  MAX_FILE_SIZE
} from './resumeImportValidation';

export { validateResumeImportFile, MAX_FILE_SIZE };
export type { ResumeImportFileType, FileValidationResult };

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
    throw new Error('No selectable text was found. This may be a scanned PDF. For now, export the page as a PNG or JPEG and use Image Import.');
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

export function normalizeDocxText(rawText: string): string {
  // Normalize CRLF to LF
  let text = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  // Trim spaces on blank lines
  text = text.replace(/^[ \t]+$/gm, '');
  // Replace runs of 2 or more newlines:
  // If there are 3 or more newlines, that indicates intentional blank line separation between items/sections -> retain as \n\n.
  // If there are exactly 2 newlines, that is Mammoth's normal paragraph separator -> convert to \n.
  text = text.replace(/\n{2,}/g, (match) => {
    return match.length >= 3 ? '\n\n' : '\n';
  });
  return text.trim();
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

  const rawText = (result.value || '').trim();
  const meaningfulChars = rawText.replace(/[\s\r\n\t\p{P}\p{S}]/gu, '');
  if (meaningfulChars.length === 0) {
    throw new Error('No readable text was found in this DOCX file.');
  }

  const text = normalizeDocxText(rawText);

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

import { generateId } from './id';
import { validateImageDimensions } from './resumeImportValidation';

export interface OcrProgressInfo {
  status: string;
  progress?: number; // 0 to 100
}

export interface ImageExtractionOptions {
  onProgress?: (progress: OcrProgressInfo) => void;
  signal?: AbortSignal;
}

export interface ImageExtractionWarning {
  id: string;
  message: string;
}

export interface ImageExtractionResult {
  text: string;
  warnings: ImageExtractionWarning[];
}

/**
 * Normalizes caught OCR runtime errors safely.
 * Asset, network, or worker loading failures are mapped to a clear user-facing message.
 * Internal stack traces or URL implementation details are never exposed to the UI.
 */
export function normalizeOcrError(err: unknown, isAborted?: boolean): string {
  if (isAborted) {
    return 'OCR was cancelled.';
  }

  let raw = '';
  if (err instanceof Error) {
    raw = err.message || '';
  } else if (typeof err === 'string') {
    raw = err;
  } else if (err && typeof err === 'object') {
    const record = err as Record<string, unknown>;
    if (typeof record.message === 'string') {
      raw = record.message;
    } else if (typeof record.error === 'string') {
      raw = record.error;
    } else if (record.error instanceof Error) {
      raw = record.error.message;
    } else {
      raw = String(err);
    }
  } else {
    raw = String(err || '');
  }

  const lower = raw.toLowerCase();

  // Explicit cancellation
  if (lower.includes('ocr was cancelled') || lower.includes('cancelled') || lower.includes('aborted') || lower.includes('abort')) {
    return 'OCR was cancelled.';
  }

  // Known validation / dimension / content messages
  if (
    raw.startsWith('This image file appears to be corrupted') ||
    raw.startsWith('Image dimensions exceed') ||
    raw.startsWith('No readable resume text was recognized')
  ) {
    return raw;
  }

  // Asset loading, network, or worker script loading failures (404, importScripts, etc.)
  if (
    lower.includes('failed to load') ||
    lower.includes('importscripts') ||
    lower.includes('failed to fetch') ||
    lower.includes('network') ||
    lower.includes('404') ||
    lower.includes('not found') ||
    lower.includes('traineddata') ||
    lower.includes('ocr assets failed') ||
    (lower.includes('wasm') && (lower.includes('load') || lower.includes('fetch') || lower.includes('compile') || lower.includes('instantiate'))) ||
    (lower.includes('worker') && (lower.includes('load') || lower.includes('script') || lower.includes('fetch')))
  ) {
    return 'OCR files could not be loaded. Please check your connection and try again.';
  }

  return 'Recognition failed. Please try a clearer image or check your connection and try again.';
}

/**
 * Safely decodes an image file in the browser environment,
 * verifies its dimensions against the safety limits, and prepares
 * a canvas or image element for OCR.
 */
export async function decodeAndValidateImage(
  file: File
): Promise<{ element: HTMLCanvasElement | HTMLImageElement; width: number; height: number; cleanup: () => void }> {
  return new Promise((resolve, reject) => {
    let objectUrl: string | null = null;
    try {
      objectUrl = URL.createObjectURL(file);
    } catch {
      reject(new Error('This image file appears to be corrupted or undecodable.'));
      return;
    }

    const img = new Image();
    const cleanup = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        objectUrl = null;
      }
    };

    img.onload = () => {
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;

      const dimCheck = validateImageDimensions(width, height);
      if (!dimCheck.valid) {
        cleanup();
        reject(new Error(dimCheck.error || 'Image dimensions exceed safety limit.'));
        return;
      }

      // If dimensions are extremely large (e.g. > 3000px), downscale to reduce memory
      // while keeping crisp resolution for OCR text.
      const maxAllowedSide = 3000;
      if (Math.max(width, height) > maxAllowedSide) {
        try {
          const scale = maxAllowedSide / Math.max(width, height);
          const targetWidth = Math.round(width * scale);
          const targetHeight = Math.round(height * scale);

          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            // Fallback to original image if context fails
            resolve({ element: img, width, height, cleanup });
            return;
          }

          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          cleanup();
          resolve({
            element: canvas,
            width: targetWidth,
            height: targetHeight,
            cleanup: () => {
              canvas.width = 0;
              canvas.height = 0;
            }
          });
          return;
        } catch {
          // If downscaling fails, fallback to original img
          resolve({ element: img, width, height, cleanup });
          return;
        }
      }

      resolve({ element: img, width, height, cleanup });
    };

    img.onerror = () => {
      cleanup();
      reject(new Error('This image file appears to be corrupted or undecodable.'));
    };

    img.src = objectUrl;
  });
}

/**
 * Extracts resume text locally using Tesseract.js in a Web Worker
 * with same-origin self-hosted OCR assets (worker, all 6 core WASM variants, eng + chi_sim).
 */
export async function extractResumeTextFromImage(
  file: File,
  options?: ImageExtractionOptions
): Promise<ImageExtractionResult> {
  const { onProgress, signal } = options || {};

  if (signal?.aborted) {
    throw new Error('OCR was cancelled.');
  }

  onProgress?.({ status: 'Preparing image…' });

  // 1. Decode & validate image dimensions safely
  const { element, cleanup } = await decodeAndValidateImage(file);

  if (signal?.aborted) {
    cleanup();
    throw new Error('OCR was cancelled.');
  }

  // 2. Dynamic import of tesseract.js to avoid bundling into initial load
  let tesseractModule;
  try {
    tesseractModule = await import('tesseract.js');
  } catch (err: unknown) {
    cleanup();
    throw new Error(normalizeOcrError(err, signal?.aborted));
  }

  if (signal?.aborted) {
    cleanup();
    throw new Error('OCR was cancelled.');
  }

  const { createWorker, OEM } = tesseractModule;
  let worker: any = null;
  let isCancelled = Boolean(signal?.aborted);

  // Define abort listener to handle cancellation during worker creation and recognition
  const onAbort = () => {
    isCancelled = true;
    if (worker) {
      try {
        worker.terminate().catch(() => {});
      } catch {}
    }
  };

  if (signal) {
    signal.addEventListener('abort', onAbort, { once: true });
  }

  try {
    // 3. Resolve base URL for same-origin static OCR assets
    const basePath = (typeof window !== 'undefined' && (import.meta as any).env?.BASE_URL)
      ? (import.meta as any).env.BASE_URL.replace(/\/$/, '')
      : '';

    const workerPath = `${basePath}/tesseract/worker.min.js`;
    const corePath = `${basePath}/tesseract/core`;
    const langPath = `${basePath}/tesseract/lang`;

    // 4. Initialize Tesseract worker with mixed English and Simplified Chinese
    const workerPromise = createWorker(['eng', 'chi_sim'], OEM.LSTM_ONLY, {
      workerPath,
      corePath,
      langPath,
      gzip: true,
      logger: (m: any) => {
        if (!onProgress || signal?.aborted || isCancelled) return;
        const statusStr = (m.status || '').toLowerCase();
        const rawProgress = typeof m.progress === 'number' ? m.progress : undefined;

        if (statusStr.includes('core') || statusStr.includes('initializing tesseract')) {
          onProgress({
            status: 'Loading OCR…',
            progress: rawProgress !== undefined ? Math.round(rawProgress * 100) : undefined
          });
        } else if (statusStr.includes('traineddata') || statusStr.includes('loading language') || statusStr.includes('api')) {
          onProgress({
            status: 'Loading English and Chinese recognition data…',
            progress: rawProgress !== undefined ? Math.round(rawProgress * 100) : undefined
          });
        } else if (statusStr.includes('recogniz')) {
          onProgress({
            status: 'Recognizing text…',
            progress: rawProgress !== undefined ? Math.round(rawProgress * 100) : undefined
          });
        }
      }
    });

    // If cancellation occurs while createWorker() is resolving, terminate it immediately upon resolution
    workerPromise
      .then((createdWorker) => {
        if (signal?.aborted || isCancelled) {
          try {
            createdWorker.terminate().catch(() => {});
          } catch {}
        }
      })
      .catch(() => {}); // Prevent unhandled promise rejections on cancel

    worker = await workerPromise;

    if (signal?.aborted || isCancelled) {
      if (worker) {
        try {
          await worker.terminate();
        } catch {}
        worker = null;
      }
      throw new Error('OCR was cancelled.');
    }

    onProgress?.({ status: 'Recognizing text…' });

    const recognizeResult = await worker.recognize(element);

    if (signal?.aborted || isCancelled) {
      throw new Error('OCR was cancelled.');
    }

    onProgress?.({ status: 'Preparing review…', progress: 100 });

    const rawText = (recognizeResult?.data?.text || '').trim();

    // 5. Check meaningful text content
    const meaningfulChars = rawText.replace(/[\s\r\n\t\p{P}\p{S}]/gu, '');
    if (meaningfulChars.length < 5) {
      throw new Error('No readable resume text was recognized. Try a clearer image with higher contrast and larger text.');
    }

    const warnings: ImageExtractionWarning[] = [
      {
        id: generateId('warning'),
        message: 'OCR may contain recognition errors. Please compare the result with the original image before creating the resume.'
      }
    ];

    return {
      text: rawText,
      warnings
    };
  } catch (err: unknown) {
    const isAbortedNow = Boolean(signal?.aborted || isCancelled);
    const friendlyMessage = normalizeOcrError(err, isAbortedNow);
    throw new Error(friendlyMessage);
  } finally {
    if (signal) {
      signal.removeEventListener('abort', onAbort);
    }
    cleanup();
    if (worker) {
      try {
        await worker.terminate();
      } catch {}
      worker = null;
    }
  }
}

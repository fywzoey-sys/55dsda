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
 * with same-origin self-hosted OCR assets (worker, core WASM, eng + chi_sim).
 */
export async function extractResumeTextFromImage(
  file: File,
  options?: ImageExtractionOptions
): Promise<ImageExtractionResult> {
  const { onProgress, signal } = options || {};

  if (signal?.aborted) {
    throw new Error('OCR was cancelled.');
  }

  onProgress?.({ status: 'Preparing image…', progress: 0 });

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
  } catch {
    cleanup();
    throw new Error('OCR assets failed to load.');
  }

  if (signal?.aborted) {
    cleanup();
    throw new Error('OCR was cancelled.');
  }

  const { createWorker, OEM } = tesseractModule;
  let worker: any = null;

  try {
    // 3. Resolve base URL for same-origin static OCR assets
    const basePath = (typeof window !== 'undefined' && (import.meta as any).env?.BASE_URL)
      ? (import.meta as any).env.BASE_URL.replace(/\/$/, '')
      : '';

    const workerPath = `${basePath}/tesseract/worker.min.js`;
    const corePath = `${basePath}/tesseract/core`;
    const langPath = `${basePath}/tesseract/lang`;

    // 4. Initialize Tesseract worker with mixed English and Simplified Chinese
    worker = await createWorker(['eng', 'chi_sim'], OEM.LSTM_ONLY, {
      workerPath,
      corePath,
      langPath,
      gzip: true,
      logger: (m: any) => {
        if (!onProgress || signal?.aborted) return;
        const statusStr = (m.status || '').toLowerCase();
        const rawProgress = typeof m.progress === 'number' ? m.progress : 0;

        if (statusStr.includes('core') || statusStr.includes('initializing tesseract')) {
          onProgress({ status: 'Loading OCR…', progress: Math.round(rawProgress * 100) });
        } else if (statusStr.includes('traineddata') || statusStr.includes('loading language') || statusStr.includes('api')) {
          onProgress({ status: 'Loading English and Chinese recognition data…', progress: Math.round(rawProgress * 100) });
        } else if (statusStr.includes('recogniz')) {
          onProgress({ status: 'Recognizing text…', progress: Math.round(rawProgress * 100) });
        }
      }
    });

    if (signal?.aborted) {
      throw new Error('OCR was cancelled.');
    }

    onProgress?.({ status: 'Recognizing text…', progress: 0 });

    // Handle abort during recognition
    const abortHandler = () => {
      try {
        if (worker) {
          worker.terminate().catch(() => {});
        }
      } catch {}
    };

    if (signal) {
      signal.addEventListener('abort', abortHandler, { once: true });
    }

    const recognizeResult = await worker.recognize(element);

    if (signal) {
      signal.removeEventListener('abort', abortHandler);
    }

    if (signal?.aborted) {
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
    if (signal?.aborted) {
      throw new Error('OCR was cancelled.');
    }
    const message = err instanceof Error ? err.message : 'Unexpected recognition failure.';
    throw new Error(message);
  } finally {
    cleanup();
    if (worker) {
      try {
        await worker.terminate();
      } catch {}
      worker = null;
    }
  }
}

export type ResumeImportFileType = 'pdf' | 'docx' | 'image';

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  fileType?: ResumeImportFileType;
}

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
export const MAX_IMAGE_DIMENSION = 12000; // 12,000 pixels on any side
export const MAX_IMAGE_MEGAPIXELS = 25_000_000; // ~25 megapixels

// Common explicitly rejected non-document / non-image extensions
const EXPLICITLY_REJECTED_EXTS = [
  'svg', 'gif', 'bmp', 'tiff', 'tif', 'heic', 'heif', 'ico', 'avif',
  'doc', 'txt', 'rtf', 'odt', 'pages', 'html', 'htm',
  'exe', 'bat', 'sh', 'cmd', 'bin', 'zip', 'rar', '7z', 'tar', 'gz',
  'js', 'ts', 'json', 'py', 'java', 'c', 'cpp', 'css'
];

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

  // Check explicitly rejected extensions
  if (EXPLICITLY_REJECTED_EXTS.includes(ext)) {
    return { valid: false, error: 'This file type is not supported.' };
  }

  // Reject unsupported image MIME types
  if (
    mimeType === 'image/svg+xml' ||
    mimeType === 'image/gif' ||
    mimeType === 'image/bmp' ||
    mimeType === 'image/tiff' ||
    mimeType === 'image/heic' ||
    mimeType === 'image/heif' ||
    mimeType === 'image/avif'
  ) {
    return { valid: false, error: 'This file type is not supported.' };
  }

  // Reject explicitly non-document, non-image MIME types
  if (
    mimeType.startsWith('text/') ||
    mimeType.startsWith('audio/') ||
    mimeType.startsWith('video/') ||
    mimeType === 'application/x-msdownload' ||
    mimeType === 'application/msword'
  ) {
    return { valid: false, error: 'This file type is not supported.' };
  }

  // PDF
  if (ext === 'pdf') {
    if (mimeType !== '' && mimeType !== 'application/pdf') {
      return { valid: false, error: 'This file type is not supported.' };
    }
    return { valid: true, fileType: 'pdf' };
  }

  // DOCX
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

  // Images (PNG, JPG, JPEG, WEBP)
  const isImageExt = ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'webp';
  if (isImageExt) {
    const validImageMimes = ['image/png', 'image/jpeg', 'image/webp'];
    // Inconsistent extension / MIME rejection where detectable:
    // If MIME is provided, it must match a valid image MIME
    if (mimeType !== '' && !validImageMimes.includes(mimeType)) {
      return { valid: false, error: 'This file type is not supported.' };
    }
    // Also check extension vs specific MIME consistency if both present
    if (ext === 'png' && mimeType !== '' && mimeType !== 'image/png') {
      return { valid: false, error: 'This file type is not supported.' };
    }
    if ((ext === 'jpg' || ext === 'jpeg') && mimeType !== '' && mimeType !== 'image/jpeg') {
      return { valid: false, error: 'This file type is not supported.' };
    }
    if (ext === 'webp' && mimeType !== '' && mimeType !== 'image/webp') {
      return { valid: false, error: 'This file type is not supported.' };
    }
    return { valid: true, fileType: 'image' };
  }

  // Detect image by MIME if extension is missing but MIME is valid
  if (mimeType === 'image/png' || mimeType === 'image/jpeg' || mimeType === 'image/webp') {
    if (ext !== '' && !isImageExt) {
      return { valid: false, error: 'This file type is not supported.' };
    }
    return { valid: true, fileType: 'image' };
  }

  return { valid: false, error: 'This file type is not supported.' };
}

export function validateImageDimensions(width: number, height: number): { valid: boolean; error?: string } {
  if (width <= 0 || height <= 0) {
    return { valid: false, error: 'This image file appears to be corrupted or undecodable.' };
  }

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    return {
      valid: false,
      error: 'Image dimensions exceed the safety limit (maximum 25 megapixels or 12,000 pixels on any side).'
    };
  }

  if (width * height > MAX_IMAGE_MEGAPIXELS) {
    return {
      valid: false,
      error: 'Image dimensions exceed the safety limit (maximum 25 megapixels or 12,000 pixels on any side).'
    };
  }

  return { valid: true };
}

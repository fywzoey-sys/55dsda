import React, { useState, useEffect } from 'react';
import { ImageIcon } from 'lucide-react';

interface ImageFilePreviewProps {
  file: File;
  isProcessing: boolean;
  onReplace: () => void;
  onRemove: () => void;
}

export const ImageFilePreview: React.FC<ImageFilePreviewProps> = ({
  file,
  isProcessing,
  onReplace,
  onRemove,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    let url: string | null = null;
    try {
      url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } catch {
      setPreviewUrl(null);
    }

    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [file]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileTypeLabel = (file: File): string => {
    const ext = file.name.slice(file.name.lastIndexOf('.') + 1).toUpperCase();
    if (ext) return `${ext} Image`;
    if (file.type.includes('png')) return 'PNG Image';
    if (file.type.includes('jpeg') || file.type.includes('jpg')) return 'JPEG Image';
    if (file.type.includes('webp')) return 'WEBP Image';
    return 'Image';
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 bg-[#FFFEFA] border border-[#E2DACF] rounded-xl">
      <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
        {/* Restrained thumbnail preview */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg border border-[#E2DACF] bg-[#F5F2EB] flex items-center justify-center overflow-hidden shrink-0">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Resume preview"
              className="w-full h-full object-contain"
            />
          ) : (
            <ImageIcon className="w-6 h-6 text-[#8B9B58]" />
          )}
        </div>

        {/* File details */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[#1F1F1B] truncate" title={file.name}>
            {file.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-[#6E6A62]">
            <span>{formatFileSize(file.size)}</span>
            <span>•</span>
            <span className="font-medium text-[#7D7971]">{getFileTypeLabel(file)}</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      {!isProcessing && (
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button
            type="button"
            onClick={onReplace}
            className="text-xs text-[#6E6A62] hover:text-[#1F1F1B] px-3 py-2 rounded-md hover:bg-black/5 transition-colors font-medium min-h-[36px] min-w-[44px] flex items-center justify-center"
          >
            Replace file
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-red-600 hover:text-red-700 px-3 py-2 rounded-md hover:bg-red-50 transition-colors font-medium min-h-[36px] min-w-[44px] flex items-center justify-center"
          >
            Remove file
          </button>
        </div>
      )}
    </div>
  );
};

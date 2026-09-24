import React from 'react';
import { Loader2 } from 'lucide-react';

interface OcrProgressProps {
  status: string;
  progress?: number;
  onCancel: () => void;
}

export const OcrProgress: React.FC<OcrProgressProps> = ({
  status,
  progress,
  onCancel
}) => {
  const hasPercentage = typeof progress === 'number' && progress > 0 && progress <= 100;

  return (
    <div className="p-4 bg-[#F5F2EB] rounded-xl border border-[#E2DACF] space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Loader2 className="w-4 h-4 animate-spin text-[#8B9B58] shrink-0" />
          <p className="text-xs font-medium text-[#1F1F1B] truncate">
            {status || 'Recognizing image…'}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {hasPercentage && (
            <span className="text-xs font-semibold text-[#8B9B58]">
              {progress}%
            </span>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-red-600 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-100/60 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-[#E2DACF]/60 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-[#8B9B58] h-1.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${hasPercentage ? progress : 15}%` }}
        />
      </div>

      <p className="text-[11px] text-[#6E6A62]">
        Local browser OCR running. Your image never leaves your device.
      </p>
    </div>
  );
};

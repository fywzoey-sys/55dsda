import React from 'react';
import { Download, Eye, Upload } from 'lucide-react';

export type SaveStatus = 'saved' | 'saving' | 'error';

interface ToolbarProps {
  currentResumeName: string;
  saveStatus: SaveStatus;
  onOpenImport: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ currentResumeName, saveStatus, onOpenImport }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-3 mb-4">
      {/* Left info */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <span className="font-semibold text-sm text-[#1F1F1B] truncate max-w-[140px] sm:max-w-xs">
          {currentResumeName}
        </span>
        <span 
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#E2DACF]/50 text-[#6E6A62] transition-colors"
          title={saveStatus === 'saved' ? 'All changes saved to your browser' : saveStatus === 'saving' ? 'Saving changes...' : 'Failed to save to local storage'}
        >
          {saveStatus === 'saving' ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-[#AAC06A] animate-ping"></span>
              <span>Saving…</span>
            </>
          ) : saveStatus === 'error' ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
              <span>Save failed</span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-[#AAC06A]"></span>
              <span>Saved locally</span>
            </>
          )}
        </span>
        <span className="text-[11px] text-[#6E6A62] font-medium hidden lg:inline-block">
          A4 preview
        </span>
      </div>

      {/* Middle & Right Controls */}
      <div className="flex items-center gap-3">
        {/* Template Selector Placeholder */}
        <div className="hidden lg:flex items-center">
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#E2DACF]/40 text-[#6E6A62] cursor-not-allowed opacity-80"
            title="Available in Phase 5"
          >
            Classic ▾
          </button>
        </div>

        {/* Preview Button */}
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#6E6A62] bg-[#E2DACF]/40 cursor-not-allowed opacity-80"
          title="Available in Phase 5"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Preview</span>
        </button>

        
        {/* Import Button */}
        <button
          type="button"
          onClick={onOpenImport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#1F1F1B] bg-white/60 hover:bg-white transition-colors border border-[#E2DACF]"
          title="Import resume"
          aria-label="Import resume"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Import</span>
        </button>
        
        {/* Export PDF Button */}
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-[#6E6A62] bg-[#E2DACF]/40 cursor-not-allowed opacity-80"
          title="Available in Phase 5"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export PDF</span>
        </button>
      </div>
    </div>
  );
};

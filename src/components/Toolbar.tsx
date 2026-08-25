import React from 'react';
import { TemplateType } from '../types';
import { Check, Download, Eye, Layers, Sparkles } from 'lucide-react';

interface ToolbarProps {
  currentResumeName: string;
  template: TemplateType;
  onSelectTemplate: (t: TemplateType) => void;
  onPreviewToggle?: () => void;
  onExportPDF?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  currentResumeName,
  template,
  onSelectTemplate,
  onPreviewToggle,
  onExportPDF,
}) => {
  const templates: TemplateType[] = ['Classic', 'Modern', 'Compact'];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-3 mb-4">
      {/* Left info */}
      <div className="flex items-center gap-3">
        <span className="font-semibold text-sm text-[#1F1F1B]">
          {currentResumeName}
        </span>
        <span 
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#E2DACF]/50 text-[#6E6A62]"
          title="Real autosave will be implemented in Phase 2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#AAC06A]"></span>
          Local prototype
        </span>
        <span className="text-[11px] text-[#6E6A62] font-medium hidden sm:inline-block">
          1 page ✓
        </span>
      </div>

      {/* Middle & Right Controls */}
      <div className="flex items-center gap-3">
        {/* Template Selector Placeholder */}
        <div className="flex items-center">
          <button
            disabled
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#E2DACF]/40 text-[#6E6A62] cursor-not-allowed opacity-80"
            title="Available in Phase 5"
          >
            Classic ▾
          </button>
        </div>

        {/* Preview Button */}
        <button
          disabled
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#6E6A62] bg-[#E2DACF]/40 cursor-not-allowed opacity-80"
          title="Available in Phase 5"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Preview</span>
        </button>

        {/* Export PDF Button */}
        <button
          disabled
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white/70 bg-[#1F1F1B]/60 cursor-not-allowed shadow-sm"
          title="Available in Phase 5"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export PDF</span>
        </button>
      </div>
    </div>
  );
};

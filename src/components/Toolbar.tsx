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
    <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 bg-[#FFFEFA]/80 backdrop-blur-md border border-[#E2DACF]/70 rounded-2xl shadow-xs mb-6">
      {/* Left info */}
      <div className="flex items-center gap-3">
        <span className="font-semibold text-sm text-[#1F1F1B]">
          {currentResumeName}
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EFE7D9] text-[#6E6A62]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#AAC06A]"></span>
          Saved locally
        </span>
        <span className="text-[11px] text-[#6E6A62] font-medium hidden sm:inline-block">
          1 page ✓
        </span>
      </div>

      {/* Middle & Right Controls */}
      <div className="flex items-center gap-3">
        {/* Template Selector */}
        <div className="flex items-center bg-[#EFE7D9] p-0.5 rounded-lg border border-[#E2DACF]">
          {templates.map((t) => {
            const isActive = template === t;
            return (
              <button
                key={t}
                onClick={() => onSelectTemplate(t)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#FFFEFA] text-[#1F1F1B] shadow-xs font-semibold'
                    : 'text-[#6E6A62] hover:text-[#1F1F1B]'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* Preview Button */}
        <button
          onClick={onPreviewToggle}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#1F1F1B] bg-[#EFE7D9] hover:bg-[#E2DACF] transition-all duration-100 border border-[#E2DACF]"
          title="Preview Resume"
        >
          <Eye className="w-3.5 h-3.5 text-[#6E6A62]" />
          <span className="hidden md:inline">Preview</span>
        </button>

        {/* Export PDF Button */}
        <button
          onClick={onExportPDF}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#FFFEFA] bg-[#1F1F1B] hover:bg-[#33332D] active:scale-95 transition-all duration-100 shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export PDF</span>
        </button>
      </div>
    </div>
  );
};

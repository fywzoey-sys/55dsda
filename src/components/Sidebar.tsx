import React from 'react';
import { Home, Briefcase, FileText, Plus, BookOpen, Layers } from 'lucide-react';

interface SidebarProps {
  currentResumeId: string;
  onSelectResume: (id: string) => void;
  resumes: { id: string; name: string }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentResumeId,
  onSelectResume,
  resumes,
}) => {
  return (
    <aside className="w-60 xl:w-64 flex-shrink-0 bg-[#EFE7D9]/70 backdrop-blur-md border border-[#E2DACF]/60 rounded-3xl p-4 flex flex-col justify-between shadow-xs select-none">
      <div>
        {/* Logo / Brand */}
        <div className="flex items-center gap-2.5 px-3 py-3 mb-6">
          <div className="w-8 h-8 rounded-xl bg-[#AAC06A] flex items-center justify-center text-[#1F1F1B] shadow-xs">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-semibold text-sm tracking-tight text-[#1F1F1B]">
              Resume Space
            </h1>
            <p className="text-[11px] text-[#6E6A62]">Internship Edition</p>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="space-y-1 mb-6">
          <button
            onClick={() => {}}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[#6E6A62] hover:text-[#1F1F1B] hover:bg-[#E2DACF]/50 transition-all duration-150"
          >
            <Home className="w-4 h-4 text-[#6E6A62]" />
            <span>Home</span>
          </button>
          <button
            onClick={() => {}}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[#6E6A62] hover:text-[#1F1F1B] hover:bg-[#E2DACF]/50 transition-all duration-150"
          >
            <BookOpen className="w-4 h-4 text-[#6E6A62]" />
            <span>Experience Library</span>
          </button>
        </nav>

        {/* My Resumes Section */}
        <div className="mb-4">
          <div className="px-3 pb-2 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6A62]/80">
              My Resumes
            </span>
          </div>
          <div className="space-y-1">
            {resumes.map((resume) => {
              const isSelected = resume.id === currentResumeId;
              return (
                <button
                  key={resume.id}
                  onClick={() => onSelectResume(resume.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                    isSelected
                      ? 'bg-[#D9DFAD] text-[#1F1F1B] shadow-xs font-semibold'
                      : 'text-[#6E6A62] hover:text-[#1F1F1B] hover:bg-[#E2DACF]/40'
                  }`}
                >
                  <FileText
                    className={`w-4 h-4 ${
                      isSelected ? 'text-[#1F1F1B]' : 'text-[#6E6A62]'
                    }`}
                  />
                  <span className="truncate">{resume.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* New Resume Button */}
      <div className="pt-2 border-t border-[#E2DACF]/60">
        <button
          onClick={() => {}}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium text-[#1F1F1B] bg-[#D9DFAD]/60 hover:bg-[#D9DFAD] border border-[#AAC06A]/30 transition-all duration-150 shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Resume</span>
        </button>
      </div>
    </aside>
  );
};

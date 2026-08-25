import { Home, FileText, Plus, BookOpen, Layers } from 'lucide-react';

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
    <aside className="w-full h-full flex-shrink-0 bg-[#D9DFAD] rounded-[20px] p-4 flex flex-col justify-between select-none">
      <div>
        {/* Logo / Brand */}
        <div className="flex items-center gap-2.5 px-3 py-3 mb-6">
          <div className="w-8 h-8 rounded-xl bg-[#AAC06A] flex items-center justify-center text-[#1F1F1B] shadow-sm">
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
            disabled
            aria-disabled="true"
            title="Available in a future phase"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[#6E6A62] cursor-not-allowed opacity-80"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>
          <button
            disabled
            aria-disabled="true"
            title="Available in Phase 3"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[#6E6A62] cursor-not-allowed opacity-80"
          >
            <BookOpen className="w-4 h-4" />
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
                  aria-current={isSelected ? 'page' : undefined}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1B]/20 ${
                    isSelected
                      ? 'bg-white/40 text-[#1F1F1B] shadow-sm font-semibold'
                      : 'text-[#6E6A62] hover:text-[#1F1F1B] hover:bg-[#EFE7D9]/40'
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
      <div className="pt-2 border-t border-[#AAC06A]/30">
        <button
          disabled
          aria-disabled="true"
          title="Available in Phase 3"
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium text-[#1F1F1B]/50 bg-white/20 cursor-not-allowed opacity-80"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Resume</span>
        </button>
      </div>
    </aside>
  );
};

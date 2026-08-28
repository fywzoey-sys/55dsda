import { RightTabType, Resume } from '../types';
import { libraryItems } from '../data/mockData';
import { Briefcase, BookOpen, Plus } from 'lucide-react';

interface RightPanelProps {
  activeTab: RightTabType;
  onTabChange: (tab: RightTabType) => void;
  resume: Resume;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  activeTab,
  onTabChange,
  resume,
}) => {
  return (
    <aside 
      className={`w-full h-full flex flex-col rounded-[20px] p-4 select-none transition-colors duration-200 ${
        activeTab === 'Job Description' ? 'bg-[#F5DCA9]' : 'bg-[#EFE7D9]'
      }`}
    >
      {/* Top Tabs */}
      <div className="flex bg-white/30 p-1 rounded-2xl mb-4">
        <button
          type="button"
          onClick={() => onTabChange('Job Description')}
          aria-selected={activeTab === 'Job Description'}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1B]/20 cursor-pointer ${
            activeTab === 'Job Description'
              ? 'bg-white/60 text-[#1F1F1B] font-semibold shadow-sm'
              : 'text-[#6E6A62] hover:text-[#1F1F1B]'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Job Description</span>
        </button>
        <button
          type="button"
          onClick={() => onTabChange('Library')}
          aria-selected={activeTab === 'Library'}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1B]/20 cursor-pointer ${
            activeTab === 'Library'
              ? 'bg-white/60 text-[#1F1F1B] font-semibold shadow-sm'
              : 'text-[#6E6A62] hover:text-[#1F1F1B]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Library</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 right-panel-content">
        {activeTab === 'Job Description' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6A62]">
                Target JD
              </span>
              <span className="text-[11px] px-2 py-0.5 bg-white/50 rounded-md font-medium text-[#1F1F1B]">
                {resume.name}
              </span>
            </div>
            
            <div className="bg-[#FFFEFA] border border-[#E2DACF]/60 rounded-[16px] p-4 shadow-sm min-h-[300px]">
              <div className="whitespace-pre-wrap text-xs text-[#1F1F1B] leading-relaxed font-sans">
                {resume.jd}
              </div>
            </div>
            <p className="text-[11px] text-[#6E6A62] italic px-1 text-center">
              JD editing will be available in Phase 5.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6A62]">
                Experience Library
              </span>
              <span className="text-[11px] px-2 py-0.5 bg-white/50 rounded-md font-medium text-[#1F1F1B]">
                Saved Bullets
              </span>
            </div>

            {libraryItems.map((item) => (
              <div key={item.id} className="space-y-2">
                <div className="flex items-center justify-between pb-1">
                  <div>
                    <h3 className="font-semibold text-xs text-[#1F1F1B]">
                      {item.company}
                    </h3>
                    <p className="text-[11px] text-[#6E6A62]">{item.role}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  {item.bullets.map((bullet) => (
                    <div
                      key={bullet.id}
                      className="group flex items-start justify-between gap-2 py-1.5 px-2 -mx-2 rounded-lg hover:bg-white/40 transition-colors duration-100 text-xs text-[#1F1F1B]"
                    >
                      <p className="leading-relaxed flex-1 mt-0.5">{bullet.text}</p>
                      <button
                        type="button"
                        disabled
                        aria-disabled="true"
                        className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-150 opacity-0 group-hover:opacity-100 bg-[#AAC06A]/20 text-[#6E6A62] cursor-not-allowed focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1B]/20"
                        title="Available in Phase 3"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};

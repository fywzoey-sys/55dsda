import React, { useState } from 'react';
import { RightTabType } from '../types';
import { mockJD, libraryItems } from '../data/mockData';
import { Briefcase, BookOpen, Plus, Check, Sparkles } from 'lucide-react';

interface RightPanelProps {
  activeTab: RightTabType;
  onTabChange: (tab: RightTabType) => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  activeTab,
  onTabChange,
}) => {
  const [addedBullets, setAddedBullets] = useState<Record<string, boolean>>({});

  const handleAddBullet = (key: string) => {
    setAddedBullets((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setAddedBullets((prev) => ({ ...prev, [key]: false }));
    }, 1500);
  };

  return (
    <aside 
      className={`w-full h-full flex flex-col rounded-[20px] p-4 select-none transition-colors duration-200 ${
        activeTab === 'Job Description' ? 'bg-[#F5DCA9]' : 'bg-[#EFE7D9]'
      }`}
    >
      {/* Top Tabs */}
      <div className="flex bg-white/30 p-1 rounded-2xl mb-4">
        <button
          onClick={() => onTabChange('Job Description')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
            activeTab === 'Job Description'
              ? 'bg-white/60 text-[#1F1F1B] font-semibold shadow-sm'
              : 'text-[#6E6A62] hover:text-[#1F1F1B]'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Job Description</span>
        </button>
        <button
          onClick={() => onTabChange('Library')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
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
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 right-panel-content">
        {activeTab === 'Job Description' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6A62]">
                Target JD
              </span>
              <span className="text-[11px] px-2 py-0.5 bg-white/50 rounded-md font-medium text-[#1F1F1B]">
                TikTok · PM Intern
              </span>
            </div>
            
            <div className="bg-[#FFFEFA] border border-[#E2DACF]/60 rounded-[16px] p-4 shadow-sm">
              <textarea
                readOnly
                value={mockJD}
                className="w-full h-[480px] bg-transparent text-xs text-[#1F1F1B] leading-relaxed resize-none focus:outline-none font-sans"
              />
            </div>
            <p className="text-[11px] text-[#6E6A62] italic px-1">
              Tip: Paste any target job description here to align bullets in future stages.
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

            {libraryItems.map((item, groupIdx) => (
              <div key={groupIdx} className="space-y-2">
                <div className="flex items-center justify-between pb-1">
                  <div>
                    <h3 className="font-semibold text-xs text-[#1F1F1B]">
                      {item.company}
                    </h3>
                    <p className="text-[11px] text-[#6E6A62]">{item.role}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  {item.bullets.map((bullet) => {
                    const bulletKey = `${groupIdx}-${bullet.id}`;
                    return (
                      <div
                        key={bullet.id}
                        className="group flex items-start justify-between gap-2 py-1.5 px-2 -mx-2 rounded-lg hover:bg-white/40 transition-colors duration-100 text-xs text-[#1F1F1B]"
                      >
                        <p className="leading-relaxed flex-1 mt-0.5">{bullet.text}</p>
                        <button
                          disabled
                          className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-150 opacity-0 group-hover:opacity-100 bg-[#AAC06A]/20 text-[#6E6A62] cursor-not-allowed"
                          title="Available in Phase 2"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};

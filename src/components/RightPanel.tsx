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
    <aside className="w-80 xl:w-88 flex-shrink-0 bg-[#EFE7D9]/70 backdrop-blur-md border border-[#E2DACF]/60 rounded-3xl p-4 flex flex-col shadow-xs select-none">
      {/* Top Tabs */}
      <div className="flex bg-[#E2DACF]/60 p-1 rounded-2xl mb-4 border border-[#E2DACF]">
        <button
          onClick={() => onTabChange('Job Description')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
            activeTab === 'Job Description'
              ? 'bg-[#F5DCA9] text-[#1F1F1B] font-semibold shadow-xs'
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
              ? 'bg-[#D9DFAD] text-[#1F1F1B] font-semibold shadow-xs'
              : 'text-[#6E6A62] hover:text-[#1F1F1B]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Library</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4">
        {activeTab === 'Job Description' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6A62]">
                Target JD
              </span>
              <span className="text-[11px] px-2 py-0.5 bg-[#F5DCA9]/60 rounded-md font-medium text-[#1F1F1B]">
                TikTok · PM Intern
              </span>
            </div>
            
            <div className="bg-[#FFFEFA] border border-[#E2DACF] rounded-2xl p-4 shadow-2xs">
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6A62]">
                Experience Library
              </span>
              <span className="text-[11px] px-2 py-0.5 bg-[#D9DFAD]/60 rounded-md font-medium text-[#1F1F1B]">
                Saved Bullets
              </span>
            </div>

            {libraryItems.map((item, groupIdx) => (
              <div
                key={groupIdx}
                className="bg-[#FFFEFA] border border-[#E2DACF] rounded-2xl p-3.5 shadow-2xs space-y-2.5"
              >
                <div className="flex items-center justify-between border-b border-[#E2DACF]/50 pb-2">
                  <div>
                    <h3 className="font-semibold text-xs text-[#1F1F1B]">
                      {item.company}
                    </h3>
                    <p className="text-[11px] text-[#6E6A62]">{item.role}</p>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 bg-[#EFE7D9] text-[#6E6A62] rounded-full">
                    {item.bulletsCount} saved
                  </span>
                </div>

                <div className="space-y-2">
                  {item.bullets.map((bullet, idx) => {
                    const bulletKey = `${groupIdx}-${idx}`;
                    const isAdded = addedBullets[bulletKey];
                    return (
                      <div
                        key={idx}
                        className="group flex items-start justify-between gap-2 p-2 rounded-xl bg-[#F6F1E7]/40 hover:bg-[#F6F1E7] transition-colors duration-100 text-xs text-[#1F1F1B]"
                      >
                        <p className="leading-relaxed flex-1">{bullet}</p>
                        <button
                          onClick={() => handleAddBullet(bulletKey)}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-150 ${
                            isAdded
                              ? 'bg-[#AAC06A] text-white'
                              : 'bg-[#EFE7D9] text-[#6E6A62] hover:bg-[#AAC06A] hover:text-[#1F1F1B]'
                          }`}
                          title="Add bullet to resume"
                        >
                          {isAdded ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Plus className="w-3.5 h-3.5" />
                          )}
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

import { RightTabType, Resume, LibraryExperience, Bullet, ExperienceSection } from '../types';
import { Briefcase, BookOpen, Plus, X, MoreHorizontal, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface RightPanelProps {
  onClose?: () => void;
  activeTab: RightTabType;
  onTabChange: (tab: RightTabType) => void;
  resume: Resume;
  library?: LibraryExperience[];
  onAddExperienceFromLibrary?: (libExp: LibraryExperience) => void;
  onAddBulletFromLibrary?: (libBullet: Bullet, targetExpId: string) => void;
  onDeleteLibraryItem?: (id: string) => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  activeTab,
  onTabChange,
  resume,
  onClose,
  library = [],
  onAddExperienceFromLibrary = () => {},
  onAddBulletFromLibrary = () => {},
  onDeleteLibraryItem = () => {},
}) => {
  const allExperiences = resume.sections
    .filter((s): s is ExperienceSection => s.type === 'experience')
    .flatMap(s => s.items);

  const [targetExpId, setTargetExpId] = useState<string>('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (allExperiences.length > 0) {
      if (!targetExpId || !allExperiences.find(e => e.id === targetExpId)) {
        setTargetExpId(allExperiences[0].id);
      }
    } else {
      setTargetExpId('');
    }
  }, [allExperiences, targetExpId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuOpenId && !(e.target as Element).closest('.lib-item-menu')) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpenId]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && deleteConfirmId) {
        setDeleteConfirmId(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [deleteConfirmId]);

  const handleAddExperience = (item: LibraryExperience) => {
    onAddExperienceFromLibrary(item);
    setAddedIds(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedIds(prev => ({ ...prev, [item.id]: false }));
    }, 1500);
  };

  const handleAddBullet = (bullet: Bullet) => {
    if (!targetExpId) return;
    onAddBulletFromLibrary(bullet, targetExpId);
  };

  return (
    <>
      <aside 
        className={`w-full h-full flex flex-col rounded-[20px] p-4 select-none transition-colors duration-200 ${
          activeTab === 'Job Description' ? 'bg-[#F5DCA9]' : 'bg-[#EFE7D9]'
        }`}
      >
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm text-[#1F1F1B]">Context</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center rounded-lg bg-white/50 text-[#1F1F1B] hover:bg-white/80 transition-colors cursor-pointer"
            aria-label="Close context panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Tabs */}
        <div className="flex bg-white/30 p-1 rounded-2xl mb-4 shrink-0">
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
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6A62]">
                    Experience Library
                  </span>
                  <span className="text-[11px] px-2 py-0.5 bg-white/50 rounded-md font-medium text-[#1F1F1B]">
                    Saved Bullets
                  </span>
                </div>

                <div className="bg-white/40 p-2 rounded-xl border border-[#E2DACF]/50">
                  <label className="text-[11px] text-[#6E6A62] mb-1 block font-medium">Add bullets to:</label>
                  {allExperiences.length > 0 ? (
                    <select
                      value={targetExpId}
                      onChange={(e) => setTargetExpId(e.target.value)}
                      className="w-full bg-[#FFFEFA] text-xs text-[#1F1F1B] border border-[#E2DACF] rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#AAC06A]/60"
                    >
                      {allExperiences.map(exp => (
                        <option key={exp.id} value={exp.id}>
                          {exp.company || 'Unnamed Company'} — {exp.role || 'Role'}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-xs text-[#6E6A62] py-1">Add an experience to the resume first.</p>
                  )}
                </div>
              </div>

              {library.length === 0 ? (
                <div className="text-center py-8 px-4 bg-white/40 rounded-[16px] border border-[#E2DACF]/50 border-dashed">
                  <p className="text-sm font-semibold text-[#1F1F1B] mb-2">No saved experiences yet.</p>
                  <p className="text-xs text-[#6E6A62] leading-relaxed">
                    Save an experience or bullet from your resume to reuse it here.
                  </p>
                </div>
              ) : (
                library.map((item) => {
                  const isMenuOpen = menuOpenId === item.id;
                  
                  return (
                    <div key={item.id} className="space-y-2 lib-item-menu relative">
                      <div className="flex items-center justify-between pb-1 border-b border-[#E2DACF]/30 group">
                        <div className="flex-1 pr-2">
                          <h3 className="font-semibold text-xs text-[#1F1F1B]">
                            {item.company || 'Unnamed Company'}
                          </h3>
                          <p className="text-[11px] text-[#6E6A62]">{item.role || 'Role'}</p>
                        </div>
                        
                        <div className="flex items-center gap-1 shrink-0">
                          {addedIds[item.id] ? (
                            <span className="text-[10px] font-semibold text-[#AAC06A] px-2 py-1">Added</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleAddExperience(item)}
                              className="w-7 h-7 rounded-md flex items-center justify-center transition-colors hover:bg-black/5 text-[#1F1F1B]"
                              aria-label={`Add ${item.company} experience to current resume`}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          )}
                          
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setMenuOpenId(isMenuOpen ? null : item.id)}
                              className="w-7 h-7 rounded-md flex items-center justify-center transition-colors hover:bg-black/5 text-[#6E6A62]"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                            
                            {isMenuOpen && (
                              <div className="absolute right-0 top-full mt-1 z-50 w-40 bg-[#FFFEFA] rounded-xl shadow-lg border border-[#E2DACF] p-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDeleteConfirmId(item.id);
                                    setMenuOpenId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Delete from Library
                                </button>
                              </div>
                            )}
                          </div>
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
                              disabled={!targetExpId}
                              onClick={() => handleAddBullet(bullet)}
                              className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-150 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 bg-[#AAC06A]/20 hover:bg-[#AAC06A]/40 text-[#1F1F1B] disabled:opacity-30 disabled:cursor-not-allowed focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1B]/20"
                              aria-label="Add bullet to selected experience"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 p-4"
          onClick={() => setDeleteConfirmId(null)}
        >
          <div 
            role="dialog"
            aria-modal="true"
            aria-labelledby="library-delete-dialog-title"
            className="bg-[#FFFEFA] rounded-2xl shadow-xl w-full max-w-sm p-5 border border-[#E2DACF]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="library-delete-dialog-title" className="text-sm font-semibold text-[#1F1F1B] mb-2">Delete library item?</h3>
            <p className="text-xs text-[#6E6A62] mb-5">This removes the saved copy only. Existing resumes will not change.</p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-[#1F1F1B] hover:bg-[#F6F1E7] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteLibraryItem(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 rounded-lg text-xs font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

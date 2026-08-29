/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Toolbar, SaveStatus } from './components/Toolbar';
import { ResumePaper } from './components/ResumePaper';
import { RightPanel } from './components/RightPanel';
import { mockResumes, libraryItems } from './data/mockData';
import { generateId } from './utils/id';
import { Resume, RightTabType, LibraryExperience, Bullet, ExperienceSection, Experience } from './types';
import { isValidResumeRecord, isValidResumeArray, isResume, isValidLibraryArray } from './utils/validation';
import { Menu, X, Briefcase, BookOpen } from 'lucide-react';

const STORAGE_KEY_V2 = 'resume-space:data:v2';
const STORAGE_KEY_V1 = 'resume-space:resumes:v1';
const AUTOSAVE_DEBOUNCE_MS = 600;

function loadStorage(): { resumes: Resume[]; activeResumeId: string; library: LibraryExperience[] } {
  try {
    const storedV2 = localStorage.getItem(STORAGE_KEY_V2);
    if (storedV2) {
      const parsed = JSON.parse(storedV2);
      if (parsed && Array.isArray(parsed.resumes)) {
        if (isValidResumeArray(parsed.resumes)) {
          // Verify unique IDs
          const ids = new Set(parsed.resumes.map((r: Resume) => r.id));
          if (ids.size === parsed.resumes.length) {
            let validActiveId = parsed.activeResumeId;
            if (typeof validActiveId !== 'string' || !ids.has(validActiveId)) {
              validActiveId = parsed.resumes[0].id;
              // we don't write here, but when the App renders, latestDataRef will eventually persist it
            }
            let validLibrary = parsed.library;
            if (!isValidLibraryArray(validLibrary)) {
              validLibrary = JSON.parse(JSON.stringify(libraryItems));
            }
            return { resumes: parsed.resumes, activeResumeId: validActiveId, library: validLibrary };
          }
        }
      }
    }

    const storedV1 = localStorage.getItem(STORAGE_KEY_V1);
    if (storedV1) {
      const parsed = JSON.parse(storedV1);
      let v1Resumes: Resume[] | null = null;
      let v1ActiveId = '';
      
      if (isValidResumeRecord(parsed)) {
        const arr = Object.values(parsed);
        if (arr.length > 0) {
          v1Resumes = arr;
          v1ActiveId = arr[0].id;
        }
      } else if (isResume(parsed)) {
        v1Resumes = [parsed];
        v1ActiveId = parsed.id;
      }
      
      if (v1Resumes && v1ActiveId) {
        // Migrate to V2
        try {
          localStorage.setItem(STORAGE_KEY_V2, JSON.stringify({ resumes: v1Resumes, activeResumeId: v1ActiveId, library: JSON.parse(JSON.stringify(libraryItems)) }));
        } catch (e) {
          console.warn('Failed to migrate V1 to V2:', e);
        }
        return { resumes: v1Resumes, activeResumeId: v1ActiveId, library: JSON.parse(JSON.stringify(libraryItems)) };
      }
    }
  } catch (err) {
    console.warn('Failed to parse resumes from LocalStorage, falling back to mock data:', err);
  }

  // Safe fallback
  const mockArr = Object.values(mockResumes);
  const fallbackResumes = JSON.parse(JSON.stringify(mockArr));
  return {
    resumes: fallbackResumes,
    activeResumeId: fallbackResumes[0].id,
    library: JSON.parse(JSON.stringify(libraryItems))
  };
}

export default function App() {
  const initialData = useRef(loadStorage());
  const [resumes, setResumes] = useState<Resume[]>(initialData.current.resumes);
  const [currentResumeId, setCurrentResumeId] = useState<string>(initialData.current.activeResumeId);
  const [library, setLibrary] = useState<LibraryExperience[]>(initialData.current.library);
  const [rightTab, setRightTab] = useState<RightTabType>('Job Description');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [mobileRightOpen, setMobileRightOpen] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');

  const isInitialMount = useRef<boolean>(true);
  const debounceTimerRef = useRef<number | null>(null);
  const latestDataRef = useRef({ resumes, activeResumeId: currentResumeId, library });

  useEffect(() => {
    latestDataRef.current = { resumes, activeResumeId: currentResumeId, library };
  }, [resumes, currentResumeId, library]);

  // Synchronous flush helper for page unload/visibility change
  const flushSave = useCallback(() => {
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    try {
      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(latestDataRef.current));
      setSaveStatus('saved');
    } catch (err) {
      console.error('Failed to flush save to LocalStorage:', err);
      setSaveStatus('error');
    }
  }, []);

  // Register pagehide and visibilitychange handlers to prevent data loss on closing/refreshing
  useEffect(() => {
    const handlePageHide = () => {
      flushSave();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushSave();
      }
    };

    window.addEventListener('pagehide', handlePageHide);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('pagehide', handlePageHide);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, [flushSave]);

  // Debounced Autosave to LocalStorage
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setSaveStatus('saving');

    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY_V2, JSON.stringify({ resumes, activeResumeId: currentResumeId, library }));
        setSaveStatus('saved');
      } catch (err) {
        console.error('Failed to save to LocalStorage:', err);
        setSaveStatus('error');
      }
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, [resumes, currentResumeId]);

  
  // Escape key to close drawers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setMobileRightOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const resumesList = resumes.map(r => ({ id: r.id, name: r.name || 'Untitled Resume' }));

  const currentResume = resumes.find(r => r.id === currentResumeId) || resumes[0];

  
  const handleAddExperienceFromLibrary = useCallback((libExp: LibraryExperience) => {
    setResumes(prev => {
      const activeIdx = prev.findIndex(r => r.id === currentResumeId);
      if (activeIdx === -1) return prev;
      
      const next = [...prev];
      const activeResume = { ...next[activeIdx] };
      const nextSections = [...activeResume.sections];
      
      let expSectionIdx = nextSections.findIndex(s => s.type === 'experience');
      
      const newExp: Experience = {
        id: generateId('exp'),
        company: libExp.company,
        role: libExp.role,
        startDate: libExp.startDate,
        endDate: libExp.endDate,
        bullets: libExp.bullets.map(b => ({
          id: generateId('bullet'),
          text: b.text
        }))
      };
      
      if (expSectionIdx === -1) {
        // Create section
        const newSection: ExperienceSection = {
          id: generateId('sec-exp'),
          type: 'experience',
          title: 'Experience',
          items: [newExp]
        };
        nextSections.push(newSection);
      } else {
        const expSection = { ...nextSections[expSectionIdx] } as ExperienceSection;
        expSection.items = [...expSection.items, newExp];
        nextSections[expSectionIdx] = expSection;
      }
      
      activeResume.sections = nextSections;
      activeResume.updatedAt = new Date().toISOString();
      next[activeIdx] = activeResume;
      return next;
    });
  }, [currentResumeId]);

  const handleAddBulletFromLibrary = useCallback((libBullet: Bullet, targetExpId: string) => {
    setResumes(prev => {
      const activeIdx = prev.findIndex(r => r.id === currentResumeId);
      if (activeIdx === -1) return prev;
      
      const next = [...prev];
      const activeResume = { ...next[activeIdx] };
      const nextSections = activeResume.sections.map(section => {
        if (section.type !== 'experience') return section;
        const expSection = section as ExperienceSection;
        return {
          ...expSection,
          items: expSection.items.map(exp => {
            if (exp.id === targetExpId) {
              return {
                ...exp,
                bullets: [
                  ...exp.bullets,
                  {
                    id: generateId('bullet'),
                    text: libBullet.text
                  }
                ]
              };
            }
            return exp;
          })
        };
      });
      
      activeResume.sections = nextSections;
      activeResume.updatedAt = new Date().toISOString();
      next[activeIdx] = activeResume;
      return next;
    });
  }, [currentResumeId]);

  const handleSaveExperienceToLibrary = useCallback((exp: Experience) => {
    setLibrary(prev => {
      const newLibExp: LibraryExperience = {
        id: generateId('lib-exp'),
        company: exp.company,
        role: exp.role,
        startDate: exp.startDate,
        endDate: exp.endDate,
        bullets: exp.bullets.map(b => ({
          id: generateId('lib-bullet'),
          text: b.text
        }))
      };
      return [...prev, newLibExp];
    });
  }, []);

  const handleSaveBulletToLibrary = useCallback((exp: Experience, bullet: Bullet) => {
    setLibrary(prev => {
      const newLibExp: LibraryExperience = {
        id: generateId('lib-exp'),
        company: exp.company,
        role: exp.role,
        startDate: exp.startDate,
        endDate: exp.endDate,
        bullets: [
          {
            id: generateId('lib-bullet'),
            text: bullet.text
          }
        ]
      };
      return [...prev, newLibExp];
    });
  }, []);

  const handleDeleteLibraryItem = useCallback((id: string) => {
    setLibrary(prev => prev.filter(item => item.id !== id));
  }, []);

  const handleUpdateResume = useCallback((updatedResume: Resume) => {
    setResumes((prev) => prev.map(r => r.id === updatedResume.id ? { ...updatedResume, updatedAt: new Date().toISOString() } : r));
  }, []);

  const handleCreateResume = useCallback(() => {
    const newId = `resume-${Date.now()}`;
    const newResume: Resume = {
      id: newId,
      name: 'Untitled Resume',
      template: 'Classic',
      jd: '',
      fullName: '',
      title: '',
      contact: { email: '', phone: '', location: '', linkedin: '' },
      sections: [
        { 
          id: 'sec-edu', type: 'education', title: 'Education', 
          items: [{ id: `edu-${Date.now()}`, school: '', degree: '', startDate: '', endDate: '' }] 
        },
        { 
          id: 'sec-exp', type: 'experience', title: 'Experience', 
          items: [{ id: `exp-${Date.now()}`, company: '', role: '', startDate: '', endDate: '', bullets: [{ id: `bul-${Date.now()}`, text: '' }] }] 
        },
        { 
          id: 'sec-proj', type: 'projects', title: 'Projects', 
          items: [{ id: `proj-${Date.now()}`, name: '', role: '', startDate: '', endDate: '', bullets: [{ id: `pbul-${Date.now()}`, text: '' }] }] 
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setResumes(prev => [...prev, newResume]);
    setCurrentResumeId(newId);
  }, []);

  const handleRenameResume = useCallback((id: string, newName: string) => {
    setResumes(prev => prev.map(r => r.id === id ? { ...r, name: newName || 'Untitled Resume', updatedAt: new Date().toISOString() } : r));
  }, []);

  const handleDeleteResume = useCallback((id: string) => {
    setResumes(prev => {
      if (prev.length <= 1) return prev;
      const filtered = prev.filter(r => r.id !== id);
      if (currentResumeId === id) {
        const index = prev.findIndex(r => r.id === id);
        const nextIndex = Math.min(index, filtered.length - 1);
        setCurrentResumeId(filtered[nextIndex].id);
      }
      return filtered;
    });
  }, [currentResumeId]);

  return (
    <div className="h-screen h-[100dvh] overflow-hidden bg-[#F6F1E7] text-[#1F1F1B] font-sans flex flex-col p-0 lg:p-5 selection:bg-[#D9DFAD]/50">
      
      {/* Mobile Top Header */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between bg-[#EFE7D9] px-4 py-2 border-b border-[#E2DACF] shadow-sm pt-[max(0.5rem,env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={() => {
            setMobileMenuOpen(true);
            setMobileRightOpen(false);
          }}
          className="w-11 h-11 flex items-center justify-center rounded-lg bg-[#FFFEFA] text-[#1F1F1B] shadow-sm cursor-pointer"
          aria-label="Open Sidebar"
          aria-expanded={mobileMenuOpen}
          aria-controls="sidebar-drawer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-semibold text-sm truncate px-2">{currentResume.name || 'Resume Space'}</span>
        <button
          type="button"
          onClick={() => {
            setMobileRightOpen(true);
            setMobileMenuOpen(false);
          }}
          className="w-11 h-11 flex items-center justify-center rounded-lg bg-[#FFFEFA] text-[#1F1F1B] shadow-sm cursor-pointer"
          aria-label="Open Context Panel"
          aria-expanded={mobileRightOpen}
          aria-controls="right-drawer"
        >
          {rightTab === 'Job Description' ? <Briefcase className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Three-Column Container */}
      <div className="flex-1 flex lg:grid lg:grid-cols-[224px_minmax(0,1fr)_304px] gap-4 min-h-0 w-full mx-auto relative">
        
        {/* Left Sidebar Drawer / Desktop Column */}
        {/* Backdrop */}
        <button 
          type="button"
          className={`fixed inset-0 bg-black/20 z-40 lg:hidden transition-opacity duration-200 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close Sidebar"
        />
        {/* Sidebar Content */}
        <div
          id="sidebar-drawer"
          className={`fixed inset-y-0 left-0 z-50 w-[86vw] max-w-[320px] transform transition-transform duration-200 ease-out lg:static lg:translate-x-0 lg:w-full lg:max-w-none lg:h-full lg:min-h-0 lg:p-0 lg:pt-0 lg:pb-0 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } flex flex-col p-4 lg:p-0 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]`}
        >
          {/* Mobile Sidebar Close Button */}
          <div className="lg:hidden flex justify-end mb-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="w-11 h-11 flex items-center justify-center rounded-lg bg-white/50 text-[#1F1F1B] hover:bg-white/80 transition-colors cursor-pointer"
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <Sidebar
            currentResumeId={currentResumeId}
            onSelectResume={(id) => {
              setCurrentResumeId(id);
              setMobileMenuOpen(false);
            }}
            resumes={resumesList}
            onCreateResume={handleCreateResume}
            onRenameResume={handleRenameResume}
            onDeleteResume={handleDeleteResume}
          />
        </div>

        {/* Central Workspace */}
        <main className="flex-1 flex flex-col bg-[#EFE7D9] lg:rounded-[20px] p-4 lg:p-6 lg:border border-[#E2DACF]/60 min-h-0 relative">
          <Toolbar currentResumeName={currentResume.name} saveStatus={saveStatus} />
          <div className="flex-1 overflow-y-auto min-h-0 workspace-scroll lg:pr-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <ResumePaper
              resume={currentResume}
              onUpdateResume={handleUpdateResume}
              onSaveExperienceToLibrary={handleSaveExperienceToLibrary}
              onSaveBulletToLibrary={handleSaveBulletToLibrary}
            />
          </div>
        </main>

        {/* Right Context Panel Drawer / Desktop Column */}
        {/* Backdrop */}
        <button 
          type="button"
          className={`fixed inset-0 bg-black/20 z-40 lg:hidden transition-opacity duration-200 ${mobileRightOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setMobileRightOpen(false)}
          aria-label="Close Context Panel"
        />
        {/* Right Panel Content */}
        <div
          id="right-drawer"
          className={`fixed inset-y-0 right-0 z-50 w-[92vw] max-w-[360px] transform transition-transform duration-200 ease-out lg:static lg:translate-x-0 lg:w-full lg:max-w-none lg:h-full lg:min-h-0 lg:p-0 lg:pt-0 lg:pb-0 ${
            mobileRightOpen ? 'translate-x-0' : 'translate-x-full'
          } flex flex-col p-4 lg:p-0 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]`}
        >
          <RightPanel
            activeTab={rightTab}
            onTabChange={(tab) => setRightTab(tab)}
            resume={currentResume}
            onClose={() => setMobileRightOpen(false)}
            library={library}
            onAddExperienceFromLibrary={handleAddExperienceFromLibrary}
            onAddBulletFromLibrary={handleAddBulletFromLibrary}
            onDeleteLibraryItem={handleDeleteLibraryItem}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Toolbar, SaveStatus } from './components/Toolbar';
import { ResumePaper } from './components/ResumePaper';
import { RightPanel } from './components/RightPanel';
import { mockResumes } from './data/mockData';
import { Resume, RightTabType } from './types';
import { isValidResumeRecord } from './utils/validation';
import { Menu, X, Briefcase, BookOpen } from 'lucide-react';

const STORAGE_KEY = 'resume-space:resumes:v1';
const AUTOSAVE_DEBOUNCE_MS = 600;

function loadInitialResumes(): Record<string, Resume> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (isValidResumeRecord(parsed)) {
        return parsed;
      }
      console.warn('LocalStorage data failed comprehensive validation, falling back to mock data safely.');
    }
  } catch (err) {
    console.warn('Failed to parse resumes from LocalStorage, falling back to mock data:', err);
  }

  // Safe fallback to deep-cloned initial mock data
  return JSON.parse(JSON.stringify(mockResumes));
}

export default function App() {
  const [resumes, setResumes] = useState<Record<string, Resume>>(loadInitialResumes);
  const [currentResumeId, setCurrentResumeId] = useState<string>('pm-resume');
  const [rightTab, setRightTab] = useState<RightTabType>('Job Description');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [mobileRightOpen, setMobileRightOpen] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');

  const isInitialMount = useRef<boolean>(true);
  const debounceTimerRef = useRef<number | null>(null);
  const latestResumesRef = useRef<Record<string, Resume>>(resumes);

  // Keep latestResumesRef always up to date
  useEffect(() => {
    latestResumesRef.current = resumes;
  }, [resumes]);

  // Synchronous flush helper for page unload/visibility change
  const flushSave = useCallback(() => {
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(latestResumesRef.current));
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
        localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes));
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
  }, [resumes]);

  
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

  const resumesList = [
    { id: 'pm-resume', name: resumes['pm-resume']?.name || 'PM Resume' },
    { id: 'growth-resume', name: resumes['growth-resume']?.name || 'Growth Resume' },
    { id: 'consulting-resume', name: resumes['consulting-resume']?.name || 'Consulting Resume' },
  ];

  const currentResume = resumes[currentResumeId] || resumes['pm-resume'] || mockResumes['pm-resume'];

  const handleUpdateResume = useCallback((updatedResume: Resume) => {
    setResumes((prev) => ({
      ...prev,
      [updatedResume.id]: {
        ...updatedResume,
        updatedAt: new Date().toISOString(),
      },
    }));
  }, []);

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
          />
        </div>

        {/* Central Workspace */}
        <main className="flex-1 flex flex-col bg-[#EFE7D9] lg:rounded-[20px] p-4 lg:p-6 lg:border border-[#E2DACF]/60 min-h-0 relative">
          <Toolbar currentResumeName={currentResume.name} saveStatus={saveStatus} />
          <div className="flex-1 overflow-y-auto min-h-0 workspace-scroll lg:pr-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <ResumePaper
              resume={currentResume}
              onUpdateResume={handleUpdateResume}
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
          />
        </div>
      </div>
    </div>
  );
};

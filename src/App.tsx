/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Toolbar } from './components/Toolbar';
import { ResumePaper } from './components/ResumePaper';
import { RightPanel } from './components/RightPanel';
import { mockResumes } from './data/mockData';
import { RightTabType } from './types';
import { Menu, X } from 'lucide-react';

export default function App() {
  const [currentResumeId, setCurrentResumeId] = useState<string>('pm-resume');
  const [rightTab, setRightTab] = useState<RightTabType>('Job Description');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [mobileRightOpen, setMobileRightOpen] = useState<boolean>(false);

  const resumesList = [
    { id: 'pm-resume', name: 'PM Resume' },
    { id: 'growth-resume', name: 'Growth Resume' },
    { id: 'consulting-resume', name: 'Consulting Resume' },
  ];

  const currentResume = mockResumes[currentResumeId] || mockResumes['pm-resume'];

  return (
    <div className="h-screen overflow-hidden bg-[#F6F1E7] text-[#1F1F1B] font-sans flex flex-col p-4 lg:p-5 selection:bg-[#D9DFAD]/50">
      
      {/* Mobile Top Header */}
      <div className="lg:hidden flex items-center justify-between bg-[#EFE7D9] px-4 py-3 rounded-2xl mb-4 border border-[#E2DACF]">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg bg-[#FFFEFA] text-[#1F1F1B] shadow-sm"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <span className="font-semibold text-sm">Resume Space</span>
        <button
          onClick={() => setMobileRightOpen(!mobileRightOpen)}
          className="p-1.5 rounded-lg bg-[#FFFEFA] text-[#1F1F1B] shadow-sm text-xs font-medium px-3"
        >
          {rightTab === 'Job Description' ? 'JD' : 'Library'}
        </button>
      </div>

      {/* Main Three-Column Container */}
      <div className="flex-1 lg:grid lg:grid-cols-[224px_minmax(0,1fr)_304px] gap-4 min-h-0 w-full mx-auto relative">
        
        {/* Left Sidebar (Desktop & Mobile Overlay) */}
        <div
          className={`${
            mobileMenuOpen ? 'flex' : 'hidden'
          } lg:block fixed lg:static inset-y-0 left-0 z-50 p-4 lg:p-0 min-h-0`}
        >
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
        <main className="flex-1 lg:flex flex-col bg-[#EFE7D9] rounded-[20px] p-4 lg:p-6 border border-[#E2DACF]/60 min-h-0">
          <Toolbar currentResumeName={currentResume.name} />

          <div className="flex-1 overflow-y-auto min-h-0 workspace-scroll pr-2">
            <ResumePaper resume={currentResume} />
          </div>
        </main>

        {/* Right Context Panel (Desktop & Mobile Overlay) */}
        <div
          className={`${
            mobileRightOpen ? 'flex' : 'hidden'
          } lg:block fixed lg:static inset-y-0 right-0 z-50 p-4 lg:p-0 min-h-0`}
        >
          <RightPanel
            activeTab={rightTab}
            onTabChange={(tab) => setRightTab(tab)}
            resume={currentResume}
          />
        </div>

      </div>

    </div>
  );
}


/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Toolbar } from './components/Toolbar';
import { ResumePaper } from './components/ResumePaper';
import { RightPanel } from './components/RightPanel';
import { mockResumes } from './data/mockData';
import { TemplateType, RightTabType } from './types';
import { Menu, X, Sparkles } from 'lucide-react';

export default function App() {
  const [currentResumeId, setCurrentResumeId] = useState<string>('pm-resume');
  const [template, setTemplate] = useState<TemplateType>('Classic');
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
    <div className="min-h-screen bg-[#F6F1E7] text-[#1F1F1B] font-sans flex flex-col p-3 md:p-5 selection:bg-[#D9DFAD]/50">
      
      {/* Mobile Top Header */}
      <div className="lg:hidden flex items-center justify-between bg-[#EFE7D9] px-4 py-3 rounded-2xl mb-4 border border-[#E2DACF]">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg bg-[#FFFEFA] text-[#1F1F1B] shadow-2xs"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <span className="font-semibold text-sm">Resume Space</span>
        <button
          onClick={() => setMobileRightOpen(!mobileRightOpen)}
          className="p-1.5 rounded-lg bg-[#FFFEFA] text-[#1F1F1B] shadow-2xs text-xs font-medium px-3"
        >
          {rightTab === 'Job Description' ? 'JD' : 'Library'}
        </button>
      </div>

      {/* Main Three-Column Container */}
      <div className="flex-1 flex gap-4 max-w-[1700px] w-full mx-auto relative overflow-hidden">
        
        {/* Left Sidebar (Desktop & Mobile Overlay) */}
        <div
          className={`${
            mobileMenuOpen ? 'flex' : 'hidden'
          } lg:flex fixed lg:static inset-y-0 left-0 z-50 bg-[#F6F1E7] lg:bg-transparent p-3 lg:p-0`}
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
        <main className="flex-1 flex flex-col bg-[#EFE7D9] rounded-3xl p-4 md:p-6 border border-[#E2DACF]/60 shadow-xs overflow-hidden">
          <Toolbar
            currentResumeName={currentResume.name}
            template={template}
            onSelectTemplate={(t) => setTemplate(t)}
            onPreviewToggle={() => {}}
            onExportPDF={() => {}}
          />

          <div className="flex-1 overflow-y-auto">
            <ResumePaper resume={currentResume} template={template} />
          </div>
        </main>

        {/* Right Context Panel (Desktop & Mobile Overlay) */}
        <div
          className={`${
            mobileRightOpen ? 'flex' : 'hidden'
          } xl:flex fixed xl:static inset-y-0 right-0 z-50 bg-[#F6F1E7] xl:bg-transparent p-3 xl:p-0`}
        >
          <RightPanel
            activeTab={rightTab}
            onTabChange={(tab) => setRightTab(tab)}
          />
        </div>

      </div>

    </div>
  );
}


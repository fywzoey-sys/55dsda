const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Add Briefcase and BookOpen
content = content.replace(
  "import { Menu, X } from 'lucide-react';",
  "import { Menu, X, Briefcase, BookOpen } from 'lucide-react';"
);

// Add Esc key listener
const escapeEffect = `
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
`;
content = content.replace(
  'const resumesList = [',
  escapeEffect + '\n  const resumesList = ['
);

// Replace return block
const appBodyStart = content.lastIndexOf('return (');

const newAppBody = `return (
    <div className="h-[100dvh] overflow-hidden bg-[#F6F1E7] text-[#1F1F1B] font-sans flex flex-col p-0 lg:p-5 selection:bg-[#D9DFAD]/50">
      
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
      <div className="flex-1 flex lg:grid lg:grid-cols-[224px_minmax(0,1fr)_304px] gap-4 min-h-0 w-full mx-auto relative relative">
        
        {/* Left Sidebar Drawer / Desktop Column */}
        {/* Backdrop */}
        <div 
          className={\`fixed inset-0 bg-black/20 z-40 lg:hidden transition-opacity duration-200 \${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}\`}
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close Sidebar"
        />
        {/* Sidebar Content */}
        <div
          id="sidebar-drawer"
          className={\`fixed inset-y-0 left-0 z-50 w-[86vw] max-w-[320px] transform transition-transform duration-200 ease-out lg:static lg:transform-none lg:w-full lg:max-w-none \${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } flex flex-col p-4 lg:p-0 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]\`}
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
        <div 
          className={\`fixed inset-0 bg-black/20 z-40 lg:hidden transition-opacity duration-200 \${mobileRightOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}\`}
          onClick={() => setMobileRightOpen(false)}
          aria-label="Close Context Panel"
        />
        {/* Right Panel Content */}
        <div
          id="right-drawer"
          className={\`fixed inset-y-0 right-0 z-50 w-[92vw] max-w-[360px] transform transition-transform duration-200 ease-out lg:static lg:transform-none lg:w-full lg:max-w-none \${
            mobileRightOpen ? 'translate-x-0' : 'translate-x-full'
          } flex flex-col p-4 lg:p-0 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]\`}
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
`;

content = content.slice(0, appBodyStart) + newAppBody;

fs.writeFileSync('src/App.tsx', content, 'utf-8');
console.log('App.tsx safely updated.');

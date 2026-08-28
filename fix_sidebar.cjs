const fs = require('fs');

const code = `import { Home, FileText, Plus, BookOpen, Layers, MoreHorizontal, Pencil, Trash2, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface SidebarProps {
  currentResumeId: string;
  onSelectResume: (id: string) => void;
  resumes: { id: string; name: string }[];
  onCreateResume: () => void;
  onRenameResume: (id: string, newName: string) => void;
  onDeleteResume: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentResumeId,
  onSelectResume,
  resumes,
  onCreateResume,
  onRenameResume,
  onDeleteResume,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuOpenId && !(e.target as Element).closest('.resume-item-menu')) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpenId]);

  const handleRenameSubmit = () => {
    if (editingId) {
      onRenameResume(editingId, editName.trim());
      setEditingId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleRenameSubmit();
    if (e.key === 'Escape') setEditingId(null);
  };

  return (
    <>
      <aside className="w-full h-full flex-shrink-0 bg-[#D9DFAD] rounded-[20px] p-4 flex flex-col justify-between select-none overflow-y-auto">
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
              type="button"
              disabled
              aria-disabled="true"
              title="Available in a future phase"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[#6E6A62] cursor-not-allowed opacity-80"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>
            <button
              type="button"
              disabled
              aria-disabled="true"
              title="Available in Phase 3B"
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
              <button
                type="button"
                onClick={onCreateResume}
                className="p-1 hover:bg-black/5 rounded-md text-[#6E6A62] transition-colors"
                title="Create New Resume"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-1 relative">
              {resumes.map((resume) => {
                const isSelected = resume.id === currentResumeId;
                const isEditing = editingId === resume.id;
                const isMenuOpen = menuOpenId === resume.id;

                return (
                  <div key={resume.id} className="relative resume-item-menu group">
                    {isEditing ? (
                      <div className={\`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium bg-white/60 shadow-inner\`}>
                        <FileText className="w-4 h-4 text-[#1F1F1B]" />
                        <input
                          ref={inputRef}
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onBlur={handleRenameSubmit}
                          onKeyDown={handleKeyDown}
                          className="flex-1 bg-transparent border-0 outline-none p-0 text-[#1F1F1B]"
                        />
                      </div>
                    ) : (
                      <div
                        onClick={() => onSelectResume(resume.id)}
                        className={\`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1B]/20 \${
                          isSelected
                            ? 'bg-white/40 text-[#1F1F1B] shadow-sm font-semibold'
                            : 'text-[#6E6A62] hover:text-[#1F1F1B] hover:bg-[#EFE7D9]/40'
                        }\`}
                      >
                        <FileText
                          className={\`w-4 h-4 \${
                            isSelected ? 'text-[#1F1F1B]' : 'text-[#6E6A62]'
                          }\`}
                        />
                        <span className="truncate flex-1">{resume.name}</span>
                        
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenId(isMenuOpen ? null : resume.id);
                          }}
                          className={\`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/5 \${isMenuOpen || isSelected ? 'opacity-100' : ''}\`}
                        >
                          <MoreHorizontal className="w-3.5 h-3.5 text-[#6E6A62]" />
                        </button>
                      </div>
                    )}

                    {isMenuOpen && !isEditing && (
                      <div className="absolute right-0 top-full mt-1 z-50 w-32 bg-[#FFFEFA] rounded-xl shadow-lg border border-[#E2DACF] p-1 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => {
                            setEditName(resume.name);
                            setEditingId(resume.id);
                            setMenuOpenId(null);
                          }}
                          className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-[#1F1F1B] hover:bg-[#F6F1E7] rounded-lg transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Rename
                        </button>
                        <button
                          type="button"
                          disabled={resumes.length <= 1}
                          onClick={() => {
                            setDeleteConfirmId(resume.id);
                            setMenuOpenId(null);
                          }}
                          className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* New Resume Button */}
        <div className="pt-2 border-t border-[#AAC06A]/30">
          <button
            type="button"
            onClick={onCreateResume}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium text-[#1F1F1B] bg-white/40 hover:bg-white/60 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Resume</span>
          </button>
        </div>
      </aside>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 p-4">
          <div className="bg-[#FFFEFA] rounded-2xl shadow-xl w-full max-w-sm p-5 border border-[#E2DACF]">
            <h3 className="text-sm font-semibold text-[#1F1F1B] mb-2">Delete resume?</h3>
            <p className="text-xs text-[#6E6A62] mb-5">This resume will be removed from this browser.</p>
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
                  onDeleteResume(deleteConfirmId);
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
`;

fs.writeFileSync('src/components/Sidebar.tsx', code);

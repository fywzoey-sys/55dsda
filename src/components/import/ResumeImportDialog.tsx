import React, { useState, useEffect, useRef } from 'react';
import { X, AlertCircle, Plus, Trash2, ArrowLeft, Upload, FileText, Loader2 } from 'lucide-react';
import { ParsedResumeDraft, Resume } from '../../types';
import { parseResumeText } from '../../utils/textResumeParser';
import { generateId } from '../../utils/id';
import { validateResumeImportFile, extractResumeTextFromFile } from '../../utils/resumeFileExtractor';

interface ResumeImportDialogProps {
  onClose: () => void;
  onConfirm: (resume: Resume) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const ResumeImportDialog: React.FC<ResumeImportDialogProps> = ({ onClose, onConfirm }) => {
  const [step, setStep] = useState<'import' | 'review'>('import');
  const [sourceTab, setSourceTab] = useState<'text' | 'file'>('text');
  const [text, setText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [draft, setDraft] = useState<ParsedResumeDraft | null>(null);
  const [showDiscard, setShowDiscard] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const requestIdRef = useRef(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      requestIdRef.current++;
    };
  }, []);

  const handleClose = () => {
    if (text.trim() !== '' || selectedFile !== null || draft !== null) {
      setShowDiscard(true);
    } else {
      onClose();
    }
  };

  const handleParseText = () => {
    const parsed = parseResumeText(text);
    setDraft(parsed);
    setStep('review');
  };

  const processSelectedFile = (file: File) => {
    requestIdRef.current++;
    setIsExtracting(false);
    setSelectedFile(file);
    const validation = validateResumeImportFile(file);
    if (!validation.valid) {
      setFileError(validation.error || 'This file type is not supported.');
    } else {
      setFileError(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    requestIdRef.current++;
    setIsExtracting(false);
    setSelectedFile(null);
    setFileError(null);
  };

  const handleParseFile = async () => {
    if (!selectedFile || isExtracting) return;

    const validation = validateResumeImportFile(selectedFile);
    if (!validation.valid) {
      setFileError(validation.error || 'This file type is not supported.');
      return;
    }

    setIsExtracting(true);
    setFileError(null);
    const currentRequestId = ++requestIdRef.current;

    try {
      const result = await extractResumeTextFromFile(selectedFile);
      if (!isMountedRef.current || currentRequestId !== requestIdRef.current) {
        return;
      }

      const parsed = parseResumeText(result.text);
      if (result.warnings && result.warnings.length > 0) {
        parsed.warnings.push(...result.warnings);
      }

      const baseName = selectedFile.name.replace(/\.[^/.]+$/, '').trim();
      if (baseName && (!parsed.name || parsed.name === 'Imported Resume')) {
        parsed.name = baseName;
      }

      setDraft(parsed);
      setStep('review');
    } catch (err: unknown) {
      if (!isMountedRef.current || currentRequestId !== requestIdRef.current) {
        return;
      }
      const message = err instanceof Error ? err.message : 'This document could not be read.';
      setFileError(message);
    } finally {
      if (isMountedRef.current && currentRequestId === requestIdRef.current) {
        setIsExtracting(false);
      }
    }
  };

  const handleConfirm = () => {
    if (!draft) return;
    
    // Generate fresh valid Resume object with brand new IDs
    const newResume: Resume = {
      id: generateId(),
      name: draft.name || 'Imported Resume',
      fullName: draft.fullName,
      title: draft.title,
      contact: { ...draft.contact },
      template: 'Classic',
      jd: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sections: draft.sections.map(sec => {
        if (sec.type === 'education') {
          return {
            id: generateId(),
            type: 'education',
            title: sec.title || 'Education',
            items: sec.items.map((item: any) => ({
              ...item,
              id: generateId()
            }))
          };
        }
        if (sec.type === 'experience') {
          return {
            id: generateId(),
            type: 'experience',
            title: sec.title || 'Experience',
            items: sec.items.map((item: any) => ({
              ...item,
              id: generateId(),
              bullets: item.bullets.map(b => ({ id: generateId(), text: b.text }))
            }))
          };
        }
        if (sec.type === 'projects') {
          return {
            id: generateId(),
            type: 'projects',
            title: sec.title || 'Projects',
            items: sec.items.map((item: any) => ({
              ...item,
              id: generateId(),
              bullets: item.bullets.map(b => ({ id: generateId(), text: b.text }))
            }))
          };
        }
        return { ...(sec as any), id: generateId() };
      })
    };
    
    onConfirm(newResume);
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showDiscard) setShowDiscard(false);
        else handleClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [showDiscard, text, selectedFile, draft]);

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/40 sm:p-4 backdrop-blur-sm"
        onClick={handleClose}
      >
        <div 
          role="dialog"
          aria-modal="true"
          aria-labelledby="import-dialog-title"
          className="bg-[#FFFEFA] w-full sm:max-w-4xl h-[100dvh] sm:h-auto sm:max-h-[90dvh] sm:rounded-2xl shadow-xl border border-[#E2DACF] flex flex-col relative"
          onClick={e => e.stopPropagation()}
        >
          {step === 'import' && (
            <>
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#E2DACF]/60 shrink-0">
                <div>
                  <h2 id="import-dialog-title" className="text-lg font-semibold text-[#1F1F1B]">
                    Import resume
                  </h2>
                  <p className="text-xs text-[#6E6A62] mt-0.5">
                    Choose how to import your resume. You’ll review everything before it is added.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 text-[#6E6A62] transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Segmented Control Tabs */}
              <div className="px-4 sm:px-5 pt-3 shrink-0">
                <div className="inline-flex bg-[#F4EFEA] p-0.5 rounded-lg border border-[#E2DACF]/70">
                  <button
                    type="button"
                    onClick={() => setSourceTab('text')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      sourceTab === 'text'
                        ? 'bg-[#FFFEFA] text-[#1F1F1B] shadow-xs'
                        : 'text-[#6E6A62] hover:text-[#1F1F1B]'
                    }`}
                  >
                    Paste Text
                  </button>
                  <button
                    type="button"
                    onClick={() => setSourceTab('file')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      sourceTab === 'file'
                        ? 'bg-[#FFFEFA] text-[#1F1F1B] shadow-xs'
                        : 'text-[#6E6A62] hover:text-[#1F1F1B]'
                    }`}
                  >
                    Upload File
                  </button>
                </div>
              </div>

              {/* Step Content */}
              <div className="p-4 sm:p-5 flex-1 overflow-y-auto">
                {sourceTab === 'text' ? (
                  <div className="flex flex-col h-full">
                    <textarea
                      value={text}
                      onChange={e => setText(e.target.value)}
                      className="w-full min-h-[300px] h-full bg-[#FFFEFA] border border-[#E2DACF] rounded-xl p-4 text-sm text-[#1F1F1B] font-sans resize-none focus:outline-none focus:ring-2 focus:ring-[#AAC06A]/60"
                      placeholder={"林知夏\n产品方向实习生\nlinzhixia@example.com | 138 0000 0000 | 上海\n\n教育经历\n示例大学\n信息管理与信息系统\n2022.09 - 2026.06\n\n实习经历\n校园创新中心\n产品实习生\n2025.06 - 至今\n- 整理用户访谈记录，归纳常见使用问题。\n- 协助维护需求文档，跟进需求调整。\n\n项目经历\n实习信息整理工具\n产品负责人\n2025.03 - 2025.06\n- 梳理学生管理实习信息时的常见问题。"}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span className={`text-xs ${text.length > 50000 ? 'text-red-600 font-semibold' : 'text-[#6E6A62]'}`}>
                        {text.length} / 50000 characters
                      </span>
                      <span className="text-[11px] text-[#6E6A62] italic">
                        Image and OCR import will be added in Phase 4C.
                      </span>
                    </div>
                    {text.length > 50000 && (
                      <p className="text-xs text-red-600 mt-2 font-medium">
                        Text exceeds the 50,000 character limit. Please reduce the length to proceed.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFileChange}
                    />

                    {!selectedFile ? (
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-8 sm:p-12 flex flex-col items-center justify-center cursor-pointer transition-colors text-center ${
                          isDragging
                            ? 'border-[#AAC06A] bg-[#AAC06A]/10'
                            : 'border-[#E2DACF] hover:border-[#AAC06A]/70 bg-[#FFFEFA]'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-full bg-[#F5F2EB] flex items-center justify-center text-[#6E6A62] mb-3">
                          <Upload className="w-6 h-6 text-[#6E6A62]" />
                        </div>
                        <p className="text-sm font-medium text-[#1F1F1B]">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-[#6E6A62] mt-1.5">
                          Supported formats: <span className="font-semibold text-[#1F1F1B]">.pdf, .docx</span>
                        </p>
                        <p className="text-xs text-[#6E6A62] mt-0.5">
                          Maximum file size: 10 MB
                        </p>
                      </div>
                    ) : (
                      <div className="bg-[#FFFEFA] border border-[#E2DACF] rounded-xl p-4 sm:p-5 space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-[#F5F2EB] flex items-center justify-center shrink-0 text-[#6E6A62]">
                              <FileText className="w-5 h-5 text-[#8B9B58]" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-[#1F1F1B] truncate">{selectedFile.name}</p>
                              <p className="text-xs text-[#6E6A62]">{formatFileSize(selectedFile.size)}</p>
                            </div>
                          </div>
                          {!isExtracting && (
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="text-xs text-[#6E6A62] hover:text-[#1F1F1B] px-2.5 py-1.5 rounded-md hover:bg-black/5 transition-colors font-medium"
                              >
                                Replace file
                              </button>
                              <button
                                type="button"
                                onClick={handleRemoveFile}
                                className="text-xs text-red-600 hover:text-red-700 px-2.5 py-1.5 rounded-md hover:bg-red-50 transition-colors font-medium"
                              >
                                Remove file
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Extraction loading state */}
                        {isExtracting && (
                          <div className="flex items-center gap-3 p-3.5 bg-[#F5F2EB] rounded-lg border border-[#E2DACF]/60">
                            <Loader2 className="w-4 h-4 animate-spin text-[#8B9B58]" />
                            <div className="text-xs">
                              <p className="font-medium text-[#1F1F1B]">
                                {selectedFile.name.toLowerCase().endsWith('.pdf') ? 'Reading PDF…' : 'Reading DOCX…'}
                              </p>
                              <p className="text-[#6E6A62] mt-0.5">Extracting resume text locally in browser...</p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between border-t border-[#E2DACF]/60 pt-3 text-xs text-[#6E6A62]">
                          <span>Supported formats: .pdf, .docx</span>
                          <span>Maximum file size: 10 MB</span>
                        </div>
                      </div>
                    )}

                    {/* Clear error message display */}
                    {fileError && (
                      <div className="p-3.5 bg-red-50 border border-red-200/80 rounded-xl flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-red-800">{fileError}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 sm:p-5 border-t border-[#E2DACF]/60 flex justify-end gap-3 shrink-0 bg-[#FFFEFA] sm:rounded-b-2xl">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-[#1F1F1B] hover:bg-black/5 transition-colors"
                >
                  Cancel
                </button>
                {sourceTab === 'text' ? (
                  <button
                    type="button"
                    disabled={text.trim().length === 0 || text.length > 50000}
                    onClick={handleParseText}
                    className="px-4 py-2 rounded-lg text-xs font-medium text-[#1F1F1B] bg-[#D9DFAD] hover:bg-[#C9D19D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Parse resume
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!selectedFile || fileError !== null || isExtracting}
                    onClick={handleParseFile}
                    className="px-4 py-2 rounded-lg text-xs font-medium text-[#1F1F1B] bg-[#D9DFAD] hover:bg-[#C9D19D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {isExtracting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>
                      {isExtracting
                        ? selectedFile?.name.toLowerCase().endsWith('.pdf')
                          ? 'Reading PDF…'
                          : 'Reading DOCX…'
                        : 'Parse resume'}
                    </span>
                  </button>
                )}
              </div>
            </>
          )}

          {step === 'review' && draft && (
            <RecognitionReview
              draft={draft}
              setDraft={setDraft}
              onBack={() => setStep('import')}
              onConfirm={handleConfirm}
              onClose={handleClose}
            />
          )}
        </div>
      </div>

      {showDiscard && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div role="alertdialog" aria-modal="true" className="bg-[#FFFEFA] rounded-2xl shadow-xl w-full max-w-sm p-6 border border-[#E2DACF]">
            <h3 className="text-sm font-semibold text-[#1F1F1B] mb-2">Discard import?</h3>
            <p className="text-xs text-[#6E6A62] mb-6 leading-relaxed">Your imported content and review changes will be discarded.</p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDiscard(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-[#1F1F1B] hover:bg-black/5 transition-colors"
              >
                Keep editing
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const RecognitionReview: React.FC<{
  draft: ParsedResumeDraft;
  setDraft: React.Dispatch<React.SetStateAction<ParsedResumeDraft | null>>;
  onBack: () => void;
  onConfirm: () => void;
  onClose: () => void;
}> = ({ draft, setDraft, onBack, onConfirm, onClose }) => {
  const eduSection = draft.sections.find(s => s.type === 'education');
  const expSection = draft.sections.find(s => s.type === 'experience');
  const projSection = draft.sections.find(s => s.type === 'projects');

  const updateDraft = (fn: (d: ParsedResumeDraft) => void) => {
    setDraft(prev => {
      if (!prev) return prev;
      const next = { ...prev };
      // deep clone sections just in case
      next.sections = next.sections.map(s => {
        if (s.type === 'education') return { ...s, items: s.items.map(i => ({ ...i })) };
        if (s.type === 'experience') return { ...s, items: s.items.map(i => ({ ...i, bullets: i.bullets.map(b => ({ ...b })) })) };
        if (s.type === 'projects') return { ...s, items: s.items.map(i => ({ ...i, bullets: i.bullets.map(b => ({ ...b })) })) };
        return { ...(s as any) };
      });
      fn(next);
      return next;
    });
  };

  const handleUpdateContact = (field: keyof ParsedResumeDraft['contact'], val: string) => {
    updateDraft(d => { d.contact[field] = val; });
  };

  const isValidToConfirm = draft.sections.some(s => {
    if (s.type === 'education' && s.items.length > 0) return true;
    if (s.type === 'experience' && s.items.length > 0) return true;
    if (s.type === 'projects' && s.items.length > 0) return true;
    return false;
  });

  return (
    <>
      <div className="flex flex-col p-4 sm:p-5 border-b border-[#E2DACF]/60 shrink-0 bg-[#FFFEFA] sm:rounded-t-2xl">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 text-[#6E6A62] transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 id="import-dialog-title" className="text-lg font-semibold text-[#1F1F1B]">Review import</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 text-[#6E6A62] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs font-medium text-[#AAC06A] ml-11">Nothing will be added until you confirm.</p>
      </div>

      <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-6 bg-[#FFFEFA]/50">
        
        {/* Warnings */}
        {draft.warnings.length > 0 && (
          <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-4">
            <div className="flex gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-amber-800">Warnings</h4>
                <ul className="list-disc list-inside text-xs text-amber-700 space-y-0.5">
                  {draft.warnings.map(w => (
                    <li key={w.id}>
                      {w.message}
                      {w.sourceLine && <span className="opacity-70 ml-1">("{w.sourceLine.substring(0, 30)}{w.sourceLine.length > 30 ? '...' : ''}")</span>}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Basic Info */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-[#1F1F1B]">Basic Info</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="import-name" className="text-[11px] font-medium text-[#6E6A62] block mb-1">Resume Name</label>
              <input 
                id="import-name"
                type="text" 
                value={draft.name} 
                onChange={e => updateDraft(d => { d.name = e.target.value; })} 
                className="w-full border border-[#E2DACF] rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#AAC06A]/60 outline-none"
              />
            </div>
            <div>
              <label htmlFor="import-fullname" className="text-[11px] font-medium text-[#6E6A62] block mb-1">Full Name</label>
              <input 
                id="import-fullname"
                type="text" 
                value={draft.fullName} 
                onChange={e => updateDraft(d => { d.fullName = e.target.value; })} 
                className="w-full border border-[#E2DACF] rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#AAC06A]/60 outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="import-title" className="text-[11px] font-medium text-[#6E6A62] block mb-1">Title</label>
              <input 
                id="import-title"
                type="text" 
                value={draft.title} 
                onChange={e => updateDraft(d => { d.title = e.target.value; })} 
                className="w-full border border-[#E2DACF] rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#AAC06A]/60 outline-none"
              />
            </div>
            <div>
              <label htmlFor="import-email" className="text-[11px] font-medium text-[#6E6A62] block mb-1">Email</label>
              <input 
                id="import-email"
                type="text" 
                value={draft.contact.email} 
                onChange={e => handleUpdateContact('email', e.target.value)} 
                className="w-full border border-[#E2DACF] rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#AAC06A]/60 outline-none"
              />
            </div>
            <div>
              <label htmlFor="import-phone" className="text-[11px] font-medium text-[#6E6A62] block mb-1">Phone</label>
              <input 
                id="import-phone"
                type="text" 
                value={draft.contact.phone} 
                onChange={e => handleUpdateContact('phone', e.target.value)} 
                className="w-full border border-[#E2DACF] rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#AAC06A]/60 outline-none"
              />
            </div>
            <div>
              <label htmlFor="import-location" className="text-[11px] font-medium text-[#6E6A62] block mb-1">Location</label>
              <input 
                id="import-location"
                type="text" 
                value={draft.contact.location} 
                onChange={e => handleUpdateContact('location', e.target.value)} 
                className="w-full border border-[#E2DACF] rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#AAC06A]/60 outline-none"
              />
            </div>
            <div>
              <label htmlFor="import-linkedin" className="text-[11px] font-medium text-[#6E6A62] block mb-1">LinkedIn</label>
              <input 
                id="import-linkedin"
                type="text" 
                value={draft.contact.linkedin} 
                onChange={e => handleUpdateContact('linkedin', e.target.value)} 
                className="w-full border border-[#E2DACF] rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#AAC06A]/60 outline-none"
              />
            </div>
          </div>
        </section>

        {/* Education */}
        <section className="space-y-3 pt-4 border-t border-[#E2DACF]/40">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#1F1F1B]">Education</h3>
            <button
              type="button"
              onClick={() => updateDraft(d => {
                let sec = d.sections.find(s => s.type === 'education');
                if (!sec) {
                  sec = { id: generateId(), type: 'education', title: 'Education', items: [] };
                  d.sections.push(sec);
                }
                (sec as any).items.push({ id: generateId(), school: '', degree: '', startDate: '', endDate: '' });
              })}
              className="text-[11px] font-medium text-[#1F1F1B] flex items-center gap-1 hover:bg-black/5 px-2 py-1 rounded"
            >
              <Plus className="w-3 h-3" /> Add Education
            </button>
          </div>
          {eduSection?.items.map((item: any) => (
            <div key={item.id} className="p-3 border border-[#E2DACF] rounded-xl space-y-3 relative group bg-white/50">
              <button 
                type="button"
                onClick={() => updateDraft(d => {
                  const s = d.sections.find(sec => sec.type === 'education') as any;
                  if (s) s.items = s.items.filter((i: any) => i.id !== item.id);
                })}
                aria-label="Delete"
                className="absolute top-2 right-2 p-1.5 text-red-600/60 hover:text-red-600 hover:bg-red-50 rounded-lg lg:opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                <div>
                  <label htmlFor={`edu-school-${item.id}`} className="text-[10px] text-[#6E6A62] block mb-1">School</label>
                  <input id={`edu-school-${item.id}`} type="text" value={item.school} onChange={e => updateDraft(d => {
                    const s = d.sections.find(sec => sec.type === 'education') as any;
                    const i = s.items.find((x: any) => x.id === item.id);
                    if (i) i.school = e.target.value;
                  })} className="w-full border border-[#E2DACF] rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-[#AAC06A]/60 outline-none" />
                </div>
                <div>
                  <label htmlFor={`edu-degree-${item.id}`} className="text-[10px] text-[#6E6A62] block mb-1">Degree</label>
                  <input id={`edu-degree-${item.id}`} type="text" value={item.degree} onChange={e => updateDraft(d => {
                    const s = d.sections.find(sec => sec.type === 'education') as any;
                    const i = s.items.find((x: any) => x.id === item.id);
                    if (i) i.degree = e.target.value;
                  })} className="w-full border border-[#E2DACF] rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-[#AAC06A]/60 outline-none" />
                </div>
                <div className="flex gap-2 sm:col-span-2">
                  <div className="flex-1">
                    <label htmlFor={`start-${item.id}`} className="text-[10px] text-[#6E6A62] block mb-1">Start Date</label>
                    <input id={`start-${item.id}`} type="text" value={item.startDate} onChange={e => updateDraft(d => {
                      const s = d.sections.find(sec => sec.type === 'education') as any;
                      const i = s.items.find((x: any) => x.id === item.id);
                      if (i) i.startDate = e.target.value;
                    })} className="w-full border border-[#E2DACF] rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-[#AAC06A]/60 outline-none" />
                  </div>
                  <div className="flex-1">
                    <label htmlFor={`end-${item.id}`} className="text-[10px] text-[#6E6A62] block mb-1">End Date</label>
                    <input id={`end-${item.id}`} type="text" value={item.endDate} onChange={e => updateDraft(d => {
                      const s = d.sections.find(sec => sec.type === 'education') as any;
                      const i = s.items.find((x: any) => x.id === item.id);
                      if (i) i.endDate = e.target.value;
                    })} className="w-full border border-[#E2DACF] rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-[#AAC06A]/60 outline-none" />
                  </div>
                </div>
              </div>
            </div>
          ))}
          {(!eduSection || eduSection.items.length === 0) && <p className="text-xs text-[#6E6A62] italic">No education recognized.</p>}
        </section>

        {/* Experience */}
        <section className="space-y-3 pt-4 border-t border-[#E2DACF]/40">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#1F1F1B]">Experience</h3>
            <button
              type="button"
              onClick={() => updateDraft(d => {
                let sec = d.sections.find(s => s.type === 'experience');
                if (!sec) {
                  sec = { id: generateId(), type: 'experience', title: 'Experience', items: [] };
                  d.sections.push(sec);
                }
                (sec as any).items.push({ id: generateId(), company: '', role: '', startDate: '', endDate: '', bullets: [] });
              })}
              className="text-[11px] font-medium text-[#1F1F1B] flex items-center gap-1 hover:bg-black/5 px-2 py-1 rounded"
            >
              <Plus className="w-3 h-3" /> Add Experience
            </button>
          </div>
          {expSection?.items.map((item: any) => (
            <div key={item.id} className="p-3 border border-[#E2DACF] rounded-xl space-y-3 relative group bg-white/50">
              <button 
                type="button"
                onClick={() => updateDraft(d => {
                  const s = d.sections.find(sec => sec.type === 'experience') as any;
                  if (s) s.items = s.items.filter((i: any) => i.id !== item.id);
                })}
                aria-label="Delete"
                className="absolute top-2 right-2 p-1.5 text-red-600/60 hover:text-red-600 hover:bg-red-50 rounded-lg lg:opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                <div>
                  <label htmlFor={`exp-company-${item.id}`} className="text-[10px] text-[#6E6A62] block mb-1">Company</label>
                  <input id={`exp-company-${item.id}`} type="text" value={item.company} onChange={e => updateDraft(d => {
                    const s = d.sections.find(sec => sec.type === 'experience') as any;
                    const i = s.items.find((x: any) => x.id === item.id);
                    if (i) i.company = e.target.value;
                  })} className="w-full border border-[#E2DACF] rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-[#AAC06A]/60 outline-none" />
                </div>
                <div>
                  <label htmlFor={`role-${item.id}`} className="text-[10px] text-[#6E6A62] block mb-1">Role</label>
                  <input id={`role-${item.id}`} type="text" value={item.role} onChange={e => updateDraft(d => {
                    const s = d.sections.find(sec => sec.type === 'experience') as any;
                    const i = s.items.find((x: any) => x.id === item.id);
                    if (i) i.role = e.target.value;
                  })} className="w-full border border-[#E2DACF] rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-[#AAC06A]/60 outline-none" />
                </div>
                <div className="flex gap-2 sm:col-span-2">
                  <div className="flex-1">
                    <label htmlFor={`start-${item.id}`} className="text-[10px] text-[#6E6A62] block mb-1">Start Date</label>
                    <input id={`start-${item.id}`} type="text" value={item.startDate} onChange={e => updateDraft(d => {
                      const s = d.sections.find(sec => sec.type === 'experience') as any;
                      const i = s.items.find((x: any) => x.id === item.id);
                      if (i) i.startDate = e.target.value;
                    })} className="w-full border border-[#E2DACF] rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-[#AAC06A]/60 outline-none" />
                  </div>
                  <div className="flex-1">
                    <label htmlFor={`end-${item.id}`} className="text-[10px] text-[#6E6A62] block mb-1">End Date</label>
                    <input id={`end-${item.id}`} type="text" value={item.endDate} onChange={e => updateDraft(d => {
                      const s = d.sections.find(sec => sec.type === 'experience') as any;
                      const i = s.items.find((x: any) => x.id === item.id);
                      if (i) i.endDate = e.target.value;
                    })} className="w-full border border-[#E2DACF] rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-[#AAC06A]/60 outline-none" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {item.bullets.map((b: any) => (
                  <div key={b.id} className="flex gap-2">
                    <span className="text-[#6E6A62] mt-1 shrink-0">•</span>
                    <textarea 
                      value={b.text}
                      onChange={e => updateDraft(d => {
                        const s = d.sections.find(sec => sec.type === 'experience') as any;
                        const i = s.items.find((x: any) => x.id === item.id);
                        const bullet = i?.bullets.find((x: any) => x.id === b.id);
                        if (bullet) bullet.text = e.target.value;
                      })}
                      className="flex-1 min-h-[36px] bg-transparent border border-[#E2DACF] rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-[#AAC06A]/60 outline-none resize-none"
                    />
                    <button 
                      type="button" 

                      onClick={() => updateDraft(d => {
                        const s = d.sections.find(sec => sec.type === 'experience') as any;
                        const i = s.items.find((x: any) => x.id === item.id);
                        if (i) i.bullets = i.bullets.filter((x: any) => x.id !== b.id);
                      })}

                      className="p-1.5 h-[32px] shrink-0 text-red-600/60 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => updateDraft(d => {
                    const s = d.sections.find(sec => sec.type === 'experience') as any;
                    const i = s.items.find((x: any) => x.id === item.id);
                    if (i) i.bullets.push({ id: generateId(), text: '' });
                  })}
                  className="text-[11px] font-medium text-[#6E6A62] hover:text-[#1F1F1B] flex items-center gap-1 mt-1 pl-4"
                >
                  <Plus className="w-3 h-3" /> Add Bullet
                </button>
              </div>
            </div>
          ))}
          {(!expSection || expSection.items.length === 0) && <p className="text-xs text-[#6E6A62] italic">No experience recognized.</p>}
        </section>

        {/* Projects */}
        <section className="space-y-3 pt-4 border-t border-[#E2DACF]/40">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#1F1F1B]">Projects</h3>
            <button
              type="button"
              onClick={() => updateDraft(d => {
                let sec = d.sections.find(s => s.type === 'projects');
                if (!sec) {
                  sec = { id: generateId(), type: 'projects', title: 'Projects', items: [] };
                  d.sections.push(sec);
                }
                (sec as any).items.push({ id: generateId(), name: '', role: '', startDate: '', endDate: '', bullets: [] });
              })}
              className="text-[11px] font-medium text-[#1F1F1B] flex items-center gap-1 hover:bg-black/5 px-2 py-1 rounded"
            >
              <Plus className="w-3 h-3" /> Add Project
            </button>
          </div>
          {projSection?.items.map((item: any) => (
            <div key={item.id} className="p-3 border border-[#E2DACF] rounded-xl space-y-3 relative group bg-white/50">
              <button 
                type="button"
                onClick={() => updateDraft(d => {
                  const s = d.sections.find(sec => sec.type === 'projects') as any;
                  if (s) s.items = s.items.filter((i: any) => i.id !== item.id);
                })}
                aria-label="Delete"
                className="absolute top-2 right-2 p-1.5 text-red-600/60 hover:text-red-600 hover:bg-red-50 rounded-lg lg:opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                <div>
                  <label htmlFor={`proj-name-${item.id}`} className="text-[10px] text-[#6E6A62] block mb-1">Project Name</label>
                  <input id={`proj-name-${item.id}`} type="text" value={item.name} onChange={e => updateDraft(d => {
                    const s = d.sections.find(sec => sec.type === 'projects') as any;
                    const i = s.items.find((x: any) => x.id === item.id);
                    if (i) i.name = e.target.value;
                  })} className="w-full border border-[#E2DACF] rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-[#AAC06A]/60 outline-none" />
                </div>
                <div>
                  <label htmlFor={`role-${item.id}`} className="text-[10px] text-[#6E6A62] block mb-1">Role</label>
                  <input id={`role-${item.id}`} type="text" value={item.role} onChange={e => updateDraft(d => {
                    const s = d.sections.find(sec => sec.type === 'projects') as any;
                    const i = s.items.find((x: any) => x.id === item.id);
                    if (i) i.role = e.target.value;
                  })} className="w-full border border-[#E2DACF] rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-[#AAC06A]/60 outline-none" />
                </div>
                <div className="flex gap-2 sm:col-span-2">
                  <div className="flex-1">
                    <label htmlFor={`start-${item.id}`} className="text-[10px] text-[#6E6A62] block mb-1">Start Date</label>
                    <input id={`start-${item.id}`} type="text" value={item.startDate} onChange={e => updateDraft(d => {
                      const s = d.sections.find(sec => sec.type === 'projects') as any;
                      const i = s.items.find((x: any) => x.id === item.id);
                      if (i) i.startDate = e.target.value;
                    })} className="w-full border border-[#E2DACF] rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-[#AAC06A]/60 outline-none" />
                  </div>
                  <div className="flex-1">
                    <label htmlFor={`end-${item.id}`} className="text-[10px] text-[#6E6A62] block mb-1">End Date</label>
                    <input id={`end-${item.id}`} type="text" value={item.endDate} onChange={e => updateDraft(d => {
                      const s = d.sections.find(sec => sec.type === 'projects') as any;
                      const i = s.items.find((x: any) => x.id === item.id);
                      if (i) i.endDate = e.target.value;
                    })} className="w-full border border-[#E2DACF] rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-[#AAC06A]/60 outline-none" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {item.bullets.map((b: any) => (
                  <div key={b.id} className="flex gap-2">
                    <span className="text-[#6E6A62] mt-1 shrink-0">•</span>
                    <textarea 
                      value={b.text}
                      onChange={e => updateDraft(d => {
                        const s = d.sections.find(sec => sec.type === 'projects') as any;
                        const i = s.items.find((x: any) => x.id === item.id);
                        const bullet = i?.bullets.find((x: any) => x.id === b.id);
                        if (bullet) bullet.text = e.target.value;
                      })}
                      className="flex-1 min-h-[36px] bg-transparent border border-[#E2DACF] rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-[#AAC06A]/60 outline-none resize-none"
                    />
                    <button 
                      type="button" 

                      onClick={() => updateDraft(d => {
                        const s = d.sections.find(sec => sec.type === 'projects') as any;
                        const i = s.items.find((x: any) => x.id === item.id);
                        if (i) i.bullets = i.bullets.filter((x: any) => x.id !== b.id);
                      })}

                      className="p-1.5 h-[32px] shrink-0 text-red-600/60 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => updateDraft(d => {
                    const s = d.sections.find(sec => sec.type === 'projects') as any;
                    const i = s.items.find((x: any) => x.id === item.id);
                    if (i) i.bullets.push({ id: generateId(), text: '' });
                  })}
                  className="text-[11px] font-medium text-[#6E6A62] hover:text-[#1F1F1B] flex items-center gap-1 mt-1 pl-4"
                >
                  <Plus className="w-3 h-3" /> Add Bullet
                </button>
              </div>
            </div>
          ))}
          {(!projSection || projSection.items.length === 0) && <p className="text-xs text-[#6E6A62] italic">No projects recognized.</p>}
        </section>

        {/* Unrecognized Text */}
        {draft.unrecognizedLines.length > 0 && (
          <section className="space-y-3 pt-4 border-t border-[#E2DACF]/40 pb-6">
            <h3 className="text-sm font-semibold text-[#1F1F1B]">Unrecognized text</h3>
            <p className="text-[11px] text-[#6E6A62]">These lines were not added automatically. Review them before creating the resume.</p>
            <div className="bg-[#EFE7D9]/30 rounded-xl p-3 border border-[#E2DACF] max-h-40 overflow-y-auto">
              {draft.unrecognizedLines.map((line, idx) => (
                <p key={idx} className="text-[11px] text-[#1F1F1B] leading-relaxed break-words">{line}</p>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="p-4 sm:p-5 border-t border-[#E2DACF]/60 flex justify-between gap-3 shrink-0 bg-[#FFFEFA] sm:rounded-b-2xl">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-lg text-xs font-medium text-[#1F1F1B] hover:bg-black/5 transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          disabled={!isValidToConfirm || !draft.name.trim()}
          onClick={onConfirm}
          className="px-4 py-2 rounded-lg text-xs font-medium text-[#1F1F1B] bg-[#D9DFAD] hover:bg-[#C9D19D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Create resume
        </button>
      </div>
    </>
  );
};

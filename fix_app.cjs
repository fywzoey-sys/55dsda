const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  "import { isValidResumeRecord } from './utils/validation';",
  "import { isValidResumeRecord, isValidResumeArray, isResume } from './utils/validation';"
);

content = content.replace(
  /const STORAGE_KEY = 'resume-space:resumes:v1';\nconst AUTOSAVE_DEBOUNCE_MS = 600;\n\nfunction loadInitialResumes\(\): Record<string, Resume> \{[\s\S]*?\}\n/,
  `const STORAGE_KEY_V2 = 'resume-space:data:v2';
const STORAGE_KEY_V1 = 'resume-space:resumes:v1';
const AUTOSAVE_DEBOUNCE_MS = 600;

function loadStorage(): { resumes: Resume[]; activeResumeId: string } {
  try {
    const storedV2 = localStorage.getItem(STORAGE_KEY_V2);
    if (storedV2) {
      const parsed = JSON.parse(storedV2);
      if (parsed && Array.isArray(parsed.resumes) && typeof parsed.activeResumeId === 'string') {
        if (isValidResumeArray(parsed.resumes)) {
          return { resumes: parsed.resumes, activeResumeId: parsed.activeResumeId };
        }
      }
    }

    const storedV1 = localStorage.getItem(STORAGE_KEY_V1);
    if (storedV1) {
      const parsed = JSON.parse(storedV1);
      if (isValidResumeRecord(parsed)) {
        const arr = Object.values(parsed);
        if (arr.length > 0) {
          return { resumes: arr, activeResumeId: arr[0].id };
        }
      } else if (isResume(parsed)) {
        return { resumes: [parsed], activeResumeId: parsed.id };
      }
    }
  } catch (err) {
    console.warn('Failed to parse resumes from LocalStorage, falling back to mock data:', err);
  }

  const mockArr = Object.values(mockResumes);
  return {
    resumes: JSON.parse(JSON.stringify(mockArr)),
    activeResumeId: mockArr[0].id
  };
}
`
);

content = content.replace(
  /const \[resumes, setResumes\] = useState<Record<string, Resume>>\(loadInitialResumes\);\n  const \[currentResumeId, setCurrentResumeId\] = useState<string>\('pm-resume'\);/,
  `const initialData = useRef(loadStorage());
  const [resumes, setResumes] = useState<Resume[]>(initialData.current.resumes);
  const [currentResumeId, setCurrentResumeId] = useState<string>(initialData.current.activeResumeId);`
);

content = content.replace(
  /const latestResumesRef = useRef<Record<string, Resume>>\(resumes\);\n\n  \/\/ Keep latestResumesRef always up to date\n  useEffect\(\(\) => \{\n    latestResumesRef\.current = resumes;\n  \}, \[resumes\]\);/,
  `const latestDataRef = useRef({ resumes, activeResumeId: currentResumeId });

  useEffect(() => {
    latestDataRef.current = { resumes, activeResumeId: currentResumeId };
  }, [resumes, currentResumeId]);`
);

content = content.replace(
  /localStorage\.setItem\(STORAGE_KEY, JSON\.stringify\(latestResumesRef\.current\)\);/,
  `localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(latestDataRef.current));`
);

content = content.replace(
  /localStorage\.setItem\(STORAGE_KEY, JSON\.stringify\(resumes\)\);/,
  `localStorage.setItem(STORAGE_KEY_V2, JSON.stringify({ resumes, activeResumeId: currentResumeId }));`
);

content = content.replace(
  /}, \[resumes\]\);/,
  `}, [resumes, currentResumeId]);`
);

content = content.replace(
  /const resumesList = \[\s*\{ id: 'pm-resume', name: resumes\['pm-resume'\]\?\.name \|\| 'PM Resume' \},\s*\{ id: 'growth-resume', name: resumes\['growth-resume'\]\?\.name \|\| 'Growth Resume' \},\s*\{ id: 'consulting-resume', name: resumes\['consulting-resume'\]\?\.name \|\| 'Consulting Resume' \},\s*\];/,
  `const resumesList = resumes.map(r => ({ id: r.id, name: r.name || 'Untitled Resume' }));`
);

content = content.replace(
  /const currentResume = resumes\[currentResumeId\] \|\| resumes\['pm-resume'\] \|\| mockResumes\['pm-resume'\];/,
  `const currentResume = resumes.find(r => r.id === currentResumeId) || resumes[0];`
);

content = content.replace(
  /const handleUpdateResume = useCallback\(\(updatedResume: Resume\) => \{\n    setResumes\(\(prev\) => \(\{\n      \.\.\.prev,\n      \[updatedResume\.id\]: \{\n        \.\.\.updatedResume,\n        updatedAt: new Date\(\)\.toISOString\(\),\n      \},\n    \}\)\);\n  \}, \[\]\);/,
  `const handleUpdateResume = useCallback((updatedResume: Resume) => {
    setResumes((prev) => prev.map(r => r.id === updatedResume.id ? { ...updatedResume, updatedAt: new Date().toISOString() } : r));
  }, []);

  const handleCreateResume = useCallback(() => {
    const newId = \`resume-\${Date.now()}\`;
    const newResume: Resume = {
      id: newId,
      name: 'Untitled Resume',
      template: 'Classic',
      jd: '',
      fullName: '',
      title: '',
      contact: { email: '', phone: '', location: '', linkedin: '' },
      sections: [
        { id: 'sec-edu', type: 'education', title: 'Education', items: [] },
        { id: 'sec-exp', type: 'experience', title: 'Experience', items: [] },
        { id: 'sec-proj', type: 'projects', title: 'Projects', items: [] },
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
  }, [currentResumeId]);`
);

content = content.replace(
  /resumes=\{resumesList\}\s*\/>/,
  `resumes={resumesList}
            onCreateResume={handleCreateResume}
            onRenameResume={handleRenameResume}
            onDeleteResume={handleDeleteResume}
          />`
);

fs.writeFileSync('src/App.tsx', content);

import { ParsedResumeDraft, EducationSection, ExperienceSection, ProjectSection, Education, Experience, Project } from '../types';
import { generateId } from './id';

export function parseResumeText(text: string): ParsedResumeDraft {
  const draft: ParsedResumeDraft = {
    name: 'Imported Resume',
    fullName: '',
    title: '',
    contact: { email: '', phone: '', location: '', linkedin: '' },
    sections: [],
    unrecognizedLines: [],
    warnings: []
  };

  const eduSection: EducationSection = { id: generateId('import'), type: 'education', title: 'Education', items: [] };
  const expSection: ExperienceSection = { id: generateId('import'), type: 'experience', title: 'Experience', items: [] };
  const projSection: ProjectSection = { id: generateId('import'), type: 'projects', title: 'Projects', items: [] };

  const isEduHeader = (l: string) => /^(教育经历|教育背景|教育|Education|Education Background):?$/i.test(l.trim());
  const isExpHeader = (l: string) => /^(实习经历|工作经历|实践经历|经历|Experience|Work Experience|Internship Experience|Professional Experience):?$/i.test(l.trim());
  const isProjHeader = (l: string) => /^(项目经历|项目经验|项目|Projects|Project Experience):?$/i.test(l.trim());

  const isBullet = (l: string) => /^([-–—•·*]\s*|(?:\d+[\.)])\s+|(?:（\d+）|\(\d+\))\s*)(.*)/.exec(l.trim());

  const parseDateRange = (str: string) => {
    const match = str.match(/^(.*?)(?:\s+-\s+|\s*(?:–|—|至|to)\s*)(.*)$/i);
    if (match && match[2]) {
      return { start: match[1].trim(), end: match[2].trim() };
    }
    return { start: str.trim(), end: '' };
  };

  const isDateLike = (str: string) => {
    return /\b(19|20)\d{2}\b/.test(str) || /至今|present/i.test(str);
  };

  // Normalize line endings to \n, split by \n to preserve empty lines
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

  let currentSection = 'header';
  let headerLines: string[] = [];

  let currentItemLines: string[] = [];
  let currentItemBullets: { text: string }[] = [];

  const flushItem = () => {
    if (currentItemLines.length === 0 && currentItemBullets.length === 0) return;

    if (currentSection === 'education') {
      const item: Education = { id: generateId('import'), school: '', degree: '', startDate: '', endDate: '' };
      let nonConsumedLines: string[] = [];
      let consumedCount = 0;

      for (let i = 0; i < currentItemLines.length; i++) {
        const line = currentItemLines[i];
        if (consumedCount === 0 && !isDateLike(line)) {
          item.school = line;
          consumedCount++;
        } else if (consumedCount === 1 && !isDateLike(line) && !item.degree) {
          item.degree = line;
          consumedCount++;
        } else if (isDateLike(line) && !item.startDate) {
          const { start, end } = parseDateRange(line);
          item.startDate = start;
          item.endDate = end;
          consumedCount++;
        } else {
          nonConsumedLines.push(line);
        }
      }

      if (!item.school) {
        draft.warnings.push({ id: generateId('import'), message: 'Education is missing School name', sourceLine: currentItemLines[0] || 'Unknown' });
      }
      draft.unrecognizedLines.push(...nonConsumedLines);
      // bullets in education? just unrecognized
      draft.unrecognizedLines.push(...currentItemBullets.map(b => b.text));

      eduSection.items.push(item);

    } else if (currentSection === 'experience') {
      const item: Experience = { id: generateId('import'), company: '', role: '', startDate: '', endDate: '', bullets: [] };
      let nonConsumedLines: string[] = [];
      let consumedCount = 0;

      for (let i = 0; i < currentItemLines.length; i++) {
        const line = currentItemLines[i];
        if (consumedCount === 0 && !isDateLike(line)) {
          item.company = line;
          consumedCount++;
        } else if (consumedCount === 1 && !isDateLike(line) && !item.role) {
          item.role = line;
          consumedCount++;
        } else if (isDateLike(line) && !item.startDate) {
          const { start, end } = parseDateRange(line);
          item.startDate = start;
          item.endDate = end;
          consumedCount++;
        } else {
          nonConsumedLines.push(line);
        }
      }

      item.bullets = currentItemBullets.map(b => ({ id: generateId('import'), text: b.text }));
      draft.unrecognizedLines.push(...nonConsumedLines);

      if (!item.company) {
        draft.warnings.push({ id: generateId('import'), message: 'Experience is missing Company', sourceLine: currentItemLines[0] || 'Unknown' });
      }
      expSection.items.push(item);

    } else if (currentSection === 'projects') {
      const item: Project = { id: generateId('import'), name: '', role: '', startDate: '', endDate: '', bullets: [] };
      let nonConsumedLines: string[] = [];
      let consumedCount = 0;

      for (let i = 0; i < currentItemLines.length; i++) {
        const line = currentItemLines[i];
        if (consumedCount === 0 && !isDateLike(line)) {
          item.name = line;
          consumedCount++;
        } else if (consumedCount === 1 && !isDateLike(line) && !item.role) {
          item.role = line;
          consumedCount++;
        } else if (isDateLike(line) && !item.startDate) {
          const { start, end } = parseDateRange(line);
          item.startDate = start;
          item.endDate = end;
          consumedCount++;
        } else {
          nonConsumedLines.push(line);
        }
      }

      item.bullets = currentItemBullets.map(b => ({ id: generateId('import'), text: b.text }));
      draft.unrecognizedLines.push(...nonConsumedLines);

      if (!item.name) {
        draft.warnings.push({ id: generateId('import'), message: 'Project is missing Name', sourceLine: currentItemLines[0] || 'Unknown' });
      }
      projSection.items.push(item);

    } else {
      // Unrecognized section lines (e.g. before first header)
      draft.unrecognizedLines.push(...currentItemLines);
      draft.unrecognizedLines.push(...currentItemBullets.map(b => b.text));
    }

    currentItemLines = [];
    currentItemBullets = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (line === '') {
      // A blank line inside a section flushes the current item
      if (currentItemLines.length > 0 || currentItemBullets.length > 0) {
        flushItem();
      }
      continue;
    }

    if (isEduHeader(line)) {
      flushItem();
      currentSection = 'education';
      continue;
    }
    if (isExpHeader(line)) {
      flushItem();
      currentSection = 'experience';
      continue;
    }
    if (isProjHeader(line)) {
      flushItem();
      currentSection = 'projects';
      continue;
    }

    if (currentSection === 'header') {
      headerLines.push(line);
    } else {
      const bulletMatch = isBullet(line);
      if (bulletMatch) {
        currentItemBullets.push({ text: bulletMatch[2].trim() });
      } else {
        // A non-bullet line following one or more bullets starts a new item.
        if (currentItemBullets.length > 0) {
          flushItem();
        }
        currentItemLines.push(line);
      }
    }
  }
  flushItem(); // flush last item

  // Process Header Lines
  if (headerLines.length > 0) {
    // Flatten header lines by separators (pipe, bullet, tab, multi-space)
    const flatHeaders = [];
    for (const h of headerLines) {
      const parts = h.split(/\s*[|｜·•\t]\s*|\s{4,}/).filter(Boolean);
      flatHeaders.push(...parts);
    }

    let nameFound = false;
    let titleFound = false;

    for (const p of flatHeaders) {
      if (p.includes('@')) {
        draft.contact.email = p;
      } else if (/linkedin\.com/i.test(p)) {
        draft.contact.linkedin = p;
      } else if (/[\d\-+\s()]{8,}/.test(p) && !isDateLike(p)) {
        draft.contact.phone = p;
      } else if (!nameFound && !p.includes('@') && p.length < 30) {
        draft.fullName = p;
        nameFound = true;
      } else if (!titleFound && !p.includes('@') && p.length < 50) {
        draft.title = p;
        titleFound = true;
      } else {
        if (p.length < 20 && !draft.contact.location && !p.includes('http')) {
          draft.contact.location = p;
        } else {
          draft.unrecognizedLines.push(p);
        }
      }
    }
  }

  if (!draft.fullName) {
    draft.warnings.push({ id: generateId('import'), message: 'Unrecognized Full Name' });
  }
  if (draft.unrecognizedLines.length > 0) {
    draft.warnings.push({ id: generateId('import'), message: 'Some lines were not recognized and skipped.' });
  }

  if (eduSection.items.length > 0) draft.sections.push(eduSection);
  if (expSection.items.length > 0) draft.sections.push(expSection);
  if (projSection.items.length > 0) draft.sections.push(projSection);

  if (draft.sections.length === 0) {
    draft.warnings.push({ id: generateId('import'), message: 'No valid sections (Education, Experience, Projects) found.' });
  }

  return draft;
}

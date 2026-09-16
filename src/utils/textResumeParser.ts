import { ParsedResumeDraft, EducationSection, ExperienceSection, ProjectSection, Education, Experience, Project } from '../types';
import { generateId } from './id';

export function parseResumeText(text: string): ParsedResumeDraft {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  const draft: ParsedResumeDraft = {
    name: 'Imported Resume',
    fullName: '',
    title: '',
    contact: { email: '', phone: '', location: '', linkedin: '' },
    sections: [],
    warnings: [],
    unrecognizedLines: []
  };

  if (lines.length === 0) {
    draft.warnings.push({ id: generateId('import'), message: 'Pasted text is empty.' });
    return draft;
  }

  let currentSection: 'header' | 'education' | 'experience' | 'projects' = 'header';
  
  const eduSection: EducationSection = { id: generateId('import'), type: 'education', title: 'Education', items: [] };
  const expSection: ExperienceSection = { id: generateId('import'), type: 'experience', title: 'Experience', items: [] };
  const projSection: ProjectSection = { id: generateId('import'), type: 'projects', title: 'Projects', items: [] };

  const isEduHeader = (l: string) => /^(教育经历|教育背景|教育|Education|Education Background):?$/i.test(l);
  const isExpHeader = (l: string) => /^(实习经历|工作经历|实践经历|经历|Experience|Work Experience|Internship Experience|Professional Experience):?$/i.test(l);
  const isProjHeader = (l: string) => /^(项目经历|项目经验|项目|Projects|Project Experience):?$/i.test(l);
  const isBullet = (l: string) => /^(\-|\–|\—|\•|\·|\*|1\.|1\)|（1）)\s*(.*)/.exec(l);

  const splitDates = (str: string) => {
    const match = str.match(/(.*?)(?:\s*(?:-|–|—|至|to)\s*)(.*)/i);
    if (match) {
      return { start: match[1].trim(), end: match[2].trim() };
    }
    return { start: str, end: '' };
  };

  const isDateLike = (str: string) => {
    return /\b(19|20)\d{2}\b/.test(str) || /至今|present/i.test(str);
  };

  let headerLines = [];
  let currentItemLines: string[] = [];

  const processEduItem = (itemLines: string[]) => {
    if (itemLines.length === 0) return;
    const item: Education = { id: generateId('import'), school: '', degree: '', startDate: '', endDate: '' };
    item.school = itemLines[0];
    if (itemLines.length > 1) item.degree = itemLines[1];
    
    // Check for date in first 3 lines
    for (let i = 0; i < Math.min(3, itemLines.length); i++) {
      if (isDateLike(itemLines[i])) {
        const { start, end } = splitDates(itemLines[i]);
        item.startDate = start;
        item.endDate = end;
        if (i === 1) item.degree = itemLines.length > 2 ? itemLines[2] : '';
        break;
      }
    }
    if (!item.school) draft.warnings.push({ id: generateId('import'), message: 'Education is missing School name', sourceLine: itemLines.join(' | ') });
    eduSection.items.push(item);
  };

  const processExpItem = (itemLines: string[]) => {
    if (itemLines.length === 0) return;
    const item: Experience = { id: generateId('import'), company: '', role: '', startDate: '', endDate: '', bullets: [] };
    
    // Basic heuristics: first line company, second role. Look for date.
    let nonBulletLines = [];
    for (const l of itemLines) {
      const bulletMatch = isBullet(l);
      if (bulletMatch) {
        item.bullets.push({ id: generateId('import'), text: bulletMatch[2].trim() || l.replace(/^[-–—•·*1.)（）\s]+/, '').trim() });
      } else {
        nonBulletLines.push(l);
      }
    }

    if (nonBulletLines.length > 0) item.company = nonBulletLines[0];
    if (nonBulletLines.length > 1) item.role = nonBulletLines[1];

    for (let i = 0; i < nonBulletLines.length; i++) {
      if (isDateLike(nonBulletLines[i])) {
        const { start, end } = splitDates(nonBulletLines[i]);
        item.startDate = start;
        item.endDate = end;
        if (i === 1) item.role = nonBulletLines.length > 2 ? nonBulletLines[2] : '';
        break;
      }
    }
    
    if (!item.company) draft.warnings.push({ id: generateId('import'), message: 'Experience is missing Company', sourceLine: itemLines[0] });
    if (!item.role) draft.warnings.push({ id: generateId('import'), message: 'Experience is missing Role', sourceLine: itemLines[0] });
    
    expSection.items.push(item);
  };

  const processProjItem = (itemLines: string[]) => {
    if (itemLines.length === 0) return;
    const item: Project = { id: generateId('import'), name: '', role: '', startDate: '', endDate: '', bullets: [] };
    
    let nonBulletLines = [];
    for (const l of itemLines) {
      const bulletMatch = isBullet(l);
      if (bulletMatch) {
        item.bullets.push({ id: generateId('import'), text: bulletMatch[2].trim() || l.replace(/^[-–—•·*1.)（）\s]+/, '').trim() });
      } else {
        nonBulletLines.push(l);
      }
    }

    if (nonBulletLines.length > 0) item.name = nonBulletLines[0];
    if (nonBulletLines.length > 1) item.role = nonBulletLines[1];

    for (let i = 0; i < nonBulletLines.length; i++) {
      if (isDateLike(nonBulletLines[i])) {
        const { start, end } = splitDates(nonBulletLines[i]);
        item.startDate = start;
        item.endDate = end;
        if (i === 1) item.role = nonBulletLines.length > 2 ? nonBulletLines[2] : '';
        break;
      }
    }
    
    if (!item.name) draft.warnings.push({ id: generateId('import'), message: 'Project is missing Name', sourceLine: itemLines[0] });
    
    projSection.items.push(item);
  };

  const flushItem = () => {
    if (currentItemLines.length > 0) {
      if (currentSection === 'education') processEduItem(currentItemLines);
      else if (currentSection === 'experience') processExpItem(currentItemLines);
      else if (currentSection === 'projects') processProjItem(currentItemLines);
      else {
        // Unrecognized lines in header that aren't contact info
        draft.unrecognizedLines.push(...currentItemLines);
      }
      currentItemLines = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

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
      // If it's a new item block. Heuristic: if it's not a bullet and doesn't look like a continuation, 
      // and we already have some lines (like company, role, date), maybe it's a new item.
      // A simpler heuristic: empty lines separate items. But we stripped empty lines.
      // So let's rely on bullet or non-bullet. If it's a non-bullet and we already have bullets in currentItemLines, it's a new item.
      if (!isBullet(line) && currentItemLines.some(l => isBullet(l))) {
        flushItem();
      }
      // Or if we already have non-bullet lines and this is another non-bullet that could be a new company name (no easy way to know).
      // Let's just group until we see a bullet, then the next non-bullet starts a new item.
      
      // We will parse split components if separated by | or ·
      const splitByPipe = line.split(/\s*[|｜·•\t]\s*|\s{4,}/).filter(Boolean);
      if (!isBullet(line) && splitByPipe.length > 1) {
        currentItemLines.push(...splitByPipe);
      } else {
        currentItemLines.push(line);
      }
    }
  }
  flushItem(); // flush last item

  // Process Header Lines
  if (headerLines.length > 0) {
    // Flatten header lines by separators
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
        // Maybe location or unrecognized
        if (p.length < 20 && !draft.contact.location && !p.includes('http')) {
          draft.contact.location = p;
        } else {
          draft.unrecognizedLines.push(p);
        }
      }
    }
  }

  if (!draft.fullName) draft.warnings.push({ id: generateId('import'), message: 'Unrecognized Full Name' });
  if (draft.unrecognizedLines.length > 0) draft.warnings.push({ id: generateId('import'), message: 'Some lines were not recognized and skipped.' });

  if (eduSection.items.length > 0) draft.sections.push(eduSection);
  if (expSection.items.length > 0) draft.sections.push(expSection);
  if (projSection.items.length > 0) draft.sections.push(projSection);

  if (draft.sections.length === 0) {
    draft.warnings.push({ id: generateId('import'), message: 'No valid sections (Education, Experience, Projects) found.' });
  }

  return draft;
}

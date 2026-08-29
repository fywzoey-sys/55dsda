import { Resume, Bullet, ContactInfo, Education, Experience, Project, ResumeSection, TemplateType, LibraryExperience } from '../types';

const VALID_TEMPLATES: TemplateType[] = ['Classic', 'Modern', 'Compact'];
const REQUIRED_RESUME_KEYS = ['pm-resume', 'growth-resume', 'consulting-resume'];

function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

function isString(val: unknown): val is string {
  return typeof val === 'string';
}

function isBullet(val: unknown): val is Bullet {
  if (!isObject(val)) return false;
  return isString(val.id) && val.id.trim() !== '' && isString(val.text);
}

export function isLibraryExperience(val: unknown): val is LibraryExperience {
  if (!isObject(val)) return false;
  if (
    !isString(val.id) ||
    val.id.trim() === '' ||
    !isString(val.company) ||
    !isString(val.role) ||
    !isString(val.startDate) ||
    !isString(val.endDate) ||
    !Array.isArray(val.bullets)
  ) {
    return false;
  }
  
  if (!val.bullets.every(isBullet)) {
    return false;
  }
  
  const bulletIds = new Set((val.bullets as Bullet[]).map(b => b.id));
  if (bulletIds.size !== val.bullets.length) {
    return false;
  }
  
  return true;
}

export function isValidLibraryArray(val: unknown): val is LibraryExperience[] {
  if (!Array.isArray(val)) return false;
  if (!val.every(isLibraryExperience)) return false;
  
  const expIds = new Set((val as LibraryExperience[]).map(e => e.id));
  return expIds.size === val.length;
}

function isContactInfo(val: unknown): val is ContactInfo {
  if (!isObject(val)) return false;
  return (
    isString(val.email) &&
    isString(val.phone) &&
    isString(val.location) &&
    isString(val.linkedin)
  );
}

function isEducation(val: unknown): val is Education {
  if (!isObject(val)) return false;
  return (
    isString(val.id) &&
    val.id.trim() !== '' &&
    isString(val.school) &&
    isString(val.degree) &&
    isString(val.startDate) &&
    isString(val.endDate)
  );
}

function isExperience(val: unknown): val is Experience {
  if (!isObject(val)) return false;
  if (
    !isString(val.id) ||
    val.id.trim() === '' ||
    !isString(val.company) ||
    !isString(val.role) ||
    !isString(val.startDate) ||
    !isString(val.endDate) ||
    !Array.isArray(val.bullets)
  ) {
    return false;
  }
  return val.bullets.every(isBullet);
}

function isProject(val: unknown): val is Project {
  if (!isObject(val)) return false;
  if (
    !isString(val.id) ||
    val.id.trim() === '' ||
    !isString(val.name) ||
    !isString(val.role) ||
    !Array.isArray(val.bullets)
  ) {
    return false;
  }
  if (val.startDate !== undefined && !isString(val.startDate)) return false;
  if (val.endDate !== undefined && !isString(val.endDate)) return false;
  return val.bullets.every(isBullet);
}

function isResumeSection(val: unknown): val is ResumeSection {
  if (!isObject(val)) return false;
  if (!isString(val.id) || val.id.trim() === '' || !isString(val.title) || !isString(val.type)) {
    return false;
  }

  if (val.type === 'education') {
    return Array.isArray(val.items) && val.items.every(isEducation);
  }
  if (val.type === 'experience') {
    return Array.isArray(val.items) && val.items.every(isExperience);
  }
  if (val.type === 'projects') {
    return Array.isArray(val.items) && val.items.every(isProject);
  }
  return false;
}

export function isResume(val: unknown): val is Resume {
  if (!isObject(val)) return false;
  if (
    !isString(val.id) ||
    val.id.trim() === '' ||
    !isString(val.name) ||
    !VALID_TEMPLATES.includes(val.template as TemplateType) ||
    !isString(val.jd) ||
    !isString(val.fullName) ||
    !isString(val.title) ||
    !isContactInfo(val.contact) ||
    !Array.isArray(val.sections) ||
    !isString(val.createdAt) ||
    !isString(val.updatedAt)
  ) {
    return false;
  }

  return val.sections.every(isResumeSection);
}

export function isValidResumeArray(val: unknown): val is Resume[] {
  return (
    Array.isArray(val) &&
    val.length > 0 &&
    val.every(isResume)
  );
}

export function isValidResumeRecord(val: unknown): val is Record<string, Resume> {
  if (!isObject(val)) return false;

  for (const key of REQUIRED_RESUME_KEYS) {
    if (!val[key] || !isResume(val[key])) {
      return false;
    }
  }

  return true;
}

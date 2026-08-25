export type TemplateType = 'Classic' | 'Modern' | 'Compact';

export type RightTabType = 'Job Description' | 'Library';

export interface Bullet {
  id: string;
  text: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  location: string;
  linkedin: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  bullets: Bullet[];
}

export interface Project {
  id: string;
  name: string;
  role: string;
  startDate?: string;
  endDate?: string;
  bullets: Bullet[];
}

export interface EducationSection {
  id: string;
  type: 'education';
  title: string;
  items: Education[];
}

export interface ExperienceSection {
  id: string;
  type: 'experience';
  title: string;
  items: Experience[];
}

export interface ProjectSection {
  id: string;
  type: 'projects';
  title: string;
  items: Project[];
}

export type ResumeSection =
  | EducationSection
  | ExperienceSection
  | ProjectSection;

export interface Resume {
  id: string;
  name: string;
  template: TemplateType;
  jd: string;
  fullName: string;
  title: string;
  contact: ContactInfo;
  sections: ResumeSection[];
  createdAt: string;
  updatedAt: string;
}

export interface LibraryExperience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  bullets: Bullet[];
}

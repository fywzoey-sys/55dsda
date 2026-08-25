export type TemplateType = 'Classic' | 'Modern' | 'Compact';

export type RightTabType = 'Job Description' | 'Library';

export interface BulletPoint {
  id: string;
  text: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  period: string;
  bullets: BulletPoint[];
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  period: string;
}

export interface Project {
  id: string;
  name: string;
  role: string;
  description: string;
}

export interface ResumeData {
  id: string;
  name: string;
  fullName: string;
  title: string;
  contact: {
    email: string;
    phone: string;
    location: string;
    linkedin: string;
  };
  education: Education[];
  experience: Experience[];
  projects: Project[];
}

import { ResumeData } from '../types';

export const mockResumes: Record<string, ResumeData> = {
  'pm-resume': {
    id: 'pm-resume',
    name: 'PM Resume',
    fullName: 'Alex Chen',
    title: 'Product Management Intern',
    contact: {
      email: 'alex.chen@berkeley.edu',
      phone: '+1 (510) 555-0192',
      location: 'Berkeley, CA',
      linkedin: 'linkedin.com/in/alexchen-pm',
    },
    education: [
      {
        id: 'edu-1',
        school: 'University of California, Berkeley',
        degree: 'B.A. Economics · Data Science Minor',
        period: '2023–2027',
      },
    ],
    experience: [
      {
        id: 'exp-1',
        company: 'ByteDance',
        role: 'Product Intern',
        period: 'Jun 2025 – Aug 2025',
        bullets: [
          'Conducted user interviews and synthesized onboarding pain points to drive retention improvements.',
          'Built a weekly product performance dashboard tracking key engagement metrics across 2M+ active users.',
          'Partnered with design and engineering to refine feature requirements and streamline sprint delivery.',
        ],
      },
      {
        id: 'exp-2',
        company: 'Campus Startup',
        role: 'Growth Intern',
        period: 'Jan 2025 – May 2025',
        bullets: [
          'Analyzed acquisition channels and campaign performance to optimize conversion funnels.',
          'Created competitor research reports and market sizing models for strategic growth planning.',
        ],
      },
    ],
    projects: [
      {
        id: 'proj-1',
        name: 'AI Resume Workspace',
        role: 'Product Project',
        description: 'Designed a block-based workflow for restructuring resumes across internship applications.',
      },
    ],
  },
  'growth-resume': {
    id: 'growth-resume',
    name: 'Growth Resume',
    fullName: 'Alex Chen',
    title: 'Growth & Analytics Intern',
    contact: {
      email: 'alex.chen@berkeley.edu',
      phone: '+1 (510) 555-0192',
      location: 'Berkeley, CA',
      linkedin: 'linkedin.com/in/alexchen-pm',
    },
    education: [
      {
        id: 'edu-1',
        school: 'University of California, Berkeley',
        degree: 'B.A. Economics · Data Science Minor',
        period: '2023–2027',
      },
    ],
    experience: [
      {
        id: 'exp-2',
        company: 'Campus Startup',
        role: 'Growth Intern',
        period: 'Jan 2025 – May 2025',
        bullets: [
          'Optimized referral funnel resulting in a 18% increase in viral user acquisition.',
          'Analyzed acquisition channels and campaign performance across paid and organic social.',
          'Created competitor research and cohort retention tracking for quarterly growth planning.',
        ],
      },
      {
        id: 'exp-1',
        company: 'ByteDance',
        role: 'Product Intern',
        period: 'Jun 2025 – Aug 2025',
        bullets: [
          'Built a weekly product performance dashboard tracking retention cohorts.',
          'Conducted user interviews to identify onboarding drop-off bottlenecks.',
        ],
      },
    ],
    projects: [
      {
        id: 'proj-1',
        name: 'Viral Loop Simulator',
        role: 'Analytics Project',
        description: 'Built a predictive growth model simulating user invite loops and CAC/LTV ratios.',
      },
    ],
  },
  'consulting-resume': {
    id: 'consulting-resume',
    name: 'Consulting Resume',
    fullName: 'Alex Chen',
    title: 'Strategy & Operations Associate',
    contact: {
      email: 'alex.chen@berkeley.edu',
      phone: '+1 (510) 555-0192',
      location: 'Berkeley, CA',
      linkedin: 'linkedin.com/in/alexchen-pm',
    },
    education: [
      {
        id: 'edu-1',
        school: 'University of California, Berkeley',
        degree: 'B.A. Economics · Data Science Minor',
        period: '2023–2027',
      },
    ],
    experience: [
      {
        id: 'exp-3',
        company: 'Berkeley Business Consulting',
        role: 'Student Consultant',
        period: 'Sep 2024 – Dec 2024',
        bullets: [
          'Delivered market entry strategy for a fintech client, resulting in 3 actionable expansion vectors.',
          'Performed financial modeling and cost-benefit analysis for operational restructuring.',
          'Presented strategic recommendations to executive stakeholders and senior partners.',
        ],
      },
      {
        id: 'exp-1',
        company: 'ByteDance',
        role: 'Product Intern',
        period: 'Jun 2025 – Aug 2025',
        bullets: [
          'Synthesized cross-functional operational metrics into executive review decks.',
          'Partnered with design and engineering to refine requirements and workflows.',
        ],
      },
    ],
    projects: [
      {
        id: 'proj-2',
        name: 'FinTech Market Analysis',
        role: 'Lead Researcher',
        description: 'Authored a 40-page market assessment report on digital banking trends in Southeast Asia.',
      },
    ],
  },
};

export const mockJD = `TikTok - Product Intern (Global Product Solutions)

About the Role:
We are looking for a driven Product Intern to join our Global Product Solutions team for Summer 2026. In this role, you will collaborate with cross-functional teams including product managers, software engineers, and data scientists to build next-generation creator tools.

Responsibilities:
- Support product lifecycle from ideation to launch, writing PRDs and defining success metrics.
- Analyze user feedback, quantitative behavioral data, and conduct user research interviews.
- Create performance dashboards and monitor core engagement KPIs.
- Coordinate with design and engineering leads to unblock development dependencies.

Qualifications:
- Currently enrolled in a Bachelor's or Master's degree program in Economics, Computer Science, Data Science, or related fields.
- Strong analytical skills, proficiency in SQL/Python or data visualization tools (Tableau, Looker).
- Excellent communication and cross-functional collaboration capabilities.
- Previous internship experience in tech, product management, or consulting is a strong plus.`;

export const libraryItems = [
  {
    company: 'ByteDance',
    role: 'Product Intern',
    bulletsCount: 5,
    bullets: [
      'Conducted user interviews and synthesized onboarding pain points to drive retention improvements.',
      'Built a weekly product performance dashboard tracking key engagement metrics across 2M+ active users.',
      'Partnered with design and engineering to refine feature requirements and streamline sprint delivery.',
      'Analyzed A/B test results for onboarding flows, boosting day-7 retention by 4.2%.',
      'Authored 3 comprehensive PRDs for notification center enhancements adopted by 500k daily users.',
    ],
  },
  {
    company: 'Campus Startup',
    role: 'Growth Intern',
    bulletsCount: 4,
    bullets: [
      'Analyzed acquisition channels and campaign performance to optimize conversion funnels.',
      'Created competitor research reports and market sizing models for strategic growth planning.',
      'Managed social acquisition experiments resulting in 25% lower customer acquisition cost.',
      'Coordinated weekly growth sprints with marketing and engineering leads.',
    ],
  },
  {
    company: 'Berkeley Business Consulting',
    role: 'Student Consultant',
    bulletsCount: 3,
    bullets: [
      'Delivered market entry strategy for a fintech client, resulting in 3 actionable expansion vectors.',
      'Performed financial modeling and cost-benefit analysis for operational restructuring.',
      'Presented strategic recommendations to executive stakeholders and senior partners.',
    ],
  },
];

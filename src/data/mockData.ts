import { Resume, LibraryExperience } from '../types';

export const mockResumes: Record<string, Resume> = {
  'pm-resume': {
    id: 'pm-resume',
    name: 'PM Resume',
    template: 'Classic',
    jd: `TikTok - Product Intern (Global Product Solutions)

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
- Previous internship experience in tech, product management, or consulting is a strong plus.`,
    fullName: 'Alex Chen',
    title: 'Product Management Intern',
    contact: {
      email: 'alex.chen@berkeley.edu',
      phone: '+1 (510) 555-0192',
      location: 'Berkeley, CA',
      linkedin: 'linkedin.com/in/alexchen-pm',
    },
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-25T10:00:00Z',
    sections: [
      {
        id: 'pm-section-education',
        type: 'education',
        title: 'Education',
        items: [
          {
            id: 'pm-education-1',
            school: 'University of California, Berkeley',
            degree: 'B.A. Economics · Data Science Minor',
            startDate: '2023',
            endDate: '2027',
          },
        ],
      },
      {
        id: 'pm-section-experience',
        type: 'experience',
        title: 'Experience',
        items: [
          {
            id: 'pm-experience-1',
            company: 'ByteDance',
            role: 'Product Intern',
            startDate: 'Jun 2025',
            endDate: 'Aug 2025',
            bullets: [
              { id: 'pm-bullet-1', text: 'Conducted user interviews and summarized onboarding pain points to drive retention improvements.' },
              { id: 'pm-bullet-2', text: 'Built a weekly product performance dashboard tracking core engagement metrics.' },
              { id: 'pm-bullet-3', text: 'Partnered with design and engineering to refine feature requirements and streamline sprint delivery.' },
            ],
          },
          {
            id: 'pm-experience-2',
            company: 'Campus Startup',
            role: 'Growth Intern',
            startDate: 'Jan 2025',
            endDate: 'May 2025',
            bullets: [
              { id: 'pm-bullet-4', text: 'Analyzed acquisition channels and campaign performance to optimize conversion funnels.' },
              { id: 'pm-bullet-5', text: 'Created competitor research reports and market sizing models for strategic growth planning.' },
            ],
          },
        ],
      },
      {
        id: 'pm-section-projects',
        type: 'projects',
        title: 'Projects',
        items: [
          {
            id: 'pm-project-1',
            name: 'AI Resume Workspace',
            role: 'Product Project',
            bullets: [
              { id: 'pm-project-bullet-1', text: 'Designed a block-based workflow for restructuring resumes across internship applications.' },
            ],
          },
        ],
      },
    ],
  },
  'growth-resume': {
    id: 'growth-resume',
    name: 'Growth Resume',
    template: 'Classic',
    jd: `Acme Corp - Growth & Analytics Intern

Responsibilities:
- Optimize user acquisition channels and run A/B testing on landing pages.
- Build predictive growth models and cohort analysis dashboards.
- Analyze campaign performance across paid and organic social.

Qualifications:
- Strong data analysis skills and experience with SQL.
- Prior experience in growth marketing or analytics.`,
    fullName: 'Alex Chen',
    title: 'Growth & Analytics Intern',
    contact: {
      email: 'alex.chen@berkeley.edu',
      phone: '+1 (510) 555-0192',
      location: 'Berkeley, CA',
      linkedin: 'linkedin.com/in/alexchen-pm',
    },
    createdAt: '2026-08-05T12:00:00Z',
    updatedAt: '2026-08-20T14:30:00Z',
    sections: [
      {
        id: 'growth-section-education',
        type: 'education',
        title: 'Education',
        items: [
          {
            id: 'growth-education-1',
            school: 'University of California, Berkeley',
            degree: 'B.A. Economics · Data Science Minor',
            startDate: '2023',
            endDate: '2027',
          },
        ],
      },
      {
        id: 'growth-section-experience',
        type: 'experience',
        title: 'Experience',
        items: [
          {
            id: 'growth-experience-1',
            company: 'Campus Startup',
            role: 'Growth Intern',
            startDate: 'Jan 2025',
            endDate: 'May 2025',
            bullets: [
              { id: 'growth-bullet-1', text: 'Optimized referral funnel resulting in improved viral user acquisition.' },
              { id: 'growth-bullet-2', text: 'Analyzed acquisition channels and campaign performance across paid and organic social.' },
              { id: 'growth-bullet-3', text: 'Created competitor research and cohort retention tracking for quarterly growth planning.' },
            ],
          },
          {
            id: 'growth-experience-2',
            company: 'ByteDance',
            role: 'Product Intern',
            startDate: 'Jun 2025',
            endDate: 'Aug 2025',
            bullets: [
              { id: 'growth-bullet-4', text: 'Built a weekly product performance dashboard tracking retention cohorts.' },
              { id: 'growth-bullet-5', text: 'Conducted user interviews to identify onboarding drop-off bottlenecks.' },
            ],
          },
        ],
      },
      {
        id: 'growth-section-projects',
        type: 'projects',
        title: 'Projects',
        items: [
          {
            id: 'growth-project-1',
            name: 'Viral Loop Simulator',
            role: 'Analytics Project',
            bullets: [
              { id: 'growth-project-bullet-1', text: 'Built a predictive growth model simulating user invite loops and acquisition-to-value ratios.' },
            ],
          },
        ],
      },
    ],
  },
  'consulting-resume': {
    id: 'consulting-resume',
    name: 'Consulting Resume',
    template: 'Classic',
    jd: `MBB Strategy - Summer Associate

Responsibilities:
- Perform financial modeling and cost-benefit analysis.
- Conduct primary and secondary research on market trends.
- Deliver strategic recommendations and presentations to senior stakeholders.

Qualifications:
- Outstanding academic record in Economics, Business, or related fields.
- Strong problem-solving framework and structured communication.`,
    fullName: 'Alex Chen',
    title: 'Strategy & Operations Associate',
    contact: {
      email: 'alex.chen@berkeley.edu',
      phone: '+1 (510) 555-0192',
      location: 'Berkeley, CA',
      linkedin: 'linkedin.com/in/alexchen-pm',
    },
    createdAt: '2026-08-10T09:15:00Z',
    updatedAt: '2026-08-25T11:00:00Z',
    sections: [
      {
        id: 'consulting-section-education',
        type: 'education',
        title: 'Education',
        items: [
          {
            id: 'consulting-education-1',
            school: 'University of California, Berkeley',
            degree: 'B.A. Economics · Data Science Minor',
            startDate: '2023',
            endDate: '2027',
          },
        ],
      },
      {
        id: 'consulting-section-experience',
        type: 'experience',
        title: 'Experience',
        items: [
          {
            id: 'consulting-experience-1',
            company: 'Berkeley Business Consulting',
            role: 'Student Consultant',
            startDate: 'Sep 2024',
            endDate: 'Dec 2024',
            bullets: [
              { id: 'consulting-bullet-1', text: 'Delivered market-entry recommendations for a fintech client.' },
              { id: 'consulting-bullet-2', text: 'Performed financial modeling and cost-benefit analysis for operational restructuring.' },
              { id: 'consulting-bullet-3', text: 'Presented strategic recommendations to executive stakeholders and senior partners.' },
            ],
          },
          {
            id: 'consulting-experience-2',
            company: 'ByteDance',
            role: 'Product Intern',
            startDate: 'Jun 2025',
            endDate: 'Aug 2025',
            bullets: [
              { id: 'consulting-bullet-4', text: 'Synthesized cross-functional operational metrics into executive review decks.' },
              { id: 'consulting-bullet-5', text: 'Partnered with design and engineering to refine requirements and workflows.' },
            ],
          },
        ],
      },
      {
        id: 'consulting-section-projects',
        type: 'projects',
        title: 'Projects',
        items: [
          {
            id: 'consulting-project-1',
            name: 'FinTech Market Analysis',
            role: 'Lead Researcher',
            bullets: [
              { id: 'consulting-project-bullet-1', text: 'Authored a market assessment report on digital banking trends in Southeast Asia.' },
            ],
          },
        ],
      },
    ],
  },
};

export const libraryItems: LibraryExperience[] = [
  {
    id: 'lib-item-bd',
    company: 'ByteDance',
    role: 'Product Intern',
    startDate: 'Jun 2025',
    endDate: 'Aug 2025',
    bullets: [
      { id: 'lib-bd-1', text: 'Conducted user interviews and summarized onboarding pain points to drive retention improvements.' },
      { id: 'lib-bd-2', text: 'Built a weekly product performance dashboard tracking core engagement metrics.' },
      { id: 'lib-bd-3', text: 'Partnered with design and engineering to refine feature requirements and streamline sprint delivery.' },
      { id: 'lib-bd-4', text: 'Analyzed onboarding experiments and documented retention patterns.' },
      { id: 'lib-bd-5', text: 'Authored product requirement documents for notification improvements.' },
    ],
  },
  {
    id: 'lib-item-cs',
    company: 'Campus Startup',
    role: 'Growth Intern',
    startDate: 'Jan 2025',
    endDate: 'May 2025',
    bullets: [
      { id: 'lib-cs-1', text: 'Analyzed acquisition channels and campaign performance to optimize conversion funnels.' },
      { id: 'lib-cs-2', text: 'Created competitor research reports and market sizing models for strategic growth planning.' },
      { id: 'lib-cs-3', text: 'Managed social acquisition experiments to optimize customer acquisition cost.' },
      { id: 'lib-cs-4', text: 'Coordinated weekly growth sprints with marketing and engineering leads.' },
    ],
  },
  {
    id: 'lib-item-bbc',
    company: 'Berkeley Business Consulting',
    role: 'Student Consultant',
    startDate: 'Sep 2024',
    endDate: 'Dec 2024',
    bullets: [
      { id: 'lib-bbc-1', text: 'Delivered market-entry recommendations for a fintech client.' },
      { id: 'lib-bbc-2', text: 'Performed financial modeling and cost-benefit analysis for operational restructuring.' },
      { id: 'lib-bbc-3', text: 'Presented strategic recommendations to executive stakeholders and senior partners.' },
    ],
  },
];

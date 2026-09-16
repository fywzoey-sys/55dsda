import { Resume, LibraryExperience } from '../types';

export const mockResumes: Record<string, Resume> = {
  'pm-resume': {
    id: 'pm-resume',
    name: '产品简历',
    template: 'Classic',
    jd: '我们希望候选人能够协助产品经理完成用户研究、需求整理、产品测试和跨团队沟通。具备良好的逻辑分析、文字表达和团队协作能力，对互联网产品和用户体验有兴趣。',
    fullName: '林知夏',
    title: '产品方向实习生',
    contact: {
      email: 'linzhixia@example.com',
      phone: '138 0000 0000',
      location: '上海',
      linkedin: 'linkedin.com/in/example',
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
            school: '示例大学',
            degree: '信息管理与信息系统',
            startDate: '2022.09',
            endDate: '2026.06',
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
            company: '校园创新中心',
            role: '产品实习生',
            startDate: '2025.06',
            endDate: '至今',
            bullets: [
              { id: 'pm-bullet-1', text: '整理用户访谈记录，归纳常见使用问题并同步给产品团队。' },
              { id: 'pm-bullet-2', text: '协助维护需求文档，跟进设计与开发过程中的需求调整。' },
              { id: 'pm-bullet-3', text: '参与产品功能测试，记录问题并整理测试反馈。' },
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
            name: '实习信息整理工具',
            role: '产品负责人',
            startDate: '2025.03',
            endDate: '2025.06',
            bullets: [
              { id: 'pm-project-bullet-1', text: '梳理学生查找和管理实习信息时的常见问题。' },
              { id: 'pm-project-bullet-2', text: '设计职位收藏、进度记录和信息整理流程。' },
              { id: 'pm-project-bullet-3', text: '根据使用反馈调整信息层级与交互细节。' },
            ],
          },
        ],
      },
    ],
  },
  'growth-resume': {
    id: 'growth-resume',
    name: '增长简历',
    template: 'Classic',
    jd: '我们希望候选人能够协助增长团队完成渠道数据整理、用户留存分析和活动运营支持。具备良好的数据敏感度、学习能力和沟通能力，熟悉基本的数据分析工具。',
    fullName: '林知夏',
    title: '增长与运营方向实习生',
    contact: {
      email: 'linzhixia@example.com',
      phone: '138 0000 0000',
      location: '上海',
      linkedin: 'linkedin.com/in/example',
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
            school: '示例大学',
            degree: '信息管理与信息系统',
            startDate: '2022.09',
            endDate: '2026.06',
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
            company: '学生媒体中心',
            role: '内容运营',
            startDate: '2024.09',
            endDate: '2025.05',
            bullets: [
              { id: 'growth-bullet-1', text: '参与校园内容选题规划与日常内容维护。' },
              { id: 'growth-bullet-2', text: '根据读者反馈整理内容优化建议。' },
              { id: 'growth-bullet-3', text: '协调编辑与设计成员完成内容发布。' },
            ],
          },
          {
            id: 'growth-experience-2',
            company: '校园创新中心',
            role: '产品实习生',
            startDate: '2025.06',
            endDate: '至今',
            bullets: [
              { id: 'growth-bullet-4', text: '整理用户访谈记录，归纳常见使用问题并同步给产品团队。' },
              { id: 'growth-bullet-5', text: '参与产品功能测试，记录问题并整理测试反馈。' },
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
            name: '实习信息整理工具',
            role: '产品负责人',
            startDate: '2025.03',
            endDate: '2025.06',
            bullets: [
              { id: 'growth-project-bullet-1', text: '根据使用反馈调整信息层级与交互细节。' },
            ],
          },
        ],
      },
    ],
  },
  'consulting-resume': {
    id: 'consulting-resume',
    name: '咨询简历',
    template: 'Classic',
    jd: '我们希望候选人能够协助咨询团队完成行业调研、案头研究、数据整理和报告撰写。具备优秀的逻辑思维、信息检索能力和结构化表达能力，对企业战略与运营有研究热情。',
    fullName: '林知夏',
    title: '商业分析与咨询方向实习生',
    contact: {
      email: 'linzhixia@example.com',
      phone: '138 0000 0000',
      location: '上海',
      linkedin: 'linkedin.com/in/example',
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
            school: '示例大学',
            degree: '信息管理与信息系统',
            startDate: '2022.09',
            endDate: '2026.06',
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
            company: '课程项目团队',
            role: '用户研究',
            startDate: '2024.03',
            endDate: '2024.06',
            bullets: [
              { id: 'consulting-bullet-1', text: '设计调查问卷，了解目标用户的日常使用习惯。' },
              { id: 'consulting-bullet-2', text: '整理定性和定量数据，输出基础的调研分析报告。' },
              { id: 'consulting-bullet-3', text: '协助团队总结核心痛点，作为后续方案设计的依据。' },
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
            name: '实习信息整理工具',
            role: '产品负责人',
            startDate: '2025.03',
            endDate: '2025.06',
            bullets: [
              { id: 'consulting-project-bullet-1', text: '梳理学生查找和管理实习信息时的常见问题。' },
              { id: 'consulting-project-bullet-2', text: '根据使用反馈调整信息层级与交互细节。' },
            ],
          },
        ],
      },
    ],
  },
};

export const libraryItems: LibraryExperience[] = [
  {
    id: 'lib-item-innovate',
    company: '校园创新中心',
    role: '产品实习生',
    startDate: '2025.06',
    endDate: '至今',
    bullets: [
      { id: 'lib-innovate-1', text: '整理用户访谈记录，归纳常见使用问题并同步给产品团队。' },
      { id: 'lib-innovate-2', text: '协助维护需求文档，跟进设计与开发过程中的需求调整。' },
      { id: 'lib-innovate-3', text: '参与产品功能测试，记录问题并整理测试反馈。' },
    ],
  },
  {
    id: 'lib-item-media',
    company: '学生媒体中心',
    role: '内容运营',
    startDate: '2024.09',
    endDate: '2025.05',
    bullets: [
      { id: 'lib-media-1', text: '参与校园内容选题规划与日常内容维护。' },
      { id: 'lib-media-2', text: '根据读者反馈整理内容优化建议。' },
      { id: 'lib-media-3', text: '协调编辑与设计成员完成内容发布。' },
    ],
  },
  {
    id: 'lib-item-research',
    company: '课程项目团队',
    role: '用户研究',
    startDate: '2024.03',
    endDate: '2024.06',
    bullets: [
      { id: 'lib-research-1', text: '设计调查问卷，了解目标用户的日常使用习惯。' },
      { id: 'lib-research-2', text: '整理定性和定量数据，输出基础的调研分析报告。' },
      { id: 'lib-research-3', text: '协助团队总结核心痛点，作为后续方案设计的依据。' },
    ],
  },
];

import React from 'react';
import { Resume, ContactInfo, Education, Experience, Project, EducationSection, ExperienceSection, ProjectSection } from '../types';
import { generateId } from '../utils/id';
// import { AutoResizeTextarea } from './AutoResizeTextarea';
import { Plus } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import { SortableExperience } from './resume/SortableExperience';
import { SortableBullet } from './resume/SortableBullet';

interface ResumePaperProps {
  resume: Resume;
  onUpdateResume: (updatedResume: Resume) => void;
}

export const ResumePaper: React.FC<ResumePaperProps> = ({ resume, onUpdateResume }) => {
  // Update top-level header fields
  const handleUpdateHeader = (field: 'fullName' | 'title', value: string) => {
    onUpdateResume({
      ...resume,
      [field]: value,
    });
  };

  // Update contact fields
  const handleUpdateContact = (field: keyof ContactInfo, value: string) => {
    onUpdateResume({
      ...resume,
      contact: {
        ...resume.contact,
        [field]: value,
      },
    });
  };

  // Update Section Title
  const handleUpdateSectionTitle = (sectionId: string, title: string) => {
    onUpdateResume({
      ...resume,
      sections: resume.sections.map((section) =>
        section.id === sectionId ? { ...section, title } : section
      ),
    });
  };

  // Update Education Item
  const handleUpdateEducation = (
    sectionId: string,
    eduId: string,
    field: keyof Education,
    value: string
  ) => {
    onUpdateResume({
      ...resume,
      sections: resume.sections.map((section) => {
        if (section.id !== sectionId || section.type !== 'education') return section;
        const eduSection = section as EducationSection;
        return {
          ...eduSection,
          items: eduSection.items.map((edu) =>
            edu.id === eduId ? { ...edu, [field]: value } : edu
          ),
        };
      }),
    });
  };

  // Update Experience Item
  const handleUpdateExperience = (
    sectionId: string,
    expId: string,
    field: keyof Experience,
    value: string
  ) => {
    onUpdateResume({
      ...resume,
      sections: resume.sections.map((section) => {
        if (section.id !== sectionId || section.type !== 'experience') return section;
        const expSection = section as ExperienceSection;
        return {
          ...expSection,
          items: expSection.items.map((exp) =>
            exp.id === expId ? { ...exp, [field]: value } : exp
          ),
        };
      }),
    });
  };

  // Add Experience
  const handleAddExperience = (sectionId: string) => {
    const newExp: Experience = {
      id: generateId('exp'),
      company: '',
      role: '',
      startDate: '',
      endDate: '',
      bullets: [
        {
          id: generateId('bullet'),
          text: '',
        },
      ],
    };

    onUpdateResume({
      ...resume,
      sections: resume.sections.map((section) => {
        if (section.id !== sectionId || section.type !== 'experience') return section;
        const expSection = section as ExperienceSection;
        return {
          ...expSection,
          items: [...expSection.items, newExp],
        };
      }),
    });
  };

  // Delete Experience
  const handleDeleteExperience = (sectionId: string, expId: string) => {
    onUpdateResume({
      ...resume,
      sections: resume.sections.map((section) => {
        if (section.id !== sectionId || section.type !== 'experience') return section;
        const expSection = section as ExperienceSection;
        return {
          ...expSection,
          items: expSection.items.filter((exp) => exp.id !== expId),
        };
      }),
    });
  };

  // Update Project Item
  const handleUpdateProject = (
    sectionId: string,
    projId: string,
    field: keyof Project,
    value: string
  ) => {
    onUpdateResume({
      ...resume,
      sections: resume.sections.map((section) => {
        if (section.id !== sectionId || section.type !== 'projects') return section;
        const projSection = section as ProjectSection;
        return {
          ...projSection,
          items: projSection.items.map((proj) =>
            proj.id === projId ? { ...proj, [field]: value } : proj
          ),
        };
      }),
    });
  };

  // Update Bullet (for Experience or Project)
  const handleUpdateBullet = (
    sectionId: string,
    parentId: string,
    bulletId: string,
    text: string
  ) => {
    onUpdateResume({
      ...resume,
      sections: resume.sections.map((section) => {
        if (section.id !== sectionId) return section;
        if (section.type === 'experience') {
          const expSection = section as ExperienceSection;
          return {
            ...expSection,
            items: expSection.items.map((exp) => {
              if (exp.id !== parentId) return exp;
              return {
                ...exp,
                bullets: exp.bullets.map((b) => (b.id === bulletId ? { ...b, text } : b)),
              };
            }),
          };
        } else if (section.type === 'projects') {
          const projSection = section as ProjectSection;
          return {
            ...projSection,
            items: projSection.items.map((proj) => {
              if (proj.id !== parentId) return proj;
              return {
                ...proj,
                bullets: proj.bullets.map((b) => (b.id === bulletId ? { ...b, text } : b)),
              };
            }),
          };
        }
        return section;
      }),
    });
  };

  // Add Bullet
    const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const type = active.data.current?.type;
    const sectionId = active.data.current?.sectionId;
    
    if (type === 'experience') {
      onUpdateResume({
        ...resume,
        sections: resume.sections.map((section) => {
          if (section.id !== sectionId || section.type !== 'experience') return section;
          const expSection = section as ExperienceSection;
          const oldIndex = expSection.items.findIndex(item => item.id === active.id);
          const newIndex = expSection.items.findIndex(item => item.id === over.id);
          
          return {
            ...expSection,
            items: arrayMove(expSection.items, oldIndex, newIndex),
          };
        }),
      });
    } else if (type === 'bullet') {
      const parentId = active.data.current?.parentId;
      onUpdateResume({
        ...resume,
        sections: resume.sections.map((section) => {
          if (section.id !== sectionId) return section;
          if (section.type === 'experience') {
            const expSection = section as ExperienceSection;
            return {
              ...expSection,
              items: expSection.items.map(exp => {
                if (exp.id !== parentId) return exp;
                const oldIndex = exp.bullets.findIndex(b => b.id === active.id);
                const newIndex = exp.bullets.findIndex(b => b.id === over.id);
                return {
                  ...exp,
                  bullets: arrayMove(exp.bullets, oldIndex, newIndex),
                };
              }),
            };
          } else if (section.type === 'projects') {
            const projSection = section as ProjectSection;
            return {
              ...projSection,
              items: projSection.items.map(proj => {
                if (proj.id !== parentId) return proj;
                const oldIndex = proj.bullets.findIndex(b => b.id === active.id);
                const newIndex = proj.bullets.findIndex(b => b.id === over.id);
                return {
                  ...proj,
                  bullets: arrayMove(proj.bullets, oldIndex, newIndex),
                };
              }),
            };
          }
          return section;
        })
      });
    }
  };

  const handleMoveExperience = (sectionId: string, index: number, direction: 'up' | 'down') => {
    onUpdateResume({
      ...resume,
      sections: resume.sections.map((section) => {
        if (section.id !== sectionId || section.type !== 'experience') return section;
        const expSection = section as ExperienceSection;
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= expSection.items.length) return section;
        
        return {
          ...expSection,
          items: arrayMove(expSection.items, index, newIndex),
        };
      }),
    });
  };

  const handleMoveBullet = (sectionId: string, parentId: string, index: number, direction: 'up' | 'down') => {
    onUpdateResume({
      ...resume,
      sections: resume.sections.map((section) => {
        if (section.id !== sectionId) return section;
        if (section.type === 'experience') {
          const expSection = section as ExperienceSection;
          return {
            ...expSection,
            items: expSection.items.map(exp => {
              if (exp.id !== parentId) return exp;
              const newIndex = direction === 'up' ? index - 1 : index + 1;
              if (newIndex < 0 || newIndex >= exp.bullets.length) return exp;
              return {
                ...exp,
                bullets: arrayMove(exp.bullets, index, newIndex),
              };
            }),
          };
        } else if (section.type === 'projects') {
          const projSection = section as ProjectSection;
          return {
            ...projSection,
            items: projSection.items.map(proj => {
              if (proj.id !== parentId) return proj;
              const newIndex = direction === 'up' ? index - 1 : index + 1;
              if (newIndex < 0 || newIndex >= proj.bullets.length) return proj;
              return {
                ...proj,
                bullets: arrayMove(proj.bullets, index, newIndex),
              };
            }),
          };
        }
        return section;
      }),
    });
  };

const handleAddBullet = (sectionId: string, parentId: string) => {
    const newBullet = {
      id: generateId('bullet'),
      text: '',
    };

    onUpdateResume({
      ...resume,
      sections: resume.sections.map((section) => {
        if (section.id !== sectionId) return section;
        if (section.type === 'experience') {
          const expSection = section as ExperienceSection;
          return {
            ...expSection,
            items: expSection.items.map((exp) => {
              if (exp.id !== parentId) return exp;
              return {
                ...exp,
                bullets: [...exp.bullets, newBullet],
              };
            }),
          };
        } else if (section.type === 'projects') {
          const projSection = section as ProjectSection;
          return {
            ...projSection,
            items: projSection.items.map((proj) => {
              if (proj.id !== parentId) return proj;
              return {
                ...proj,
                bullets: [...proj.bullets, newBullet],
              };
            }),
          };
        }
        return section;
      }),
    });
  };

  // Delete Bullet
  const handleDeleteBullet = (sectionId: string, parentId: string, bulletId: string) => {
    onUpdateResume({
      ...resume,
      sections: resume.sections.map((section) => {
        if (section.id !== sectionId) return section;
        if (section.type === 'experience') {
          const expSection = section as ExperienceSection;
          return {
            ...expSection,
            items: expSection.items.map((exp) => {
              if (exp.id !== parentId) return exp;
              return {
                ...exp,
                bullets: exp.bullets.filter((b) => b.id !== bulletId),
              };
            }),
          };
        } else if (section.type === 'projects') {
          const projSection = section as ProjectSection;
          return {
            ...projSection,
            items: projSection.items.map((proj) => {
              if (proj.id !== parentId) return proj;
              return {
                ...proj,
                bullets: proj.bullets.filter((b) => b.id !== bulletId),
              };
            }),
          };
        }
        return section;
      }),
    });
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis, restrictToParentElement]}>
    <div className="flex justify-center w-full pb-8">
      <div 
        className="w-full max-w-[740px] aspect-[210/297] bg-[#FFFEFA] rounded-[14px] p-10 md:p-14 text-[#1F1F1B] font-sans selection:bg-[#D9DFAD]/50"
        style={{
          boxShadow: '0 8px 30px rgba(31, 31, 27, 0.06)',
          border: '1px solid rgba(226, 218, 207, 0.45)'
        }}
      >
        
        {/* Header */}
        <div className="border-b border-[#E2DACF]/60 pb-5 mb-6 text-center sm:text-left flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={resume.fullName}
              onChange={(e) => handleUpdateHeader('fullName', e.target.value)}
              placeholder="Your Full Name"
              className="font-serif text-3xl font-bold tracking-tight text-[#1F1F1B] bg-transparent border-0 outline-none w-full p-1 -ml-1 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60"
            />
            <input
              type="text"
              value={resume.title}
              onChange={(e) => handleUpdateHeader('title', e.target.value)}
              placeholder="Target Role / Professional Title"
              className="text-sm font-medium text-[#6E6A62] bg-transparent border-0 outline-none w-full p-1 -ml-1 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 mt-0.5"
            />
          </div>
          <div className="text-xs text-[#6E6A62] sm:text-right space-y-1 shrink-0" style={{ fontVariantNumeric: 'tabular-nums' }}>
            <div>
              <input
                type="text"
                value={resume.contact.email}
                onChange={(e) => handleUpdateContact('email', e.target.value)}
                placeholder="email@domain.com"
                className="text-xs text-[#6E6A62] bg-transparent border-0 outline-none p-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 sm:text-right w-full sm:w-auto"
              />
            </div>
            <div className="flex items-center sm:justify-end gap-1">
              <input
                type="text"
                value={resume.contact.phone}
                onChange={(e) => handleUpdateContact('phone', e.target.value)}
                placeholder="Phone"
                className="text-xs text-[#6E6A62] bg-transparent border-0 outline-none p-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 sm:text-right w-28"
              />
              <span>·</span>
              <input
                type="text"
                value={resume.contact.location}
                onChange={(e) => handleUpdateContact('location', e.target.value)}
                placeholder="Location"
                className="text-xs text-[#6E6A62] bg-transparent border-0 outline-none p-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 sm:text-right w-24"
              />
            </div>
            <div>
              <input
                type="text"
                value={resume.contact.linkedin}
                onChange={(e) => handleUpdateContact('linkedin', e.target.value)}
                placeholder="linkedin.com/in/username"
                className="text-xs text-[#6E6A62] bg-transparent border-0 outline-none p-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 sm:text-right w-full sm:w-auto"
              />
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-5 text-[14px]">
          {resume.sections.map((section) => {
            switch (section.type) {
              case 'education':
                return (
                  <section key={section.id} className="group/section">
                    <div className="mb-2 pb-1 border-b border-[#E2DACF]/40 flex items-center justify-between">
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => handleUpdateSectionTitle(section.id, e.target.value)}
                        placeholder="Section Title"
                        className="text-xs font-semibold uppercase tracking-wider text-[#6E6A62] bg-transparent border-0 outline-none p-0.5 -ml-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 flex-1"
                      />
                    </div>
                    <div className="space-y-2">
                      {section.items.map((edu) => (
                        <div
                          key={edu.id}
                          className="group/edu p-2 -mx-2 rounded-lg transition-colors duration-100 hover:bg-[#F6F1E7]/40"
                        >
                          <div className="flex justify-between items-baseline gap-2">
                            <input
                              type="text"
                              value={edu.school}
                              onChange={(e) => handleUpdateEducation(section.id, edu.id, 'school', e.target.value)}
                              placeholder="School / University"
                              className="font-semibold text-[#1F1F1B] text-sm bg-transparent border-0 outline-none p-0.5 -ml-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 flex-1 min-w-0"
                            />
                            <div className="flex items-center gap-1 text-xs text-[#6E6A62] font-medium shrink-0 ml-2" style={{ fontVariantNumeric: 'tabular-nums' }}>
                              <input
                                type="text"
                                value={edu.startDate}
                                onChange={(e) => handleUpdateEducation(section.id, edu.id, 'startDate', e.target.value)}
                                placeholder="Start"
                                className="text-xs text-[#6E6A62] font-medium bg-transparent border-0 outline-none p-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 text-right w-12"
                              />
                              <span>–</span>
                              <input
                                type="text"
                                value={edu.endDate}
                                onChange={(e) => handleUpdateEducation(section.id, edu.id, 'endDate', e.target.value)}
                                placeholder="End"
                                className="text-xs text-[#6E6A62] font-medium bg-transparent border-0 outline-none p-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 text-right w-12"
                              />
                            </div>
                          </div>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => handleUpdateEducation(section.id, edu.id, 'degree', e.target.value)}
                            placeholder="Degree · Major"
                            className="text-xs text-[#6E6A62] bg-transparent border-0 outline-none p-0.5 -ml-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 w-full mt-0.5"
                          />
                        </div>
                      ))}
                    </div>
                  </section>
                );

              case 'experience':
                return (
                  <section key={section.id} className="group/section">
                    <div className="mb-2 pb-1 border-b border-[#E2DACF]/40 flex items-center justify-between">
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => handleUpdateSectionTitle(section.id, e.target.value)}
                        placeholder="Section Title"
                        className="text-xs font-semibold uppercase tracking-wider text-[#6E6A62] bg-transparent border-0 outline-none p-0.5 -ml-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 flex-1"
                      />
                    </div>
                    <div className="space-y-4">
                      <SortableContext items={section.items.map(exp => exp.id)} strategy={verticalListSortingStrategy}>
                        {section.items.map((exp, index) => (
                          <SortableExperience
                            key={exp.id}
                            experience={exp}
                            index={index}
                            totalExperiences={section.items.length}
                            sectionId={section.id}
                            onUpdate={handleUpdateExperience}
                            onDelete={handleDeleteExperience}
                            onMoveUp={(sId, idx) => handleMoveExperience(sId, idx, 'up')}
                            onMoveDown={(sId, idx) => handleMoveExperience(sId, idx, 'down')}
                            onUpdateBullet={handleUpdateBullet}
                            onDeleteBullet={handleDeleteBullet}
                            onAddBullet={handleAddBullet}
                            onMoveBulletUp={(sId, pId, idx) => handleMoveBullet(sId, pId, idx, 'up')}
                            onMoveBulletDown={(sId, pId, idx) => handleMoveBullet(sId, pId, idx, 'down')}
                          />
                        ))}
                      </SortableContext>
                    </div>

                    {/* Add Experience button */}
                    <div className="mt-2 pt-2 border-t border-[#E2DACF]/30">
                      <button
                        type="button"
                        onClick={() => handleAddExperience(section.id)}
                        className="flex items-center gap-1.5 text-xs font-medium text-[#6E6A62] hover:text-[#1F1F1B] py-1 px-2.5 rounded-lg hover:bg-black/[0.04] transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add experience</span>
                      </button>
                    </div>
                  </section>
                );

              case 'projects':
                return (
                  <section key={section.id} className="group/section">
                    <div className="mb-2 pb-1 border-b border-[#E2DACF]/40 flex items-center justify-between">
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => handleUpdateSectionTitle(section.id, e.target.value)}
                        placeholder="Section Title"
                        className="text-xs font-semibold uppercase tracking-wider text-[#6E6A62] bg-transparent border-0 outline-none p-0.5 -ml-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 flex-1"
                      />
                    </div>
                    <div className="space-y-3">
                      {section.items.map((proj) => (
                        <div
                          key={proj.id}
                          className="group/proj p-2.5 -mx-2 rounded-lg transition-colors duration-100 hover:bg-[#F6F1E7]/40"
                        >
                          <div className="flex justify-between items-baseline gap-2">
                            <input
                              type="text"
                              value={proj.name}
                              onChange={(e) => handleUpdateProject(section.id, proj.id, 'name', e.target.value)}
                              placeholder="Project Name"
                              className="font-semibold text-[#1F1F1B] text-sm bg-transparent border-0 outline-none p-0.5 -ml-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 flex-1 min-w-0"
                            />
                            <div className="flex items-center gap-1 text-xs text-[#6E6A62] font-medium shrink-0 ml-2" style={{ fontVariantNumeric: 'tabular-nums' }}>
                              <input
                                type="text"
                                value={proj.startDate || ''}
                                onChange={(e) => handleUpdateProject(section.id, proj.id, 'startDate', e.target.value)}
                                placeholder="Start"
                                className="text-xs text-[#6E6A62] font-medium bg-transparent border-0 outline-none p-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 text-right w-12"
                              />
                              <span>–</span>
                              <input
                                type="text"
                                value={proj.endDate || ''}
                                onChange={(e) => handleUpdateProject(section.id, proj.id, 'endDate', e.target.value)}
                                placeholder="End"
                                className="text-xs text-[#6E6A62] font-medium bg-transparent border-0 outline-none p-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 text-right w-12"
                              />
                            </div>
                          </div>
                          <input
                            type="text"
                            value={proj.role}
                            onChange={(e) => handleUpdateProject(section.id, proj.id, 'role', e.target.value)}
                            placeholder="Project Role / Scope"
                            className="text-xs font-medium text-[#6E6A62] bg-transparent border-0 outline-none p-0.5 -ml-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 w-full mb-1"
                          />

                          {/* Bullet points */}
                          <div className="space-y-1 mt-1">
                            <SortableContext items={proj.bullets.map(b => b.id)} strategy={verticalListSortingStrategy}>
                              {proj.bullets.map((bullet, bIndex) => (
                                <SortableBullet
                                  key={bullet.id}
                                  bullet={bullet}
                                  index={bIndex}
                                  totalBullets={proj.bullets.length}
                                  sectionId={section.id}
                                  parentId={proj.id}
                                  onUpdate={handleUpdateBullet}
                                  onDelete={handleDeleteBullet}
                                  onMoveUp={(sId, pId, idx) => handleMoveBullet(sId, pId, idx, 'up')}
                                  onMoveDown={(sId, pId, idx) => handleMoveBullet(sId, pId, idx, 'down')}
                                />
                              ))}
                            </SortableContext>
                          </div>

                          {/* Add bullet button */}
                          <div className="mt-1.5 pl-2">
                            <button
                              type="button"
                              onClick={() => handleAddBullet(section.id, proj.id)}
                              className="flex items-center gap-1 text-[11px] font-medium text-[#6E6A62] hover:text-[#1F1F1B] py-0.5 px-1.5 rounded hover:bg-black/[0.04] transition-colors cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add bullet</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                );

              default:
                return null;
            }
          })}
        </div>

      </div>
    </div>
    </DndContext>
  );
};

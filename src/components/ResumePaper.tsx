import { Resume } from '../types';

interface ResumePaperProps {
  resume: Resume;
}

function formatDateRange(startDate?: string, endDate?: string) {
  if (!startDate && !endDate) return '';
  if (!endDate) return startDate ?? '';
  return `${startDate} – ${endDate}`;
}

export const ResumePaper: React.FC<ResumePaperProps> = ({ resume }) => {
  // Density styling based on Classic template
  const spacingClass = 'space-y-5 text-[14px]';

  return (
    <div className="flex justify-center w-full pb-8">
      <div 
        className="w-full max-w-[740px] aspect-[210/297] bg-[#FFFEFA] rounded-[14px] p-10 md:p-14 text-[#1F1F1B] font-sans selection:bg-[#D9DFAD]/50"
        style={{
          boxShadow: '0 8px 30px rgba(31, 31, 27, 0.06)',
          border: '1px solid rgba(226, 218, 207, 0.45)'
        }}
      >
        
        {/* Header */}
        <div className="border-b border-[#E2DACF]/60 pb-5 mb-6 text-center sm:text-left flex flex-col sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-[#1F1F1B]">
              {resume.fullName}
            </h1>
            <p className="text-sm font-medium text-[#6E6A62] mt-1">
              {resume.title}
            </p>
          </div>
          <div className="text-xs text-[#6E6A62] mt-3 sm:mt-0 sm:text-right space-y-0.5" style={{ fontVariantNumeric: 'tabular-nums' }}>
            <p>{resume.contact.email}</p>
            <p>{resume.contact.phone} · {resume.contact.location}</p>
            <p>{resume.contact.linkedin}</p>
          </div>
        </div>

        <div className={spacingClass}>
          {resume.sections.map((section) => {
            switch (section.type) {
              case 'education':
                return (
                  <section key={section.id}>
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6E6A62] mb-2.5 pb-1 border-b border-[#E2DACF]/40">
                      {section.title}
                    </h2>
                    {section.items.map((edu) => (
                      <div
                        key={edu.id}
                        className="group p-2 -mx-2 rounded-lg transition-colors duration-100 hover:bg-[#F6F1E7]/60 cursor-pointer"
                      >
                        <div className="flex justify-between items-baseline">
                          <h3 className="font-semibold text-[#1F1F1B] text-sm">
                            {edu.school}
                          </h3>
                          <span className="text-xs text-[#6E6A62] font-medium" style={{ fontVariantNumeric: 'tabular-nums' }}>
                            {formatDateRange(edu.startDate, edu.endDate)}
                          </span>
                        </div>
                        <p className="text-xs text-[#6E6A62] mt-0.5">{edu.degree}</p>
                      </div>
                    ))}
                  </section>
                );

              case 'experience':
                return (
                  <section key={section.id}>
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6E6A62] mb-2.5 pb-1 border-b border-[#E2DACF]/40">
                      {section.title}
                    </h2>
                    <div className="space-y-4">
                      {section.items.map((exp) => (
                        <div
                          key={exp.id}
                          className="group p-2.5 -mx-2 rounded-lg transition-colors duration-100 hover:bg-[#F6F1E7]/60 cursor-pointer"
                        >
                          <div className="flex justify-between items-baseline">
                            <h3 className="font-semibold text-[#1F1F1B] text-sm">
                              {exp.company}
                            </h3>
                            <span className="text-xs text-[#6E6A62] font-medium" style={{ fontVariantNumeric: 'tabular-nums' }}>
                              {formatDateRange(exp.startDate, exp.endDate)}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-[#6E6A62] mb-1.5">
                            {exp.role}
                          </p>
                          <ul className="list-disc list-inside space-y-1 text-xs text-[#1F1F1B]/90 leading-relaxed">
                            {exp.bullets.map((bullet) => (
                              <li key={bullet.id} className="pl-1">
                                <span className="-ml-1">{bullet.text}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </section>
                );

              case 'projects':
                return (
                  <section key={section.id}>
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6E6A62] mb-2.5 pb-1 border-b border-[#E2DACF]/40">
                      {section.title}
                    </h2>
                    <div className="space-y-3">
                      {section.items.map((proj) => (
                        <div
                          key={proj.id}
                          className="group p-2.5 -mx-2 rounded-lg transition-colors duration-100 hover:bg-[#F6F1E7]/60 cursor-pointer"
                        >
                          <div className="flex justify-between items-baseline">
                            <h3 className="font-semibold text-[#1F1F1B] text-sm">
                              {proj.name}
                            </h3>
                            <span className="text-xs text-[#6E6A62] font-medium" style={{ fontVariantNumeric: 'tabular-nums' }}>
                              {formatDateRange(proj.startDate, proj.endDate) || proj.role}
                            </span>
                          </div>
                          <ul className="list-disc list-inside space-y-1 text-xs text-[#1F1F1B]/90 leading-relaxed mt-1.5">
                            {proj.bullets.map((bullet) => (
                              <li key={bullet.id} className="pl-1">
                                <span className="-ml-1">{bullet.text}</span>
                              </li>
                            ))}
                          </ul>
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
  );
};

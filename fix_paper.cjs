const fs = require('fs');
let content = fs.readFileSync('src/components/ResumePaper.tsx', 'utf-8');

// Container
content = content.replace(
  '<div className="w-full max-w-[740px] aspect-[210/297] bg-[#FFFEFA] rounded-[14px] p-10 md:p-14 text-[#1F1F1B] font-sans selection:bg-[#D9DFAD]/50 relative shadow-sm ring-1 ring-black/[0.03]">',
  '<div className="w-full lg:max-w-[740px] lg:aspect-[210/297] bg-[#FFFEFA] rounded-xl lg:rounded-[14px] p-5 sm:p-7 md:p-10 lg:p-14 text-[#1F1F1B] font-sans selection:bg-[#D9DFAD]/50 relative shadow-sm ring-1 ring-black/[0.03] overflow-hidden">'
);

// Header flex-col -> sm:flex-row
content = content.replace(
  '<header className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 sm:mb-8 pb-4 border-b-2 border-[#1F1F1B]/90 gap-4">',
  '<header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 pb-4 border-b-2 border-[#1F1F1B]/90 gap-4 md:gap-0">'
);

// Name
content = content.replace(
  '<input\n              type="text"\n              value={resume.header.name}\n              onChange={(e) => onUpdateResume({ ...resume, header: { ...resume.header, name: e.target.value } })}\n              placeholder="Your Name"\n              className="text-3xl font-bold bg-transparent border-0 outline-none p-0.5 -ml-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 w-full tracking-tight"',
  '<input\n              type="text"\n              value={resume.header.name}\n              onChange={(e) => onUpdateResume({ ...resume, header: { ...resume.header, name: e.target.value } })}\n              placeholder="Your Name"\n              className="text-2xl sm:text-3xl font-bold bg-transparent border-0 outline-none p-0.5 -ml-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 w-full tracking-tight"'
);

// Title
content = content.replace(
  '<input\n              type="text"\n              value={resume.header.title}\n              onChange={(e) => onUpdateResume({ ...resume, header: { ...resume.header, title: e.target.value } })}\n              placeholder="Professional Title"\n              className="text-base font-medium text-[#6E6A62] bg-transparent border-0 outline-none p-0.5 -ml-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 w-full mt-1"',
  '<input\n              type="text"\n              value={resume.header.title}\n              onChange={(e) => onUpdateResume({ ...resume, header: { ...resume.header, title: e.target.value } })}\n              placeholder="Professional Title"\n              className="text-[16px] md:text-base font-medium text-[#6E6A62] bg-transparent border-0 outline-none p-0.5 -ml-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 w-full mt-1"'
);

// Contact Info - change flex-row flex-wrap -> flex-col sm:flex-row
content = content.replace(
  '<div className="flex flex-row flex-wrap md:flex-col items-start md:items-end gap-x-4 gap-y-1.5 md:gap-y-1 text-xs text-[#1F1F1B]/80 font-medium">',
  '<div className="flex flex-col sm:flex-row flex-wrap md:flex-col items-start md:items-end gap-x-4 gap-y-1.5 md:gap-y-1 text-[16px] sm:text-xs text-[#1F1F1B]/80 font-medium w-full md:w-auto">'
);

// Phone
content = content.replace(
  '<input\n                type="text"\n                value={resume.header.phone}\n                onChange={(e) => onUpdateResume({ ...resume, header: { ...resume.header, phone: e.target.value } })}\n                placeholder="Phone Number"\n                className="bg-transparent border-0 outline-none p-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 md:text-right w-[120px]"',
  '<input\n                type="text"\n                value={resume.header.phone}\n                onChange={(e) => onUpdateResume({ ...resume, header: { ...resume.header, phone: e.target.value } })}\n                placeholder="Phone Number"\n                className="bg-transparent border-0 outline-none p-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 sm:md:text-right w-full sm:w-[120px]"'
);

// Email
content = content.replace(
  '<input\n                type="text"\n                value={resume.header.email}\n                onChange={(e) => onUpdateResume({ ...resume, header: { ...resume.header, email: e.target.value } })}\n                placeholder="Email Address"\n                className="bg-transparent border-0 outline-none p-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 md:text-right w-[180px]"',
  '<input\n                type="text"\n                value={resume.header.email}\n                onChange={(e) => onUpdateResume({ ...resume, header: { ...resume.header, email: e.target.value } })}\n                placeholder="Email Address"\n                className="bg-transparent border-0 outline-none p-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 sm:md:text-right w-full sm:w-[180px]"'
);

// Location
content = content.replace(
  '<input\n                type="text"\n                value={resume.header.location}\n                onChange={(e) => onUpdateResume({ ...resume, header: { ...resume.header, location: e.target.value } })}\n                placeholder="Location"\n                className="bg-transparent border-0 outline-none p-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 md:text-right w-[140px]"',
  '<input\n                type="text"\n                value={resume.header.location}\n                onChange={(e) => onUpdateResume({ ...resume, header: { ...resume.header, location: e.target.value } })}\n                placeholder="Location"\n                className="bg-transparent border-0 outline-none p-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 sm:md:text-right w-full sm:w-[140px]"'
);

// Links
content = content.replace(
  '<div className="flex items-center gap-1">',
  '<div className="flex flex-col sm:flex-row sm:items-center gap-1 w-full md:w-auto">'
);
content = content.replace(
  '<div className="flex items-center gap-1">',
  '<div className="flex flex-col sm:flex-row sm:items-center gap-1 w-full md:w-auto">'
);

content = content.replace(
  '<input\n                  type="text"\n                  value={resume.header.linkedin}\n                  onChange={(e) => onUpdateResume({ ...resume, header: { ...resume.header, linkedin: e.target.value } })}\n                  placeholder="LinkedIn URL"\n                  className="bg-transparent border-0 outline-none p-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 md:text-right w-[160px]"',
  '<input\n                  type="text"\n                  value={resume.header.linkedin}\n                  onChange={(e) => onUpdateResume({ ...resume, header: { ...resume.header, linkedin: e.target.value } })}\n                  placeholder="LinkedIn URL"\n                  className="bg-transparent border-0 outline-none p-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 sm:md:text-right w-full sm:w-[160px]"'
);

content = content.replace(
  '<input\n                  type="text"\n                  value={resume.header.website}\n                  onChange={(e) => onUpdateResume({ ...resume, header: { ...resume.header, website: e.target.value } })}\n                  placeholder="Portfolio / Website"\n                  className="bg-transparent border-0 outline-none p-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 md:text-right w-[160px]"',
  '<input\n                  type="text"\n                  value={resume.header.website}\n                  onChange={(e) => onUpdateResume({ ...resume, header: { ...resume.header, website: e.target.value } })}\n                  placeholder="Portfolio / Website"\n                  className="bg-transparent border-0 outline-none p-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 sm:md:text-right w-full sm:w-[160px]"'
);


// Section Title
content = content.replace(
  /className="text-xs font-semibold uppercase tracking-wider text-\[#6E6A62\] bg-transparent border-0 outline-none p-0\.5 -ml-0\.5 rounded transition-colors hover:bg-black\/\[0\.02\] focus:ring-1 focus:ring-\[#AAC06A\]\/60 flex-1"/g,
  'className="text-[16px] md:text-xs font-semibold uppercase tracking-wider text-[#6E6A62] bg-transparent border-0 outline-none p-0.5 -ml-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 flex-1"'
);

// Education
content = content.replace(
  '<input\n                            type="text"\n                            value={edu.school}\n                            onChange={(e) => handleUpdateEducation(section.id, edu.id, \'school\', e.target.value)}\n                            placeholder="School Name"\n                            className="font-semibold text-[#1F1F1B] text-sm bg-transparent border-0 outline-none p-0.5 -ml-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 flex-1 min-w-0"\n                          />',
  '<input\n                            type="text"\n                            value={edu.school}\n                            onChange={(e) => handleUpdateEducation(section.id, edu.id, \'school\', e.target.value)}\n                            placeholder="School Name"\n                            className="font-semibold text-[#1F1F1B] text-[16px] md:text-sm bg-transparent border-0 outline-none p-0.5 -ml-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 flex-1 min-w-0"\n                          />'
);

content = content.replace(
  '<input\n                            type="text"\n                            value={edu.degree}\n                            onChange={(e) => handleUpdateEducation(section.id, edu.id, \'degree\', e.target.value)}\n                            placeholder="Degree & Major"\n                            className="text-xs font-medium text-[#6E6A62] bg-transparent border-0 outline-none p-0.5 -ml-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 w-full"\n                          />',
  '<input\n                            type="text"\n                            value={edu.degree}\n                            onChange={(e) => handleUpdateEducation(section.id, edu.id, \'degree\', e.target.value)}\n                            placeholder="Degree & Major"\n                            className="text-[16px] md:text-xs font-medium text-[#6E6A62] bg-transparent border-0 outline-none p-0.5 -ml-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 w-full"\n                          />'
);

content = content.replace(
  /<input\s+type="text"\s+value={edu\.startDate \|\| ''}\s+onChange={\(e\) => handleUpdateEducation\(section\.id, edu\.id, 'startDate', e\.target\.value\)}\s+placeholder="Start"\s+className="text-xs text-\[#6E6A62\] font-medium bg-transparent border-0 outline-none p-0\.5 rounded transition-colors hover:bg-black\/\[0\.02\] focus:ring-1 focus:ring-\[#AAC06A\]\/60 text-right w-12"\s+\/>/g,
  '<input type="text" value={edu.startDate || \'\'} onChange={(e) => handleUpdateEducation(section.id, edu.id, \'startDate\', e.target.value)} placeholder="Start" className="text-[16px] md:text-xs text-[#6E6A62] font-medium bg-transparent border-0 outline-none p-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 text-right w-14 md:w-12" />'
);

content = content.replace(
  /<input\s+type="text"\s+value={edu\.endDate \|\| ''}\s+onChange={\(e\) => handleUpdateEducation\(section\.id, edu\.id, 'endDate', e\.target\.value\)}\s+placeholder="End"\s+className="text-xs text-\[#6E6A62\] font-medium bg-transparent border-0 outline-none p-0\.5 rounded transition-colors hover:bg-black\/\[0\.02\] focus:ring-1 focus:ring-\[#AAC06A\]\/60 text-right w-12"\s+\/>/g,
  '<input type="text" value={edu.endDate || \'\'} onChange={(e) => handleUpdateEducation(section.id, edu.id, \'endDate\', e.target.value)} placeholder="End" className="text-[16px] md:text-xs text-[#6E6A62] font-medium bg-transparent border-0 outline-none p-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 text-right w-14 md:w-12" />'
);

content = content.replace(
  '<div className="flex items-center gap-1 text-xs text-[#6E6A62] font-medium shrink-0 ml-2" style={{ fontVariantNumeric: \'tabular-nums\' }}>',
  '<div className="flex items-center gap-1 text-[16px] md:text-xs text-[#6E6A62] font-medium shrink-0 mt-1 sm:mt-0 sm:ml-2" style={{ fontVariantNumeric: \'tabular-nums\' }}>'
);
content = content.replace(
  '<div className="flex justify-between items-baseline gap-2">',
  '<div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-baseline gap-1 sm:gap-2">'
);


// Projects
content = content.replace(
  '<input\n                              type="text"\n                              value={proj.name}\n                              onChange={(e) => handleUpdateProject(section.id, proj.id, \'name\', e.target.value)}\n                              placeholder="Project Name"\n                              className="font-semibold text-[#1F1F1B] text-sm bg-transparent border-0 outline-none p-0.5 -ml-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 flex-1 min-w-0"\n                            />',
  '<input\n                              type="text"\n                              value={proj.name}\n                              onChange={(e) => handleUpdateProject(section.id, proj.id, \'name\', e.target.value)}\n                              placeholder="Project Name"\n                              className="font-semibold text-[#1F1F1B] text-[16px] md:text-sm bg-transparent border-0 outline-none p-0.5 -ml-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 flex-1 min-w-0"\n                            />'
);

content = content.replace(
  '<input\n                            type="text"\n                            value={proj.role}\n                            onChange={(e) => handleUpdateProject(section.id, proj.id, \'role\', e.target.value)}\n                            placeholder="Project Role / Scope"\n                            className="text-xs font-medium text-[#6E6A62] bg-transparent border-0 outline-none p-0.5 -ml-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 w-full mb-1"\n                          />',
  '<input\n                            type="text"\n                            value={proj.role}\n                            onChange={(e) => handleUpdateProject(section.id, proj.id, \'role\', e.target.value)}\n                            placeholder="Project Role / Scope"\n                            className="text-[16px] md:text-xs font-medium text-[#6E6A62] bg-transparent border-0 outline-none p-0.5 -ml-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 w-full mb-1"\n                          />'
);

content = content.replace(
  /<input\s+type="text"\s+value={proj\.startDate \|\| ''}\s+onChange={\(e\) => handleUpdateProject\(section\.id, proj\.id, 'startDate', e\.target\.value\)}\s+placeholder="Start"\s+className="text-xs text-\[#6E6A62\] font-medium bg-transparent border-0 outline-none p-0\.5 rounded transition-colors hover:bg-black\/\[0\.02\] focus:ring-1 focus:ring-\[#AAC06A\]\/60 text-right w-12"\s+\/>/g,
  '<input type="text" value={proj.startDate || \'\'} onChange={(e) => handleUpdateProject(section.id, proj.id, \'startDate\', e.target.value)} placeholder="Start" className="text-[16px] md:text-xs text-[#6E6A62] font-medium bg-transparent border-0 outline-none p-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 text-right w-14 md:w-12" />'
);

content = content.replace(
  /<input\s+type="text"\s+value={proj\.endDate \|\| ''}\s+onChange={\(e\) => handleUpdateProject\(section\.id, proj\.id, 'endDate', e\.target\.value\)}\s+placeholder="End"\s+className="text-xs text-\[#6E6A62\] font-medium bg-transparent border-0 outline-none p-0\.5 rounded transition-colors hover:bg-black\/\[0\.02\] focus:ring-1 focus:ring-\[#AAC06A\]\/60 text-right w-12"\s+\/>/g,
  '<input type="text" value={proj.endDate || \'\'} onChange={(e) => handleUpdateProject(section.id, proj.id, \'endDate\', e.target.value)} placeholder="End" className="text-[16px] md:text-xs text-[#6E6A62] font-medium bg-transparent border-0 outline-none p-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 text-right w-14 md:w-12" />'
);

content = content.replace(
  '<div className="flex items-center gap-1 text-xs text-[#6E6A62] font-medium shrink-0 ml-2" style={{ fontVariantNumeric: \'tabular-nums\' }}>',
  '<div className="flex items-center gap-1 text-[16px] md:text-xs text-[#6E6A62] font-medium shrink-0 mt-1 sm:mt-0 sm:ml-2" style={{ fontVariantNumeric: \'tabular-nums\' }}>'
);
content = content.replace(
  '<div className="flex justify-between items-baseline gap-2">',
  '<div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-baseline gap-1 sm:gap-2">'
);

fs.writeFileSync('src/components/ResumePaper.tsx', content, 'utf-8');
console.log('ResumePaper updated.');

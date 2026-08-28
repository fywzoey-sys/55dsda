const fs = require('fs');
let content = fs.readFileSync('src/components/resume/SortableExperience.tsx', 'utf-8');

// Container margins
content = content.replace(
  'className="group/exp p-2.5 -mx-8 pl-8 rounded-lg transition-colors duration-100 hover:bg-[#F6F1E7]/40 relative"',
  'className="group/exp p-2.5 md:-mx-8 md:pl-8 rounded-lg transition-colors duration-100 hover:bg-[#F6F1E7]/40 relative"'
);

// Drag handle hidden on mobile
content = content.replace(
  'className="absolute left-1.5 top-3 opacity-0 group-hover/exp:opacity-100 focus-within:opacity-100 transition-opacity flex items-center justify-center p-1 text-[#6E6A62] hover:text-[#1F1F1B] rounded cursor-grab active:cursor-grabbing outline-none focus-visible:ring-1 focus-visible:ring-[#AAC06A]"',
  'className="hidden md:flex absolute left-1.5 top-3 opacity-0 group-hover/exp:opacity-100 focus-within:opacity-100 transition-opacity items-center justify-center p-1 text-[#6E6A62] hover:text-[#1F1F1B] rounded cursor-grab active:cursor-grabbing outline-none focus-visible:ring-1 focus-visible:ring-[#AAC06A]"'
);

// Date & Company flex
content = content.replace(
  '<div className="flex justify-between items-baseline gap-2">',
  '<div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-baseline gap-1 sm:gap-2">'
);

// Company input
content = content.replace(
  'className="font-semibold text-[#1F1F1B] text-sm bg-transparent border-0 outline-none p-0.5 -ml-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 flex-1 min-w-0"',
  'className="font-semibold text-[#1F1F1B] text-[16px] md:text-sm bg-transparent border-0 outline-none p-0.5 -ml-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 flex-1 min-w-0 w-full sm:w-auto"'
);

// Date wrapper
content = content.replace(
  '<div className="flex items-center gap-1 shrink-0 ml-2 relative" style={{ fontVariantNumeric: \'tabular-nums\' }}>',
  '<div className="flex items-center gap-1 shrink-0 sm:ml-2 relative mt-1 sm:mt-0 w-full sm:w-auto" style={{ fontVariantNumeric: \'tabular-nums\' }}>'
);

// Start Date
content = content.replace(
  'className="text-xs text-[#6E6A62] font-medium bg-transparent border-0 outline-none p-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 text-right w-16"',
  'className="text-[16px] md:text-xs text-[#6E6A62] font-medium bg-transparent border-0 outline-none p-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 text-right w-16 md:w-16 flex-1 sm:flex-none"'
);

// Dash
content = content.replace(
  '<span className="text-xs text-[#6E6A62] font-medium">–</span>',
  '<span className="text-[16px] md:text-xs text-[#6E6A62] font-medium">–</span>'
);

// End Date
content = content.replace(
  'className="text-xs text-[#6E6A62] font-medium bg-transparent border-0 outline-none p-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 text-right w-16"',
  'className="text-[16px] md:text-xs text-[#6E6A62] font-medium bg-transparent border-0 outline-none p-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 text-right w-16 md:w-16 flex-1 sm:flex-none"'
);

// Menu Button
content = content.replace(
  'className="opacity-0 group-hover/exp:opacity-100 focus-within:opacity-100 p-1 text-[#6E6A62] hover:text-[#1F1F1B] rounded transition-opacity cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-[#AAC06A]"',
  'className="opacity-100 md:opacity-0 md:group-hover/exp:opacity-100 md:focus-within:opacity-100 p-1 text-[#6E6A62] hover:text-[#1F1F1B] rounded transition-opacity cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-[#AAC06A]"'
);

// Role
content = content.replace(
  'className="text-xs font-medium text-[#6E6A62] bg-transparent border-0 outline-none p-0.5 -ml-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 w-full mb-1"',
  'className="text-[16px] md:text-xs font-medium text-[#6E6A62] bg-transparent border-0 outline-none p-0.5 -ml-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 w-full mb-1"'
);

fs.writeFileSync('src/components/resume/SortableExperience.tsx', content, 'utf-8');
console.log('SortableExperience updated.');

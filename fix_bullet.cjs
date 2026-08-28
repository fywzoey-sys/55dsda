const fs = require('fs');
let content = fs.readFileSync('src/components/resume/SortableBullet.tsx', 'utf-8');

// Container margins
content = content.replace(
  'className="group/bullet relative flex items-start gap-1 text-xs text-[#1F1F1B]/90 leading-relaxed -ml-6 pl-6 rounded transition-colors focus-within:bg-[#F6F1E7]/20 hover:bg-[#F6F1E7]/20"',
  'className="group/bullet relative flex items-start gap-1 text-[16px] md:text-xs text-[#1F1F1B]/90 leading-relaxed md:-ml-6 md:pl-6 rounded transition-colors focus-within:bg-[#F6F1E7]/20 hover:bg-[#F6F1E7]/20"'
);

// Drag handle hidden on mobile
content = content.replace(
  'className="absolute left-1 top-1 opacity-0 group-hover/bullet:opacity-100 focus-within:opacity-100 transition-opacity flex items-center justify-center p-0.5 text-[#6E6A62] hover:text-[#1F1F1B] rounded cursor-grab active:cursor-grabbing outline-none focus-visible:ring-1 focus-visible:ring-[#AAC06A]"',
  'className="hidden md:flex absolute left-1 top-1 opacity-0 group-hover/bullet:opacity-100 focus-within:opacity-100 transition-opacity items-center justify-center p-0.5 text-[#6E6A62] hover:text-[#1F1F1B] rounded cursor-grab active:cursor-grabbing outline-none focus-visible:ring-1 focus-visible:ring-[#AAC06A]"'
);

// Textarea
content = content.replace(
  'className="flex-1 bg-transparent border-0 outline-none text-xs text-[#1F1F1B]/90 leading-relaxed p-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60"',
  'className="flex-1 bg-transparent border-0 outline-none text-[16px] md:text-xs text-[#1F1F1B]/90 leading-relaxed p-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60"'
);

// Menu Button
content = content.replace(
  'className="opacity-0 group-hover/bullet:opacity-100 focus-within:opacity-100 p-1 text-[#6E6A62] hover:text-[#1F1F1B] rounded transition-opacity cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-[#AAC06A]"',
  'className="opacity-100 md:opacity-0 md:group-hover/bullet:opacity-100 md:focus-within:opacity-100 p-1 text-[#6E6A62] hover:text-[#1F1F1B] rounded transition-opacity cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-[#AAC06A]"'
);

fs.writeFileSync('src/components/resume/SortableBullet.tsx', content, 'utf-8');
console.log('SortableBullet updated.');

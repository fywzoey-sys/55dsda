const fs = require('fs');
let content = fs.readFileSync('src/components/Toolbar.tsx', 'utf-8');

// Modify left info layout
content = content.replace(
  '<div className="flex items-center gap-3">',
  '<div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">'
);

content = content.replace(
  '<span className="font-semibold text-sm text-[#1F1F1B]">',
  '<span className="font-semibold text-sm text-[#1F1F1B] truncate max-w-[140px] sm:max-w-xs">'
);

content = content.replace(
  '<span className="text-[11px] text-[#6E6A62] font-medium hidden sm:inline-block">',
  '<span className="text-[11px] text-[#6E6A62] font-medium hidden lg:inline-block">'
);

// Modify Right Controls
content = content.replace(
  '<div className="flex items-center">',
  '<div className="hidden lg:flex items-center">'
);

content = content.replace(
  '<button\n          type="button"\n          disabled\n          aria-disabled="true"\n          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#6E6A62] bg-[#E2DACF]/40 cursor-not-allowed opacity-80"\n          title="Available in Phase 5"\n        >\n          <Eye className="w-3.5 h-3.5" />\n          <span className="hidden md:inline">Preview</span>\n        </button>',
  '<button\n          type="button"\n          disabled\n          aria-disabled="true"\n          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#6E6A62] bg-[#E2DACF]/40 cursor-not-allowed opacity-80"\n          title="Available in Phase 5"\n        >\n          <Eye className="w-3.5 h-3.5" />\n          <span>Preview</span>\n        </button>'
);

content = content.replace(
  '<button\n          type="button"\n          disabled\n          aria-disabled="true"\n          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-[#6E6A62] bg-[#E2DACF]/40 cursor-not-allowed opacity-80"\n          title="Available in Phase 5"\n        >',
  '<button\n          type="button"\n          disabled\n          aria-disabled="true"\n          className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-[#6E6A62] bg-[#E2DACF]/40 cursor-not-allowed opacity-80"\n          title="Available in Phase 5"\n        >'
);

fs.writeFileSync('src/components/Toolbar.tsx', content, 'utf-8');
console.log('Toolbar updated.');

const fs = require('fs');
let content = fs.readFileSync('src/components/RightPanel.tsx', 'utf-8');

// 1. Add onClose to props
content = content.replace(
  'interface RightPanelProps {',
  `import { X } from 'lucide-react';\n\ninterface RightPanelProps {\n  onClose?: () => void;`
);

content = content.replace(
  'resume,',
  'resume,\n  onClose,'
);

// 2. Add Mobile Header
const headerHtml = `
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between mb-4">
        <h2 className="font-semibold text-sm text-[#1F1F1B]">Context</h2>
        <button
          type="button"
          onClick={onClose}
          className="w-11 h-11 flex items-center justify-center rounded-lg bg-white/50 text-[#1F1F1B] hover:bg-white/80 transition-colors cursor-pointer"
          aria-label="Close context panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Top Tabs */}
`;

content = content.replace('{/* Top Tabs */}', headerHtml);

fs.writeFileSync('src/components/RightPanel.tsx', content, 'utf-8');
console.log('RightPanel updated.');

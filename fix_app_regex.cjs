const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/      console\.warn\('LocalStorage data failed comprehensive validation, falling back to mock data safely\.'\);\n    \}\n  \} catch \(err\) \{\n    console\.warn\('Failed to parse resumes from LocalStorage, falling back to mock data:', err\);\n  \}\n\n  \/\/ Safe fallback to deep-cloned initial mock data\n  return JSON\.parse\(JSON\.stringify\(mockResumes\)\);\n\}\n/, '');

fs.writeFileSync('src/App.tsx', content);

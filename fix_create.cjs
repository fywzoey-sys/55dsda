const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /sections: \[\s*\{ id: 'sec-edu', type: 'education', title: 'Education', items: \[\] \},\s*\{ id: 'sec-exp', type: 'experience', title: 'Experience', items: \[\] \},\s*\{ id: 'sec-proj', type: 'projects', title: 'Projects', items: \[\] \},\s*\],/,
  `sections: [
        { 
          id: 'sec-edu', type: 'education', title: 'Education', 
          items: [{ id: \`edu-\${Date.now()}\`, school: '', degree: '', startDate: '', endDate: '' }] 
        },
        { 
          id: 'sec-exp', type: 'experience', title: 'Experience', 
          items: [{ id: \`exp-\${Date.now()}\`, company: '', role: '', startDate: '', endDate: '', bullets: [{ id: \`bul-\${Date.now()}\`, text: '' }] }] 
        },
        { 
          id: 'sec-proj', type: 'projects', title: 'Projects', 
          items: [{ id: \`proj-\${Date.now()}\`, name: '', role: '', startDate: '', endDate: '', bullets: [{ id: \`pbul-\${Date.now()}\`, text: '' }] }] 
        },
      ],`
);

fs.writeFileSync('src/App.tsx', content);

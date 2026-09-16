import { parseResumeText } from '../src/utils/textResumeParser.ts';
import assert from 'assert/strict';

const testResume = `Alex Chen
Analyst
alex@example.com | San Francisco

Education
University A
B.A. Economics
2020-09 - 2024-06

University B
M.S. Analytics
2024-09 - 2026-06

Experience
Acme Labs
Product Intern
2024-06 - 2024-09
Remote
- Tested the resume import flow.
- Documented parser issues.

Beta Studio
Research Intern
2025-01 - Present
2. Conducted user interviews.
（2）整理访谈记录。`;

const parsed = parseResumeText(testResume);

// 1. Check sections
assert.equal(parsed.sections.length, 2, 'Should have Education and Experience sections');

const edu = parsed.sections.find(s => s.type === 'education');
assert.equal(edu.items.length, 2, 'Should have 2 Education items');

// Check ISO Date
assert.equal(edu.items[0].startDate, '2020-09', 'First edu start date');
assert.equal(edu.items[0].endDate, '2024-06', 'First edu end date');
assert.equal(edu.items[1].startDate, '2024-09', 'Second edu start date');

const exp = parsed.sections.find(s => s.type === 'experience');
assert.equal(exp.items.length, 2, 'Should have 2 Experience items');

// Check bullets and numbering
assert.equal(exp.items[1].bullets.length, 2, 'Second exp should have 2 bullets');
assert.equal(exp.items[1].bullets[0].text, 'Conducted user interviews.');
assert.equal(exp.items[1].bullets[1].text, '整理访谈记录。');

// Check unconsumed / unrecognized
assert.ok(parsed.unrecognizedLines.includes('Remote'), 'Remote should be in unrecognizedLines');
assert.ok(parsed.warnings.some(w => w.message.includes('not recognized')), 'Should have warning about unrecognized lines');

// Test Chinese date with 至今
const chineseDateText = `
Experience
Test Co
Role
2024.06 – 至今
- 123
`;
const parsedZh = parseResumeText(chineseDateText);
const expZh = parsedZh.sections.find(s => s.type === 'experience');
assert.equal(expZh.items[0].startDate, '2024.06');
assert.equal(expZh.items[0].endDate, '至今');

// Test HTML strings remain plain text
const htmlText = `
Experience
<b>Test Co</b>
Role
2024 - 2025
- <img src=x onerror=alert(1)>
`;
const parsedHtml = parseResumeText(htmlText);
const expHtml = parsedHtml.sections.find(s => s.type === 'experience');
assert.equal(expHtml.items[0].company, '<b>Test Co</b>');
assert.equal(expHtml.items[0].bullets[0].text, '<img src=x onerror=alert(1)>');

console.log("All assertions passed!");

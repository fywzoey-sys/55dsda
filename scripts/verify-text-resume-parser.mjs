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

// Test Chinese compact date without delimiter (2024年6月至今)
const chineseCompactText = `
Experience
Test Co Compact
Role
2024年6月至今
- Worked on features
`;
const parsedCompact = parseResumeText(chineseCompactText);
const expCompact = parsedCompact.sections.find(s => s.type === 'experience');
assert.equal(expCompact.items[0].startDate, '2024年6月');
assert.equal(expCompact.items[0].endDate, '至今');

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

// --- Phase 4A Regression Tests ---

// 1. October 2024 to Present
const octDateText = `
Experience
Beta Corp
Engineer
October 2024 to Present
- Built features
`;
const parsedOct = parseResumeText(octDateText);
const expOct = parsedOct.sections.find(s => s.type === 'experience');
assert.equal(expOct.items[0].startDate, 'October 2024');
assert.equal(expOct.items[0].endDate, 'Present');

// Additional date ranges
const moreDatesText = `
Experience
Company A
Role A
June 2024 to September 2024

Company B
Role B
2024年6月至2024年9月
`;
const parsedMoreDates = parseResumeText(moreDatesText);
const expMore = parsedMoreDates.sections.find(s => s.type === 'experience');
assert.equal(expMore.items[0].startDate, 'June 2024');
assert.equal(expMore.items[0].endDate, 'September 2024');
assert.equal(expMore.items[1].startDate, '2024年6月');
assert.equal(expMore.items[1].endDate, '2024年9月');

// 2. Company -> Date -> Role order (Format B)
const orderBText = `
Experience
Acme
2024-06 - 2024-09
Product Intern
`;
const parsedOrderB = parseResumeText(orderBText);
const expB = parsedOrderB.sections.find(s => s.type === 'experience');
assert.equal(expB.items[0].company, 'Acme');
assert.equal(expB.items[0].role, 'Product Intern');
assert.equal(expB.items[0].startDate, '2024-06');
assert.equal(expB.items[0].endDate, '2024-09');

// 3. Company -> Role -> Date order (Format A)
const orderAText = `
Experience
Acme
Product Intern
2024-06 - 2024-09
`;
const parsedOrderA = parseResumeText(orderAText);
const expA = parsedOrderA.sections.find(s => s.type === 'experience');
assert.equal(expA.items[0].company, 'Acme');
assert.equal(expA.items[0].role, 'Product Intern');
assert.equal(expA.items[0].startDate, '2024-06');
assert.equal(expA.items[0].endDate, '2024-09');

// 4. Pipe-separated inline Experience
const pipeText = `
Experience
Acme | Product Intern | 2024-06 - 2024-09
- Handled deliveries
`;
const parsedPipe = parseResumeText(pipeText);
const expPipe = parsedPipe.sections.find(s => s.type === 'experience');
assert.equal(expPipe.items[0].company, 'Acme');
assert.equal(expPipe.items[0].role, 'Product Intern');
assert.equal(expPipe.items[0].startDate, '2024-06');
assert.equal(expPipe.items[0].endDate, '2024-09');

// 5. Recognized Role is not added to unrecognizedLines
assert.ok(!parsedOrderA.unrecognizedLines.includes('Product Intern'), 'Recognized Role should not be in unrecognizedLines (order A)');
assert.ok(!parsedOrderB.unrecognizedLines.includes('Product Intern'), 'Recognized Role should not be in unrecognizedLines (order B)');
assert.ok(!parsedPipe.unrecognizedLines.includes('Product Intern'), 'Recognized Role should not be in unrecognizedLines (pipe)');

// 6. Additional unused lines are added to unrecognizedLines
const unusedLinesText = `
Experience
Acme
2024-06 - 2024-09
Product Intern
Extra Note Line 1
Extra Note Line 2
`;
const parsedUnused = parseResumeText(unusedLinesText);
assert.ok(parsedUnused.unrecognizedLines.includes('Extra Note Line 1'), 'Extra Note Line 1 should be in unrecognizedLines');
assert.ok(parsedUnused.unrecognizedLines.includes('Extra Note Line 2'), 'Extra Note Line 2 should be in unrecognizedLines');

// Check missing role warning
const missingRoleText = `
Experience
Acme Only
2024-06 - 2024-09
`;
const parsedMissingRole = parseResumeText(missingRoleText);
assert.ok(parsedMissingRole.warnings.some(w => w.message.includes('missing Role')), 'Should have warning when Role is missing');

console.log("All assertions passed!");

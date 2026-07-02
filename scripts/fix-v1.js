const fs = require('fs');
let content = fs.readFileSync('./app/index.html', 'utf8');

// Fix 1: generateQuestionForVector
const old1 = "type: '2→0', cardId: card.id,\n      text: `药物组合\u201C${core}\u201D对应哪个方？`,\n      correct: card.id,";
const new1 = "type: '2→0', cardId: card.id,\n      text: `药物组合\u201C${core}\u201D对应哪个方？`,\n      correct: card.name,";

if (content.includes(old1)) {
  content = content.replace(old1, new1);
  console.log('Fix 1: generateQuestionForVector - OK');
} else {
  console.log('Fix 1: pattern not found');
}

// Fix 2: generateQuestions
const old2 = "type: '2→0',\n      text: `药物组合\u201C${coreCombo}\u201D对应哪个方？`,\n      correct: card.id,";
const new2 = "type: '2→0',\n      text: `药物组合\u201C${coreCombo}\u201D对应哪个方？`,\n      correct: card.name,";

if (content.includes(old2)) {
  content = content.replace(old2, new2);
  console.log('Fix 2: generateQuestions - OK');
} else {
  console.log('Fix 2: pattern not found');
}

fs.writeFileSync('./app/index.html', content, 'utf8');
console.log('Done');

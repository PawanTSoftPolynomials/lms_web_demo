const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else if (filePath.endsWith('.jsx') || filePath.endsWith('.tsx')) {
      results.push(filePath);
    }
  });
  return results;
}

const files = walk('src/components').concat(walk('src/app'));

let changedFiles = 0;
files.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content
    .replace(/border-slate-[6789]00/g, 'border-transparent')
    .replace(/border-gray-[6789]00/g, 'border-transparent')
    .replace(/border-slate-800\/50/g, 'border-transparent');
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    changedFiles++;
  }
});

console.log(`Replaced hardcoded dark borders in ${changedFiles} files.`);

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
    .replace(/bg-\[#080B11\]/g, 'bg-background')
    .replace(/bg-\[#0D1021\]/g, 'bg-card')
    .replace(/bg-\[#1A1F35\]/g, 'bg-muted')
    .replace(/bg-slate-950/g, 'bg-background')
    .replace(/bg-slate-900/g, 'bg-background')
    .replace(/bg-slate-800/g, 'bg-card');
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    changedFiles++;
  }
});

console.log(`Replaced hardcoded dark backgrounds in ${changedFiles} files.`);

const fs = require('fs');
let c = fs.readFileSync('src/app/globals.css', 'utf8');
c = c.replace(/@import url\('[^']+'\);\n/g, '');
c = "@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&display=swap');\n" + c;
fs.writeFileSync('src/app/globals.css', c);
console.log('Fixed imports order');

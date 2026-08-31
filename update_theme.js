const fs = require('fs');
let css = fs.readFileSync('src/app/globals.css', 'utf8');

css = css.replace(/@import url\('[^']+'\);\n?/g, '');
css = "@import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap');\n" + css;

const varsStart = css.indexOf(':root {');
const varsEnd = css.indexOf('/* Light mode: mirror-invert');
if (varsStart !== -1 && varsEnd !== -1) {
  const terminalVars = \
:root, .dark {
  --background: #000000;
  --foreground: #ffffff;

  --surface: #000000;
  --surface-foreground: #ffffff;
  --surface-muted: #111111;

  --card: #000000;
  --card-foreground: #ffffff;
  --card-border: #333333;

  --popover: #000000;
  --popover-foreground: #ffffff;

  --muted: #111111;
  --muted-foreground: #888888;

  --border: #333333;
  --input: #111111;
  --ring: #ffffff;

  --primary: #ffffff;
  --primary-foreground: #000000;

  --secondary: #333333;
  --secondary-foreground: #ffffff;

  --accent: #ffffff;
  --accent-foreground: #000000;

  --destructive: #ff0000;
  --destructive-foreground: #ffffff;

  --success: #ffffff;
  --success-foreground: #000000;
  --warning: #aaaaaa;
  --warning-foreground: #000000;

  --shadow-color: 0 0% 0%;
}
\;
  css = css.substring(0, varsStart) + terminalVars + css.substring(varsEnd);
}

const bodyStart = css.indexOf('body {');
const bodyEnd = css.indexOf('}', bodyStart) + 1;
if (bodyStart !== -1) {
  const terminalBody = \
body {
  background-color: #000000;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 30px 30px;
  background-attachment: fixed;
  color: var(--foreground);
  overflow-x: hidden;
  font-family: "Space Mono", monospace !important;
}
\;
  css = css.substring(0, bodyStart) + terminalBody + css.substring(bodyEnd);
}

const overridesStart = css.indexOf('/* MINDORA UI KIT OVERRIDES */');
if (overridesStart !== -1) {
  const terminalOverrides = \
/* TERMINAL UI OVERRIDES */
* {
  font-family: "Space Mono", monospace !important;
}

button, 
input, 
select, 
.btn-rainbow,
a[class*="bg-primary"],
a[class*="bg-slate-800"] {
  border-radius: 0px !important;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: bold;
}

input, select {
  background-color: #000000 !important;
  border: 1px solid #555555 !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

.bg-card, 
.bg-surface, 
.bg-popover, 
.card-photo-jellyfish {
  border-radius: 0px !important;
  border: 1px solid #333333 !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  background-color: #000000 !important;
  background-image: none !important;
}

.bg-muted > div[class*="bg-"] {
  border-radius: 0px !important;
}

[class*="bg-[#090D16]"],
[class*="bg-[#0D1021]"],
[class*="bg-[#05070E]"],
[class*="bg-[#111827]"],
[class*="bg-[#0d0e16]"],
[class*="bg-[#080B11]"],
[class*="bg-[#07080f]"],
.bg-card,
.bg-surface,
.bg-popover,
.bg-muted {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}
\;
  css = css.substring(0, overridesStart) + terminalOverrides;
}

fs.writeFileSync('src/app/globals.css', css);
console.log('Successfully updated globals.css with Terminal style!');

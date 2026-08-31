const fs = require('fs');
const content = fs.readFileSync('src/app/globals.css', 'utf8');

const remapIndex = content.indexOf('/* Global chrome remap');
const chromeRemap = remapIndex !== -1 ? content.substring(remapIndex) : '';

const newGlobals = `@import "tailwindcss";
@plugin "@tailwindcss/typography";
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&display=swap');

@custom-variant dark (&:where(.dark, .dark *));

.prose table { display: block; overflow-x: auto; max-width: 100%; }

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
  --input: #000000;
  --ring: #ffffff;
  --primary: #ffffff;
  --primary-foreground: #000000;
  --secondary: #222222;
  --secondary-foreground: #ffffff;
  --accent: #333333;
  --accent-foreground: #ffffff;
  --destructive: #ff3333;
  --destructive-foreground: #000000;
  --success: #ffffff;
  --success-foreground: #000000;
  --warning: #888888;
  --warning-foreground: #000000;
  --shadow-color: 0 0% 0%;
  --heading-color: #ffffff;
}

@theme inline {
  --color-heading: var(--heading-color);
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-destructive: var(--destructive);
}

.card-photo-jellyfish {
  --card-photo-bg-from: #000000;
  --card-photo-bg-to: #000000;
  --card-photo-border: #333333;
  --card-photo-h1: #ffffff;
  --card-photo-subtitle: #888888;
  --card-photo-highlight: #ffffff;
}

body {
  background-color: #000000 !important;
  background-image: none !important;
  color: #ffffff;
  font-family: "JetBrains Mono", monospace;
  -webkit-font-smoothing: antialiased;
}

/* TERMINAL / BRUTALIST OVERRIDES */
* {
  border-radius: 0px !important;
}

.bg-card, .bg-surface, .bg-popover, .card-photo-jellyfish, input, select {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  box-shadow: none !important;
  background-color: #000000 !important;
  border: 1px solid #333333 !important;
  color: #ffffff !important;
}

button, a[class*="bg-"], .btn-rainbow {
  border: 1px solid #333333 !important;
  backdrop-filter: none !important;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 0px !important;
}

button.bg-primary, a.bg-primary, .btn-rainbow {
  background-color: #ffffff !important;
  color: #000000 !important;
  border-color: #ffffff !important;
  font-weight: bold;
}

button.bg-primary:hover, a.bg-primary:hover, .btn-rainbow:hover {
  background-color: #333333 !important;
  color: #ffffff !important;
  border-color: #ffffff !important;
}

h1, h2, h3, h4, .text-xl, .text-2xl, .text-3xl, .text-4xl, .text-5xl,
[class*="text-lg"][class*="font-semibold"],
[class*="text-lg"][class*="font-bold"] {
  font-family: "JetBrains Mono", monospace !important;
  font-weight: 800 !important;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #ffffff !important;
}

.bg-muted > div[class*="bg-"] {
  background-color: #ffffff !important;
}
`;

fs.writeFileSync('src/app/globals.css', newGlobals + '\n\n' + chromeRemap);
console.log('CSS updated successfully!');

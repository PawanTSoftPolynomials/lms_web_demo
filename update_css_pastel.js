const fs = require('fs');
const content = fs.readFileSync('src/app/globals.css', 'utf8');

const remapIndex = content.indexOf('/* Global chrome remap');
const chromeRemap = remapIndex !== -1 ? content.substring(remapIndex) : '';

const newGlobals = `@import "tailwindcss";
@plugin "@tailwindcss/typography";

@custom-variant dark (&:where(.dark, .dark *));

.prose table { display: block; overflow-x: auto; max-width: 100%; }

:root, .dark {
  --background: #F3EFE9;
  --foreground: #4A4641;
  
  --surface: #F3EFE9;
  --surface-foreground: #4A4641;
  --surface-muted: #E8E3DC;
  
  --card: #F3EFE9;
  --card-foreground: #4A4641;
  --card-border: transparent;
  
  --popover: #F3EFE9;
  --popover-foreground: #4A4641;
  
  --muted: #E8E3DC;
  --muted-foreground: #8C867F;
  
  --border: transparent;
  --input: #F3EFE9;
  --ring: #A9C6D9; /* Pastel Blue */
  
  --primary: #B1C8B9; /* Pastel Green */
  --primary-foreground: #4A4641;
  
  --secondary: #A9C6D9; /* Pastel Blue */
  --secondary-foreground: #4A4641;
  
  --accent: #F1D3D3; /* Pastel Pink */
  --accent-foreground: #4A4641;
  
  --success: #B1C8B9;
  --success-foreground: #4A4641;
  --warning: #F1D3D3;
  --warning-foreground: #4A4641;
  --destructive: #F1D3D3;
  --destructive-foreground: #4A4641;
  
  --heading-color: #2F2C29;
}

@theme inline {
  --color-heading: var(--heading-color);
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-destructive: var(--destructive);
}

.card-photo-jellyfish {
  --card-photo-bg-from: #F3EFE9;
  --card-photo-bg-to: #F3EFE9;
  --card-photo-border: transparent;
  --card-photo-h1: #2F2C29;
  --card-photo-subtitle: #8C867F;
  --card-photo-highlight: #B1C8B9;
}

body {
  background-color: var(--background) !important;
  background-image: none !important;
  color: var(--foreground);
  font-family: "Nunito", sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* NEUMORPHISM / CLAYMORPHISM OVERRIDES */

/* Soft 3D extruded look for cards */
.bg-card, .bg-surface, .bg-popover, .card-photo-jellyfish {
  background-color: var(--card) !important;
  border: 2px solid rgba(255,255,255,0.4) !important;
  border-radius: 32px !important;
  box-shadow: 12px 12px 24px #d8d3cc, -12px -12px 24px #ffffff !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

/* Pressed-in look for inputs */
input, select {
  background-color: var(--background) !important;
  border: none !important;
  border-radius: 9999px !important;
  box-shadow: inset 6px 6px 12px #d8d3cc, inset -6px -6px 12px #ffffff !important;
  color: var(--foreground) !important;
}

/* Extruded pill buttons */
button, a[class*="bg-"], .btn-rainbow {
  border: 2px solid rgba(255,255,255,0.3) !important;
  border-radius: 9999px !important;
  box-shadow: 6px 6px 12px #d8d3cc, -6px -6px 12px #ffffff !important;
  backdrop-filter: none !important;
  text-transform: none;
  letter-spacing: normal;
  transition: all 0.2s ease;
}

/* Primary buttons */
button.bg-primary, a.bg-primary, .btn-rainbow {
  background-color: var(--primary) !important;
  color: var(--primary-foreground) !important;
  font-weight: 800;
}

button:active, a.bg-primary:active, .btn-rainbow:active {
  box-shadow: inset 4px 4px 8px #d8d3cc, inset -4px -4px 8px #ffffff !important;
  transform: scale(0.98);
}

/* Typography fixes */
h1, h2, h3, h4, .text-xl, .text-2xl, .text-3xl, .text-4xl, .text-5xl,
[class*="text-lg"][class*="font-semibold"],
[class*="text-lg"][class*="font-bold"] {
  font-family: "Nunito", sans-serif !important;
  font-weight: 900 !important;
  text-transform: none;
  letter-spacing: -0.02em;
  color: var(--heading-color) !important;
}

.bg-muted > div[class*="bg-"] {
  background-color: var(--primary) !important;
  border-radius: 9999px !important;
}
`;

fs.writeFileSync('src/app/globals.css', newGlobals + '\n\n' + chromeRemap);
console.log('Neumorphism CSS applied successfully!');

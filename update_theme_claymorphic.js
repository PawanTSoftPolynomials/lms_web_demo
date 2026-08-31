const fs = require('fs');

const css = \
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
@import "tailwindcss";
@plugin "@tailwindcss/typography";

@custom-variant dark (&:where(.dark, .dark *));

:root, .dark {
  --background: #f3efe7;
  --foreground: #4a433e;

  --surface: #faf6f0;
  --surface-foreground: #4a433e;
  --surface-muted: #e6e0d6;

  --card: #f9f5ed;
  --card-foreground: #4a433e;
  --card-border: #ffffff;

  --popover: #f9f5ed;
  --popover-foreground: #4a433e;

  --muted: #e8e2d8;
  --muted-foreground: #8a8175;

  --border: #e6e0d6;
  --input: #ffffff;
  --ring: #b6d2c4;

  --primary: #b6d2c4;
  --primary-foreground: #3a4a42;

  --secondary: #b5d5dc;
  --secondary-foreground: #37464a;

  --accent: #edd3d5;
  --accent-foreground: #4f3d3f;

  --destructive: #eb9a9a;
  --destructive-foreground: #5a3131;

  --success: #a3c9a8;
  --success-foreground: #2d4530;
  --warning: #f5d491;
  --warning-foreground: #5c4721;

  --heading-color: #3b3531;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-heading: var(--heading-color);
}

body {
  background-color: var(--background);
  color: var(--foreground);
  overflow-x: hidden;
  font-family: "Nunito", sans-serif !important;
}

/* CLAYMORPHISM GLOBAL OVERRIDES */
* {
  font-family: "Nunito", sans-serif !important;
}

h1, h2, h3, h4, h5, h6, .text-xl, .text-2xl, .text-3xl, .text-4xl, .text-5xl, [class*="text-lg"][class*="font-semibold"], [class*="text-lg"][class*="font-bold"] {
  font-weight: 800 !important;
  color: var(--heading-color) !important;
  letter-spacing: -0.02em;
}

/* Make everything super pill shaped */
[class*="rounded"], button, input, select, .bg-card, .bg-surface, .bg-popover, .card-photo-jellyfish {
  border-radius: 2rem !important;
}
.rounded-full, .rounded-full * {
  border-radius: 9999px !important;
}

/* Overriding extreme black/white classes from original */
[class*="bg-white"],
[class*="bg-slate-"],
[class*="bg-[#"],
[class*="bg-gray-"],
.bg-white,
.bg-slate-950,
.bg-slate-900 {
  background-color: var(--card) !important;
  color: var(--foreground) !important;
  border-color: #ffffff !important;
  border-width: 2px !important;
  box-shadow: 
    8px 8px 16px rgba(181, 172, 161, 0.3),
    -8px -8px 16px rgba(255, 255, 255, 0.8) !important;
}

/* Except code blocks */
pre, code, .hljs, [class*="language-"] {
  background-color: #f0ebe1 !important;
  box-shadow: inset 4px 4px 8px rgba(181, 172, 161, 0.3), inset -4px -4px 8px rgba(255, 255, 255, 0.8) !important;
  border: none !important;
  color: #5c554e !important;
}
.hljs * {
  color: revert !important;
}

button, .btn-rainbow, a[class*="bg-primary"], a[class*="bg-slate-800"] {
  background-color: var(--primary) !important;
  color: var(--primary-foreground) !important;
  font-weight: 800 !important;
  border: 2px solid rgba(255, 255, 255, 0.5) !important;
  box-shadow: 
    6px 6px 12px rgba(181, 172, 161, 0.4),
    -6px -6px 12px rgba(255, 255, 255, 0.9) !important;
  transition: all 0.2s ease !important;
}

button:active, .btn-rainbow:active, a[class*="bg-primary"]:active {
  box-shadow: 
    inset 4px 4px 8px rgba(181, 172, 161, 0.4),
    inset -4px -4px 8px rgba(255, 255, 255, 0.9) !important;
  transform: translateY(2px) !important;
}

input, select, textarea {
  background-color: #ebe4d8 !important;
  border: 2px solid #ffffff !important;
  box-shadow: inset 4px 4px 8px rgba(181, 172, 161, 0.3), inset -4px -4px 8px rgba(255, 255, 255, 0.8) !important;
  color: var(--foreground) !important;
}

[class*="text-slate-"], [class*="text-gray-"], [class*="text-white"] {
  color: var(--foreground) !important;
}

/* Specific colored pills (Mint, Blue, Pink) */
[class*="bg-orange-500"], [class*="bg-primary"] {
  background-color: var(--primary) !important; /* Sage green */
}
[class*="bg-teal-500"], [class*="bg-secondary"] {
  background-color: var(--secondary) !important; /* Powder blue */
}
[class*="bg-pink-500"], [class*="bg-accent"] {
  background-color: var(--accent) !important; /* Soft pink */
}

/* Chrome remap fallbacks */
[class~="to-[#12182B]"] { --tw-gradient-to: var(--surface); }
[class~="via-[#0D1021]"] { --tw-gradient-via: var(--surface); }
\;

fs.writeFileSync('src/app/globals.css', css);
console.log('Successfully updated globals.css with Claymorphism style!');

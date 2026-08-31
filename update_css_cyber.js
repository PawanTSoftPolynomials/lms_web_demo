const fs = require('fs');

const newGlobals = `@import "tailwindcss";
@plugin "@tailwindcss/typography";

@custom-variant dark (&:where(.dark, .dark *));

.prose table { display: block; overflow-x: auto; max-width: 100%; }

:root, .dark {
  --background: #090B0F;
  --foreground: #D1D6E0;
  
  --surface: #10141C;
  --surface-foreground: #D1D6E0;
  --surface-muted: #181D29;
  
  --card: #10141C;
  --card-foreground: #D1D6E0;
  --card-border: #1E2433;
  
  --popover: #10141C;
  --popover-foreground: #D1D6E0;
  
  --muted: #181D29;
  --muted-foreground: #7E8A9F;
  
  --border: #1E2433;
  --input: #10141C;
  --ring: #D4A352;
  
  --primary: #D4A352;
  --primary-foreground: #090B0F;
  
  --secondary: #181D29;
  --secondary-foreground: #D4A352;
  
  --accent: #D4A352;
  --accent-foreground: #090B0F;
  
  --success: #4ade80;
  --success-foreground: #090B0F;
  --warning: #facc15;
  --warning-foreground: #090B0F;
  --destructive: #f87171;
  --destructive-foreground: #090B0F;
  
  --heading-color: #E8C17A;
}

body {
  background-color: var(--background) !important;
  background-image: none !important;
  color: var(--foreground);
  font-family: "Inter", sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* CYBER GOLD THEME OVERRIDES */

.bg-card, .bg-surface, .bg-popover, .card-photo-jellyfish {
  background-color: var(--card) !important;
  border: 1px solid var(--border) !important;
  border-radius: 20px !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6) !important;
  backdrop-filter: blur(10px) !important;
  -webkit-backdrop-filter: blur(10px) !important;
  transition: all 0.3s ease;
}

.bg-card:hover, .card-photo-jellyfish:hover {
  border-color: rgba(212, 163, 82, 0.3) !important;
  box-shadow: 0 0 25px rgba(212, 163, 82, 0.1) !important;
}

input, select {
  background-color: var(--surface-muted) !important;
  border: 1px solid var(--border) !important;
  border-radius: 8px !important;
  color: var(--foreground) !important;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.3) !important;
  padding: 0.75rem 1rem !important;
}

input:focus, select:focus {
  border-color: var(--primary) !important;
  box-shadow: 0 0 10px rgba(212, 163, 82, 0.2) !important;
  outline: none;
}

button, a[class*="bg-"], .btn-rainbow {
  border-radius: 9999px !important;
  box-shadow: none !important;
  font-weight: 600;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

/* Glowing Primary Buttons */
button.bg-primary, a.bg-primary, .btn-rainbow {
  background-color: transparent !important;
  color: var(--primary) !important;
  border: 1px solid var(--primary) !important;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: inset 0 0 10px rgba(212, 163, 82, 0.1) !important;
}

button.bg-primary:hover, a.bg-primary:hover, .btn-rainbow:hover {
  background-color: var(--primary) !important;
  color: var(--primary-foreground) !important;
  box-shadow: 0 0 20px rgba(212, 163, 82, 0.4), inset 0 0 10px rgba(255,255,255,0.2) !important;
  transform: translateY(-1px);
}

/* Typography fixes */
h1, h2, h3, h4, .text-xl, .text-2xl, .text-3xl, .text-4xl, .text-5xl,
[class*="text-lg"][class*="font-semibold"],
[class*="text-lg"][class*="font-bold"] {
  font-family: "Inter", sans-serif !important;
  font-weight: 600 !important;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--heading-color) !important;
}

/* Special text glow on very prominent titles */
h1 {
  text-shadow: 0 0 15px rgba(232, 193, 122, 0.3);
}

.bg-muted > div[class*="bg-"] {
  background-color: var(--primary) !important;
  border-radius: 9999px !important;
  box-shadow: 0 0 10px rgba(212, 163, 82, 0.5) !important;
}

/* Scrollbar styling for dark theme */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: var(--background);
}
::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--muted-foreground);
}
`;

fs.writeFileSync('src/app/globals.css', newGlobals);
console.log('Cyber Gold CSS applied successfully!');

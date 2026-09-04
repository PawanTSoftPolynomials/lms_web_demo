const fs = require('fs');
let css = fs.readFileSync('src/app/globals.css', 'utf8');

// Remove the mirror invert block
css = css.replace(/\/\* Light mode: mirror-invert[\s\S]*?--color-slate-950: #fdfdfd;\n\}/g, '');

const overridesStart = css.indexOf('/* TERMINAL UI OVERRIDES */');
if (overridesStart !== -1) {
  let terminalOverrides = css.substring(overridesStart);
  terminalOverrides += "\n/* EXTREME GLOBAL OVERRIDES FOR TERMINAL THEME */\n" +
"[class*=\"bg-white\"],\n" +
"[class*=\"bg-slate-\"],\n" +
"[class*=\"bg-gray-\"],\n" +
"[class*=\"bg-[#\"],\n" +
".bg-white {\n" +
"  background-color: #000000 !important;\n" +
"  color: #ffffff !important;\n" +
"  border-color: #333333 !important;\n" +
"}\n\n" +
"[class*=\"text-slate-800\"],\n" +
"[class*=\"text-slate-900\"],\n" +
"[class*=\"text-gray-800\"],\n" +
"[class*=\"text-gray-900\"] {\n" +
"  color: #ffffff !important;\n" +
"}\n\n" +
"[class*=\"rounded-xl\"],\n" +
"[class*=\"rounded-2xl\"],\n" +
"[class*=\"rounded-3xl\"],\n" +
"[class*=\"rounded-lg\"],\n" +
"[class*=\"rounded-md\"],\n" +
"[class*=\"rounded-full\"],\n" +
"[class*=\"rounded\"] {\n" +
"  border-radius: 0px !important;\n" +
"}\n\n" +
"[class*=\"shadow-md\"],\n" +
"[class*=\"shadow-lg\"],\n" +
"[class*=\"shadow-xl\"],\n" +
"[class*=\"shadow-2xl\"],\n" +
"[class*=\"shadow\"] {\n" +
"  box-shadow: none !important;\n" +
"}\n\n" +
"[class*=\"border-slate-\"],\n" +
"[class*=\"border-gray-\"] {\n" +
"  border-color: #333333 !important;\n" +
"}\n";
  css = css.substring(0, overridesStart) + terminalOverrides;
}

fs.writeFileSync('src/app/globals.css', css);
console.log('Successfully enforced Extreme Terminal style!');

const fs = require('fs');
const path = require('path');

const targetDir = process.cwd();

// Files and folders to ignore
const ignore = ['node_modules', '.git', 'dist', 'build', '.env', 'package-lock.json', 'replace-name.js'];

// Regex replacements
const replacements = [
  // Exact domain name - DO NOT REPLACE
  { regex: /zenova-dental(-1)?\.onrender\.com/gi, replacement: (match) => match },
  
  // Specific title cases
  { regex: /ZenovaDental/g, replacement: 'For Your Dentist' },
  { regex: /Zenova Dental Clinic/g, replacement: 'For Your Dentist' },
  { regex: /Zenova Dental/g, replacement: 'For Your Dentist' },
  { regex: /Zenova Clinic/g, replacement: 'For Your Dentist' },
  
  // Standalone Zenova references
  { regex: /Zenova's/g, replacement: "For Your Dentist's" },
  { regex: /Zenova /g, replacement: 'For Your Dentist ' },
  { regex: / Zenova/g, replacement: ' For Your Dentist' },
  { regex: />Zenova</g, replacement: '>For Your Dentist<' },
  { regex: /"Zenova"/g, replacement: '"For Your Dentist"' },
  { regex: /'Zenova'/g, replacement: "'For Your Dentist'" },
  
  // Avoid breaking internal variable names if possible, but if it happens, it's ok.
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    if (ignore.includes(file)) continue;
    
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (stat.isFile() && (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.html') || fullPath.endsWith('.json') || fullPath.endsWith('.md'))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      // Temporarily protect the render URL
      const tempUrlPlaceholder = '__RENDER_URL_PLACEHOLDER__';
      content = content.replace(/zenova-dental(-1)?\.onrender\.com/gi, tempUrlPlaceholder);
      
      // Apply replacements
      for (const { regex, replacement } of replacements) {
        if (typeof replacement === 'string') {
          content = content.replace(regex, replacement);
        }
      }
      
      // Also catch lowercase "zenova" if it's standalone text (not a variable)
      // Actually, to be safe, let's just replace all "Zenova"
      content = content.replace(/Zenova/g, 'For Your Dentist');
      
      // Restore render URL
      content = content.replace(new RegExp(tempUrlPlaceholder, 'g'), 'zenova-dental-1.onrender.com');
      
      if (content !== originalContent) {
        console.log(`Modified: ${fullPath}`);
        fs.writeFileSync(fullPath, content, 'utf8');
      }
    }
  }
}

processDirectory(targetDir);
console.log('Replacement complete.');

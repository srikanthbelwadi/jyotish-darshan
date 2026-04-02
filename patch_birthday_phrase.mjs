import fs from 'fs';

const FILES = [
  'src/i18n/dashboardTranslations.json',
  'src/i18n/dynamicTranslations.js',
  'src/components/tabs/PanchangTab.jsx',
  'src/components/tabs/MockDashboard.jsx'
];

for (const path of FILES) {
  if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    
    // Exact casing
    content = content.replace(/Living Birthday/g, 'Birthday');
    content = content.replace(/living birthdays/g, 'birthdays');
    content = content.replace(/Living Birthdays/g, 'Birthdays');
    content = content.replace(/living birthday/g, 'birthday');

    fs.writeFileSync(path, content, 'utf8');
  }
}

console.log('Successfully removed all instances of "living birthday" across translations and components.');

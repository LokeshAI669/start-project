const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src');

const filesToClean = [
  'pages/LandingPage.jsx',
  'pages/student/Dashboard.jsx',
  'pages/student/ProjectDetails.jsx',
  'pages/student/SubmitRequest.jsx',
  'pages/student/BrowseCatalog.jsx',
  'pages/admin/AdminDashboard.jsx',
  'pages/admin/AdminCatalog.jsx',
];

const emojisToRemove = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;

filesToClean.forEach(relPath => {
  const fullPath = path.join(srcDir, relPath);
  if (!fs.existsSync(fullPath)) return;

  let content = fs.readFileSync(fullPath, 'utf8');

  // 1. Extract what's imported from lucide-react
  const importMatch = content.match(/import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]lucide-react['"];?/);
  if (importMatch) {
    const importedIcons = importMatch[1].split(',').map(i => i.trim()).filter(Boolean);
    
    // Remove the import statement
    content = content.replace(importMatch[0], '');

    // 2. Remove all usages of those icons
    importedIcons.forEach(icon => {
      // Matches <Icon /> or <Icon size={16} /> or <Icon className="..." />
      const iconRegex = new RegExp(`<${icon}\\b[^>]*\\/?>`, 'g');
      content = content.replace(iconRegex, '');
    });
  }

  // 3. Remove Emojis
  content = content.replace(emojisToRemove, '');

  // 4. Special cases: replace icon text with actual text if needed
  // For LandingPage theme toggle, if it had <Sun/> / <Moon/> inside a button
  // the button might just be empty now. We can leave it empty or it's fine.

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Cleaned ${relPath}`);
});

const fs = require('fs');
const files = [
  'public/login.html', 'public/register.html', 'public/reset-password.html',
  'public/index.html', 'public/admin.html', 'public/browse.html',
  'public/dashboard.html', 'public/project.html', 'public/request.html',
  'public/admin/catalog.html'
];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/styles\.css\?v=\d+/g, 'styles.css?v=9');
  fs.writeFileSync(f, content);
  console.log('Updated cache version in ' + f);
});

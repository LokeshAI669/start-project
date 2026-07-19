const fs = require('fs');
const files = [
  'public/admin.html', 'public/browse.html',
  'public/dashboard.html', 'public/project.html', 'public/request.html',
  'public/admin/catalog.html'
];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let content = fs.readFileSync(f, 'utf8');
  
  // Use regex to capture the href attribute dynamically and replace the inner content
  content = content.replace(/<a([^>]*class="sidebar-logo"[^>]*)>[\s\S]*?<\/a>/, '<a$1><img src="/images/logo.jpg" alt="JobZen" class="brand-logo-img"></a>');
  
  fs.writeFileSync(f, content);
  console.log('Updated ' + f);
});

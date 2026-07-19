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
  
  // Replace auth-logo
  content = content.replace(/<div class="auth-logo">[\s\S]*?<\/div>/, '<div class="auth-logo"><img src="/images/logo.jpg" alt="JobZen" class="brand-logo-img"></div>');
  
  // Replace pub-navbar-logo
  content = content.replace(/<a href="\/" class="pub-navbar-logo">[\s\S]*?<\/a>/, '<a href="/" class="pub-navbar-logo"><img src="/images/logo.jpg" alt="JobZen" class="brand-logo-img"></a>');
  
  // Replace footer-logo
  content = content.replace(/<div class="footer-logo">[\s\S]*?<\/div>/, '<div class="footer-logo"><img src="/images/logo.jpg" alt="JobZen" class="brand-logo-img"></div>');
  
  // Replace sidebar-logo
  content = content.replace(/<div class="sidebar-logo">[\s\S]*?<\/div>/, '<div class="sidebar-logo"><img src="/images/logo.jpg" alt="JobZen" class="brand-logo-img"></div>');
  
  fs.writeFileSync(f, content);
  console.log('Updated ' + f);
});

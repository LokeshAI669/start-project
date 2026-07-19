const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

// The emojis/icons to remove
const iconsToRemove = /[⚡✅🔔📋✉️🔄📊➕🚪⏳✕🛡️👩‍🎓🔍❌ℹ️⚠️]/gu;

// Theme toggle button HTML
const themeToggleHTML = `
    <button class="theme-switch" onclick="toggleTheme()">
      <div class="theme-switch-indicator"></div>
      <span class="toggle-label">Dark</span>
    </button>
`;

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.html') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // Remove icons
            content = content.replace(iconsToRemove, '');
            
            // Specific string removals left over after emoji removal
            content = content.replace(/<div class="empty-icon"><\/div>/g, '');
            content = content.replace(/<div class="logo-mark"><\/div>/g, '');
            content = content.replace(/<div class="stat-icon-wrap stat-icon-[a-z]+"><\/div>/g, '');
            content = content.replace(/<span class="nav-icon"><\/span>/g, '');
            content = content.replace(/<span class="feature-icon-emoji"><\/span>/g, '');

            // For index.html: it has a specific header structure
            if (fullPath.endsWith('index.html')) {
                // Add theme switch to pub-navbar-links
                if (!content.includes('class="theme-switch"')) {
                    content = content.replace('<div class="pub-navbar-links">', '<div class="pub-navbar-links">\n' + themeToggleHTML);
                }
                // Add theme script in head
                if (!content.includes('theme.js')) {
                    content = content.replace('</head>', '  <script src="/js/theme.js"></script>\n</head>');
                }
            } else if (fullPath.endsWith('.html')) {
                // Add theme script in head for all other HTML
                if (!content.includes('theme.js')) {
                    content = content.replace('</head>', '  <script src="/js/theme.js"></script>\n</head>');
                }
                
                // Add theme toggle to sidebar bottom, or auth pages if they have a top area
                if (content.includes('<div class="sidebar-bottom">')) {
                    if (!content.includes('class="theme-switch"')) {
                        content = content.replace('<div class="sidebar-bottom">', '<div class="sidebar-bottom">\n' + themeToggleHTML);
                    }
                } else if (content.includes('class="auth-card"')) {
                     if (!content.includes('class="theme-switch"')) {
                        content = content.replace('<div class="auth-card">', '<div class="auth-card">\n' + themeToggleHTML);
                     }
                }
            }
            
            fs.writeFileSync(fullPath, content, 'utf8');
        }
    }
}

processDir(publicDir);
console.log('UI updated successfully!');

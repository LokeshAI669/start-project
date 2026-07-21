const fs = require('fs');
let css = fs.readFileSync('frontend/src/index.css', 'utf-8');

// Replace the max-width: 768px block entirely
css = css.replace(
  /@media\s*\(\s*max-width:\s*768px\s*\)\s*\{\s*\.sidebar\s*\{\s*display:\s*none;\s*\}\s*\.main-content\s*\{\s*max-width:\s*100vw;\s*padding:\s*20px\s*16px;\s*\}\s*\}/,
  `@media (max-width: 768px) {
    .sidebar {
      display: flex !important;
      position: fixed !important;
      top: 0;
      left: -280px;
      height: 100vh !important;
      z-index: 1000;
      transition: left 0.3s ease !important;
      background: var(--bg-elevated) !important;
      width: 260px !important;
      box-shadow: none;
    }
    .sidebar.open {
      left: 0 !important;
      box-shadow: 4px 0 24px rgba(0,0,0,0.5);
    }
    .main-content { max-width: 100vw; padding: 20px 16px; margin-left: 0; }
  }`
);

fs.writeFileSync('frontend/src/index.css', css);
console.log('Fixed regex 768');

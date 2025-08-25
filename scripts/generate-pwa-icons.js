#!/usr/bin/env node

/**
 * PWA Icon Generation Script
 * 
 * This script creates placeholder PWA icons for development.
 * In production, you should replace these with proper branded icons.
 */

const fs = require('fs');
const path = require('path');

// Create icons directory
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Icon sizes needed for PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create SVG template for icons
const createIconSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2563eb;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#grad)"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.3}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">P</text>
  <circle cx="${size * 0.75}" cy="${size * 0.25}" r="${size * 0.08}" fill="white" opacity="0.8"/>
</svg>
`.trim();

// Generate icons
iconSizes.forEach(size => {
  const svgContent = createIconSVG(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, svgContent);
  console.log(`Generated ${filename}`);
});

// Create shortcut icons
const shortcuts = [
  { name: 'upload-shortcut.svg', icon: 'U', color: '#10b981' },
  { name: 'report-shortcut.svg', icon: 'R', color: '#8b5cf6' },
  { name: 'ai-shortcut.svg', icon: 'A', color: '#f59e0b' }
];

shortcuts.forEach(({ name, icon, color }) => {
  const svgContent = `
<svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
  <rect width="96" height="96" rx="14" fill="${color}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">${icon}</text>
</svg>
  `.trim();
  
  const filepath = path.join(iconsDir, name);
  fs.writeFileSync(filepath, svgContent);
  console.log(`Generated ${name}`);
});

// Create badge icon
const badgeIcon = `
<svg width="72" height="72" viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
  <circle cx="36" cy="36" r="36" fill="#dc2626"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">!</text>
</svg>
`.trim();

fs.writeFileSync(path.join(iconsDir, 'badge-72x72.svg'), badgeIcon);
console.log('Generated badge-72x72.svg');

// Create action icons
const actionIcons = [
  { name: 'view-action.svg', icon: '👁' },
  { name: 'dismiss-action.svg', icon: '✕' }
];

actionIcons.forEach(({ name, icon }) => {
  const svgContent = `
<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <rect width="24" height="24" rx="4" fill="#6b7280"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="12" fill="white" text-anchor="middle" dominant-baseline="central">${icon}</text>
</svg>
  `.trim();
  
  const filepath = path.join(iconsDir, name);
  fs.writeFileSync(filepath, svgContent);
  console.log(`Generated ${name}`);
});

// Create screenshots directory and placeholder files
const screenshotsDir = path.join(__dirname, '..', 'public', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Create placeholder screenshot info
const screenshotInfo = `
# PWA Screenshots

This directory should contain screenshots of your app for the PWA manifest.

Required screenshots:
- desktop-dashboard.png (1280x720) - Desktop view of the dashboard
- mobile-dashboard.png (390x844) - Mobile view of the dashboard

These screenshots will be shown in app stores and installation prompts.

To generate real screenshots:
1. Open your app in a browser
2. Navigate to the main dashboard
3. Take screenshots at the required resolutions
4. Save them in this directory with the exact filenames specified in manifest.json
`;

fs.writeFileSync(path.join(screenshotsDir, 'README.md'), screenshotInfo.trim());
console.log('Created screenshots directory with README');

console.log('\n✅ PWA icons and assets generated successfully!');
console.log('\n📝 Next steps:');
console.log('1. Replace SVG icons with PNG versions for better compatibility');
console.log('2. Add real screenshots to public/screenshots/');
console.log('3. Customize icons with your brand colors and logo');
console.log('4. Test PWA installation on mobile devices');
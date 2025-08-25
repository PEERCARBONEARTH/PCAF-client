#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Vite Configuration Troubleshooter');
console.log('=====================================\n');

// Check if the issue is with lovable-tagger
console.log('1. Checking lovable-tagger dependency...');
try {
  require.resolve('lovable-tagger');
  console.log('   ✅ lovable-tagger is installed');
} catch (error) {
  console.log('   ⚠️  lovable-tagger not found, this is optional');
}

// Check Vite config files
console.log('\n2. Checking Vite configuration files...');
const configs = [
  'vite.config.ts',
  'vite.config.simple.ts',
  'vite.config.js'
];

configs.forEach(config => {
  if (fs.existsSync(config)) {
    console.log(`   ✅ ${config} exists`);
  } else {
    console.log(`   ❌ ${config} not found`);
  }
});

// Check package.json scripts
console.log('\n3. Checking package.json scripts...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const scripts = packageJson.scripts || {};
  
  if (scripts['dev:frontend']) {
    console.log('   ✅ dev:frontend script exists');
  }
  
  if (scripts['dev:frontend:simple']) {
    console.log('   ✅ dev:frontend:simple script exists (fallback)');
  }
} catch (error) {
  console.log('   ❌ Error reading package.json');
}

// Provide solutions
console.log('\n🚀 Solutions:');
console.log('=============');
console.log('If you\'re getting ESM import errors, try these options:\n');

console.log('Option 1: Use the simple Vite config (recommended)');
console.log('   npm run dev:frontend:simple\n');

console.log('Option 2: Remove lovable-tagger completely');
console.log('   npm uninstall lovable-tagger');
console.log('   # Then edit vite.config.ts to remove lovable-tagger import\n');

console.log('Option 3: Use the main config (should work with async import)');
console.log('   npm run dev:frontend\n');

console.log('Option 4: Clear node_modules and reinstall');
console.log('   npm run clean');
console.log('   npm install\n');

// Create a backup simple config if main one fails
const simpleConfig = `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
      '/ws': {
        target: 'ws://localhost:3001',
        ws: true
      }
    }
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});`;

if (!fs.existsSync('vite.config.simple.ts')) {
  fs.writeFileSync('vite.config.simple.ts', simpleConfig);
  console.log('✅ Created vite.config.simple.ts as fallback');
}

console.log('\n🎯 Quick Start:');
console.log('===============');
console.log('npm run dev:frontend:simple');
console.log('# This uses the simple config without any ESM-only dependencies');
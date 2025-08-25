#!/usr/bin/env node

/**
 * Development startup script for MongoDB Auth System
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting MongoDB Auth System Development Environment...\n');

// Start MongoDB (if using local MongoDB)
console.log('📦 Starting MongoDB...');
const mongoProcess = spawn('mongod', ['--dbpath', './data/db'], {
  stdio: 'pipe',
  shell: true
});

mongoProcess.on('error', (error) => {
  console.log('⚠️  MongoDB not found or already running. Continuing...');
});

// Wait a moment for MongoDB to start
setTimeout(() => {
  // Start backend
  console.log('🔧 Starting Backend Server...');
  const backendProcess = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, 'backend'),
    stdio: 'inherit',
    shell: true
  });

  // Start frontend
  console.log('🎨 Starting Frontend Development Server...');
  const frontendProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true
  });

  // Handle process cleanup
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down development servers...');
    
    if (mongoProcess && !mongoProcess.killed) {
      mongoProcess.kill();
    }
    
    if (backendProcess && !backendProcess.killed) {
      backendProcess.kill();
    }
    
    if (frontendProcess && !frontendProcess.killed) {
      frontendProcess.kill();
    }
    
    process.exit(0);
  });

  // Show helpful information
  setTimeout(() => {
    console.log('\n🎉 Development environment started!');
    console.log('📍 Frontend: http://localhost:5173');
    console.log('📍 Backend API: http://localhost:3001');
    console.log('📍 MongoDB: mongodb://localhost:27017/pcaf_dev');
    console.log('\n🧪 Test the auth system: node test-auth.js');
    console.log('🛑 Stop servers: Ctrl+C');
  }, 3000);

}, 2000);
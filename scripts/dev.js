#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Configuration
const config = {
  frontend: {
    name: 'FRONTEND',
    color: colors.cyan,
    cwd: process.cwd(),
    command: 'npm',
    args: ['run', 'dev'],
    port: 5173,
    healthCheck: 'http://localhost:5173'
  },
  backend: {
    name: 'BACKEND',
    color: colors.yellow,
    cwd: path.join(process.cwd(), 'backend'),
    command: 'npm',
    args: ['run', 'dev'],
    port: 3001,
    healthCheck: 'http://localhost:3001/api/health'
  }
};

// Utility functions
function log(service, message, isError = false) {
  const timestamp = new Date().toLocaleTimeString();
  const color = config[service]?.color || colors.white;
  const prefix = `${color}[${config[service]?.name || service}]${colors.reset}`;
  const timePrefix = `${colors.dim}${timestamp}${colors.reset}`;
  
  if (isError) {
    console.error(`${timePrefix} ${prefix} ${colors.red}${message}${colors.reset}`);
  } else {
    console.log(`${timePrefix} ${prefix} ${message}`);
  }
}

function checkPrerequisites() {
  log('SYSTEM', 'Checking prerequisites...');
  
  // Check if backend directory exists
  if (!fs.existsSync(config.backend.cwd)) {
    log('SYSTEM', 'Backend directory not found. Please ensure backend/ directory exists.', true);
    process.exit(1);
  }
  
  // Check if backend package.json exists
  const backendPackageJson = path.join(config.backend.cwd, 'package.json');
  if (!fs.existsSync(backendPackageJson)) {
    log('SYSTEM', 'Backend package.json not found. Please run "cd backend && npm install" first.', true);
    process.exit(1);
  }
  
  // Check if frontend package.json exists
  const frontendPackageJson = path.join(config.frontend.cwd, 'package.json');
  if (!fs.existsSync(frontendPackageJson)) {
    log('SYSTEM', 'Frontend package.json not found. Please run "npm install" first.', true);
    process.exit(1);
  }
  
  log('SYSTEM', 'Prerequisites check passed ✓');
}

function setupEnvironment() {
  log('SYSTEM', 'Setting up environment...');
  
  // Check for .env files
  const frontendEnv = path.join(config.frontend.cwd, '.env.local');
  const backendEnv = path.join(config.backend.cwd, '.env');
  
  if (!fs.existsSync(frontendEnv)) {
    log('SYSTEM', 'Frontend .env.local not found. Creating from .env.example...', false);
    const envExample = path.join(config.frontend.cwd, '.env.example');
    if (fs.existsSync(envExample)) {
      fs.copyFileSync(envExample, frontendEnv);
      log('SYSTEM', 'Created .env.local from .env.example');
    }
  }
  
  if (!fs.existsSync(backendEnv)) {
    log('SYSTEM', 'Backend .env not found. Please create backend/.env file.', true);
    log('SYSTEM', 'You can copy from backend/.env.example if available.');
  }
  
  log('SYSTEM', 'Environment setup completed ✓');
}

function startService(serviceName) {
  const serviceConfig = config[serviceName];
  
  log(serviceName, `Starting ${serviceConfig.name}...`);
  
  const child = spawn(serviceConfig.command, serviceConfig.args, {
    cwd: serviceConfig.cwd,
    stdio: 'pipe',
    shell: process.platform === 'win32'
  });
  
  child.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => log(serviceName, line));
  });
  
  child.stderr.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => log(serviceName, line, true));
  });
  
  child.on('close', (code) => {
    if (code !== 0) {
      log(serviceName, `Process exited with code ${code}`, true);
    } else {
      log(serviceName, 'Process exited normally');
    }
  });
  
  child.on('error', (error) => {
    log(serviceName, `Failed to start: ${error.message}`, true);
  });
  
  return child;
}

async function waitForService(serviceName, timeout = 60000) {
  const serviceConfig = config[serviceName];
  const startTime = Date.now();
  
  log(serviceName, `Waiting for service to be ready on port ${serviceConfig.port}...`);
  
  return new Promise((resolve, reject) => {
    const checkHealth = async () => {
      try {
        const response = await fetch(serviceConfig.healthCheck);
        if (response.ok) {
          log(serviceName, `Service is ready! ✓`);
          resolve();
        } else {
          throw new Error(`Health check failed with status ${response.status}`);
        }
      } catch (error) {
        if (Date.now() - startTime > timeout) {
          log(serviceName, `Service failed to start within ${timeout}ms`, true);
          reject(new Error(`Timeout waiting for ${serviceName}`));
        } else {
          setTimeout(checkHealth, 2000);
        }
      }
    };
    
    setTimeout(checkHealth, 5000); // Wait 5 seconds before first check
  });
}

function setupGracefulShutdown(processes) {
  const shutdown = (signal) => {
    log('SYSTEM', `Received ${signal}. Shutting down gracefully...`);
    
    processes.forEach((process, serviceName) => {
      if (process && !process.killed) {
        log(serviceName, 'Terminating...');
        process.kill('SIGTERM');
      }
    });
    
    setTimeout(() => {
      log('SYSTEM', 'Force killing remaining processes...');
      processes.forEach((process) => {
        if (process && !process.killed) {
          process.kill('SIGKILL');
        }
      });
      process.exit(0);
    }, 5000);
  };
  
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGHUP', () => shutdown('SIGHUP'));
}

async function main() {
  console.log(`${colors.bright}${colors.green}🚀 Starting Financed Emissions Platform Development Environment${colors.reset}\n`);
  
  try {
    // Check prerequisites
    checkPrerequisites();
    
    // Setup environment
    setupEnvironment();
    
    // Start services
    const processes = new Map();
    
    log('SYSTEM', 'Starting backend service...');
    const backendProcess = startService('backend');
    processes.set('backend', backendProcess);
    
    // Wait a bit for backend to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    log('SYSTEM', 'Starting frontend service...');
    const frontendProcess = startService('frontend');
    processes.set('frontend', frontendProcess);
    
    // Setup graceful shutdown
    setupGracefulShutdown(processes);
    
    // Wait for services to be ready
    try {
      await Promise.all([
        waitForService('backend'),
        waitForService('frontend')
      ]);
      
      console.log(`\n${colors.bright}${colors.green}✅ All services are running!${colors.reset}`);
      console.log(`${colors.bright}Frontend:${colors.reset} ${colors.cyan}http://localhost:5173${colors.reset}`);
      console.log(`${colors.bright}Backend:${colors.reset}  ${colors.yellow}http://localhost:3001${colors.reset}`);
      console.log(`${colors.bright}API Docs:${colors.reset}  ${colors.yellow}http://localhost:3001/api-docs${colors.reset}`);
      console.log(`\n${colors.dim}Press Ctrl+C to stop all services${colors.reset}\n`);
      
    } catch (error) {
      log('SYSTEM', `Failed to start services: ${error.message}`, true);
      process.exit(1);
    }
    
  } catch (error) {
    log('SYSTEM', `Startup failed: ${error.message}`, true);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  log('SYSTEM', `Uncaught exception: ${error.message}`, true);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log('SYSTEM', `Unhandled rejection at: ${promise}, reason: ${reason}`, true);
  process.exit(1);
});

// Start the application
main().catch((error) => {
  log('SYSTEM', `Fatal error: ${error.message}`, true);
  process.exit(1);
});
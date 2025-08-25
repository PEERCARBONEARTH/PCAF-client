# Frontend Scripts Guide

This document explains all the available npm scripts for the frontend development and deployment.

## Development Scripts

### Basic Development
```bash
# Start development server (default)
npm run dev

# Start with local backend (development mode)
npm run dev:local

# Start with production backend (production mode)  
npm run dev:prod

# Start frontend only
npm run dev:frontend

# Start simple frontend (alternative config)
npm run dev:frontend:simple

# Start backend only
npm run dev:backend

# Start both frontend and backend
npm run dev:fullstack
```

### Environment-Specific Development
- `dev:local` - Uses `.env.local` and development mode
- `dev:prod` - Uses `.env.production` and production mode (connects to Railway backend)
- `dev:fullstack` - Runs both frontend and backend simultaneously

## Build Scripts

### Production Builds
```bash
# Build frontend for production (default)
npm run build

# Build frontend for development (with source maps)
npm run build:dev

# Build frontend only
npm run build:frontend

# Build backend only
npm run build:backend

# Build both frontend and backend
npm run build:fullstack
```

### Preview Built Application
```bash
# Preview production build
npm run preview

# Preview with production mode
npm run preview:prod

# Start preview server (alias)
npm run start

# Start frontend preview
npm run start:frontend

# Start backend production
npm run start:backend

# Start both frontend and backend
npm run start:fullstack
```

## Testing Scripts

### Unit & Integration Tests
```bash
# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Test frontend only
npm run test:frontend

# Test backend only
npm run test:backend

# Test both frontend and backend
npm run test:fullstack
```

### End-to-End Tests
```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run integration tests (backend + E2E)
npm run test:integration

# Test authentication flow
npm run test:auth
```

## Code Quality Scripts

### Linting
```bash
# Lint code
npm run lint

# Lint and fix issues
npm run lint:fix

# Lint frontend only
npm run lint:frontend

# Lint backend only
npm run lint:backend

# Lint both frontend and backend
npm run lint:fullstack
```

### Formatting
```bash
# Format code with Prettier
npm run format

# Check if code is formatted
npm run format:check
```

### Type Checking
```bash
# Check TypeScript types
npm run type-check
```

## Deployment Scripts

### Vercel Deployment
```bash
# Build for Vercel
npm run vercel:build

# Dev server for Vercel
npm run vercel:dev

# Deploy to Vercel production
npm run deploy:vercel

# Deploy to Vercel preview
npm run deploy:preview
```

## Utility Scripts

### Setup & Maintenance
```bash
# Install frontend dependencies
npm run setup

# Install all dependencies (frontend + backend)
npm run setup:fullstack

# Clean frontend build artifacts
npm run clean

# Clean all build artifacts
npm run clean:fullstack

# Fix Vite issues
npm run fix-vite
```

### Analysis & Debugging
```bash
# Analyze bundle size
npm run analyze

# Check environment variables
npm run env:check
```

### Docker Scripts
```bash
# Build Docker containers
npm run docker:build

# Start Docker containers
npm run docker:up

# Stop Docker containers
npm run docker:down

# Start development Docker setup
npm run docker:dev

# View Docker logs
npm run docker:logs
```

## Environment Modes

### Development Mode
- Uses `.env.local` or `.env`
- Connects to local backend (`http://localhost:3001`)
- Enables source maps and debugging
- Hot module replacement enabled

### Production Mode
- Uses `.env.production`
- Connects to Railway backend (`https://pcaf-server-production.up.railway.app`)
- Optimized build with minification
- Source maps disabled
- Console logs removed

## Common Workflows

### Frontend-Only Development (with Production Backend)
```bash
# 1. Start development with production backend
npm run dev:prod

# 2. Build for production
npm run build

# 3. Preview production build
npm run preview
```

### Full-Stack Development
```bash
# 1. Start both frontend and backend
npm run dev:fullstack

# 2. Run tests
npm run test:fullstack

# 3. Build everything
npm run build:fullstack
```

### Deployment Workflow
```bash
# 1. Check code quality
npm run lint
npm run type-check
npm run test:run

# 2. Build for production
npm run build

# 3. Preview locally
npm run preview

# 4. Deploy to Vercel
npm run deploy:vercel
```

### Code Quality Workflow
```bash
# 1. Format code
npm run format

# 2. Lint and fix
npm run lint:fix

# 3. Type check
npm run type-check

# 4. Run tests
npm run test:run
```

## Environment Variables

The scripts automatically use the appropriate environment variables based on the mode:

### Development Mode
- `VITE_API_BASE_URL=http://localhost:3001`
- `VITE_WS_URL=ws://localhost:3001`
- `VITE_ENVIRONMENT=development`

### Production Mode
- `VITE_API_BASE_URL=https://pcaf-server-production.up.railway.app`
- `VITE_WS_URL=wss://pcaf-server-production.up.railway.app`
- `VITE_ENVIRONMENT=production`

## Troubleshooting

### Common Issues

1. **Port conflicts**: Change port in `vite.config.ts` or use `--port` flag
2. **Environment variables not loading**: Check `.env` file names and `VITE_` prefix
3. **Build failures**: Run `npm run clean` and try again
4. **Type errors**: Run `npm run type-check` to see detailed errors

### Debug Commands
```bash
# Check environment variables
npm run env:check

# Verbose build output
npm run build -- --verbose

# Debug Vite configuration
npm run dev -- --debug

# Check dependencies
npm ls
```

## Performance Tips

1. Use `npm run dev:prod` to test with production backend during development
2. Run `npm run analyze` to check bundle size
3. Use `npm run test:coverage` to ensure good test coverage
4. Run `npm run type-check` regularly to catch type issues early

## CI/CD Integration

These scripts are designed to work with CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Install dependencies
  run: npm run setup

- name: Lint code
  run: npm run lint

- name: Type check
  run: npm run type-check

- name: Run tests
  run: npm run test:run

- name: Build application
  run: npm run build
```
# Vercel Deployment Guide

## Overview
This guide covers deploying the PCAF Financed Emissions Platform frontend to Vercel, configured to connect to the production backend at `https://pcaf-server-production.up.railway.app/`.

## Prerequisites
- Vercel account
- GitHub repository connected to Vercel
- Backend deployed at Railway (already completed)

## Environment Configuration

### Production Environment Variables
The following environment variables are configured for production deployment:

```bash
# Backend API Configuration
VITE_API_BASE_URL=https://pcaf-server-production.up.railway.app
VITE_WS_URL=wss://pcaf-server-production.up.railway.app

# Environment
VITE_ENVIRONMENT=production

# Authentication (configure as needed)
VITE_AUTH_ENABLED=true
VITE_AUTH_PROVIDER=clerk
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here

# Feature Flags
VITE_ENABLE_REAL_TIME=true
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_LMS_INTEGRATION=true
VITE_ENABLE_BATCH_PROCESSING=true

# Performance Settings
VITE_ENABLE_SOURCE_MAPS=false
VITE_ENABLE_BUNDLE_ANALYZER=false

# Application Settings
VITE_APP_NAME=Financed Emissions Platform
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=PCAF-compliant financed emissions tracking platform

# Monitoring
VITE_ENABLE_ERROR_REPORTING=true

# Development Settings (disabled in production)
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=error
```

## Deployment Steps

### 1. Vercel Configuration
The `vercel.json` file has been configured with:
- Build command: `npm run build`
- Output directory: `dist`
- Framework: `vite`
- API rewrites to proxy requests to Railway backend
- CORS headers for API endpoints
- Environment variables

### 2. Deploy to Vercel

#### Option A: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### Option B: GitHub Integration
1. Connect your GitHub repository to Vercel
2. Import the project in Vercel dashboard
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

### 3. Environment Variables in Vercel Dashboard
Set the following environment variables in your Vercel project settings:

**Required:**
- `VITE_API_BASE_URL`: `https://pcaf-server-production.up.railway.app`
- `VITE_WS_URL`: `wss://pcaf-server-production.up.railway.app`
- `VITE_ENVIRONMENT`: `production`

**Authentication (if using Clerk):**
- `VITE_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key

**Optional (with defaults):**
- `VITE_ENABLE_REAL_TIME`: `true`
- `VITE_ENABLE_AI_FEATURES`: `true`
- `VITE_DEBUG_MODE`: `false`
- `VITE_LOG_LEVEL`: `error`

## Build Configuration

### Build Command
```bash
npm run build
```

This runs `vite build --mode production` which:
- Uses the `.env.production` file
- Optimizes for production
- Removes console logs and debugger statements
- Generates optimized chunks for better caching

### Build Output
- Output directory: `dist/`
- Static assets are optimized and hashed
- Source maps are disabled in production
- Bundle is minified and compressed

## API Integration

### Backend Communication
The frontend communicates with the Railway backend through:

1. **Direct API calls** using the `VITE_API_BASE_URL`
2. **WebSocket connections** using the `VITE_WS_URL`
3. **API rewrites** in `vercel.json` for seamless integration

### CORS Configuration
The `vercel.json` includes CORS headers to allow communication between the Vercel frontend and Railway backend.

## Monitoring and Debugging

### Production Logs
- Check Vercel function logs in the dashboard
- Monitor network requests in browser dev tools
- Use error reporting if configured

### Common Issues
1. **CORS errors**: Ensure backend allows requests from your Vercel domain
2. **Environment variables**: Verify all required env vars are set in Vercel
3. **API endpoints**: Confirm backend is accessible at the configured URL

## Performance Optimization

### Automatic Optimizations
- Code splitting by route and vendor libraries
- Asset optimization and compression
- CDN distribution via Vercel Edge Network
- Automatic HTTPS and HTTP/2

### Manual Optimizations
- Lazy loading of components
- Image optimization
- Bundle analysis (can be enabled with `VITE_ENABLE_BUNDLE_ANALYZER=true`)

## Security Considerations

### Environment Variables
- Never expose sensitive keys in `VITE_` prefixed variables
- Use server-side environment variables for sensitive data
- Rotate API keys regularly

### HTTPS
- Vercel automatically provides HTTPS
- All API communication uses secure protocols (HTTPS/WSS)

## Deployment Checklist

- [ ] Backend deployed and accessible at Railway
- [ ] Environment variables configured in Vercel
- [ ] `vercel.json` configuration reviewed
- [ ] Build command tested locally
- [ ] CORS configuration verified
- [ ] Authentication provider configured (if applicable)
- [ ] Domain configured (if using custom domain)
- [ ] SSL certificate verified
- [ ] Performance monitoring set up

## Post-Deployment

### Verification Steps
1. Visit the deployed URL
2. Test API connectivity
3. Verify authentication flow (if enabled)
4. Test key features:
   - Loan portfolio loading
   - Data upload functionality
   - Real-time updates (if enabled)
   - AI features (if enabled)

### Monitoring
- Set up error tracking (Sentry, LogRocket, etc.)
- Monitor performance metrics
- Set up uptime monitoring
- Configure alerts for critical issues

## Rollback Strategy
- Vercel maintains deployment history
- Can rollback to previous deployment instantly
- Environment variables can be reverted
- Database migrations may need separate rollback

## Support
- Vercel documentation: https://vercel.com/docs
- Railway documentation: https://docs.railway.app
- Project-specific issues: Check GitHub issues or contact development team
# Development Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+
- Git

### Setup Commands

1. **Automated Setup (Recommended)**
   ```bash
   # Unix/Mac/Linux
   chmod +x scripts/setup.sh
   ./scripts/setup.sh

   # Windows
   scripts/setup.bat
   ```

2. **Manual Setup**
   ```bash
   # Install dependencies
   npm run setup

   # Copy environment files
   cp .env.example .env.local
   cp backend/.env.example backend/.env

   # Start development servers
   npm run dev
   ```

## 🔧 Vite Configuration

The `vite.config.ts` has been optimized for:

### Development Features
- **Hot Module Replacement (HMR)** - Instant updates during development
- **API Proxying** - Automatic proxying to backend at `http://localhost:3001`
- **WebSocket Proxying** - Real-time connection proxying
- **Environment Validation** - Validates required environment variables
- **Development Enhancements** - Custom middleware and logging

### Production Optimizations
- **Code Splitting** - Automatic vendor and utility chunks
- **Tree Shaking** - Removes unused code
- **Minification** - Optimized bundle sizes
- **Source Maps** - Available in development mode
- **Bundle Analysis** - Optional bundle size analysis

### Proxy Configuration
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:3001',
    changeOrigin: true,
    secure: false,
    ws: true, // WebSocket support
  },
  '/ws': {
    target: 'ws://localhost:3001',
    ws: true,
    changeOrigin: true,
  }
}
```

## 📋 Available Commands

### Development
```bash
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start only frontend (port 5173)
npm run dev:backend      # Start only backend (port 3001)
```

### Building
```bash
npm run build            # Build both services
npm run build:frontend   # Build only frontend
npm run build:backend    # Build only backend
```

### Testing
```bash
npm run test             # Run all tests
npm run test:frontend    # Run frontend tests
npm run test:backend     # Run backend tests
npm run test:integration # Run integration tests
npm run test:e2e         # Run end-to-end tests
```

### Docker
```bash
npm run docker:dev       # Start with Docker Compose
npm run docker:build     # Build Docker images
npm run docker:up        # Start containers
npm run docker:down      # Stop containers
```

### Utilities
```bash
npm run setup            # Install all dependencies
npm run clean            # Clean node_modules and dist
npm run lint             # Lint all code
```

## 🌐 Environment Configuration

### Frontend (.env.local)
```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001

# Authentication
VITE_CLERK_PUBLISHABLE_KEY=your_key_here

# Feature Flags
VITE_ENABLE_REAL_TIME=true
VITE_ENABLE_AI_FEATURES=true
VITE_DEBUG_MODE=true
```

### Backend (backend/.env)
```bash
# Server
NODE_ENV=development
PORT=3001

# Database
MONGODB_URI=mongodb://localhost:27017/financed_emissions
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-secret-key

# AI Services
OPENAI_API_KEY=your_openai_key
```

## 🐳 Docker Development

### Using Docker Compose
```bash
# Start all services (MongoDB, Redis, Backend, Frontend)
npm run docker:dev

# Access services
# Frontend: http://localhost:5173
# Backend: http://localhost:3001
# MongoDB: localhost:27017
# Redis: localhost:6379
```

### Docker Services
- **MongoDB 7.0** - Primary database
- **Redis 7.2** - Caching and sessions
- **Backend** - Node.js API server
- **Frontend** - Vite development server

## 🔍 Development Tools

### Vite Plugins
- **React SWC** - Fast React compilation
- **Component Tagger** - Development component identification
- **Environment Validation** - Validates required env vars
- **Development Enhancements** - Custom dev middleware
- **Bundle Analysis** - Optional bundle size analysis

### Browser DevTools
- **React DevTools** - Component inspection
- **Redux DevTools** - State management debugging
- **Network Tab** - API request monitoring
- **WebSocket Inspector** - Real-time connection monitoring

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill processes on ports
   npx kill-port 5173 3001
   ```

2. **Environment Variables Not Loading**
   ```bash
   # Check .env.local exists and has correct format
   cat .env.local
   ```

3. **API Connection Issues**
   ```bash
   # Verify backend is running
   curl http://localhost:3001/api/health
   ```

4. **WebSocket Connection Failed**
   ```bash
   # Check WebSocket endpoint
   wscat -c ws://localhost:3001
   ```

5. **Database Connection Issues**
   ```bash
   # Check MongoDB is running
   mongosh mongodb://localhost:27017/financed_emissions
   ```

### Debug Mode
Enable detailed logging:
```bash
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
```

### Performance Issues
```bash
# Enable bundle analysis
VITE_ENABLE_BUNDLE_ANALYZER=true npm run build
```

## 📊 Monitoring

### Health Checks
- Frontend: http://localhost:5173/health
- Backend: http://localhost:3001/api/health

### Logs
- Frontend: Browser console
- Backend: Terminal output or `backend/logs/`

### Metrics
- Bundle size analysis
- Build time monitoring
- API response times
- WebSocket connection status

## 🔐 Security

### Development Security
- Environment variables validation
- CORS configuration
- Secure WebSocket connections (WSS in production)
- Input sanitization

### Production Considerations
- Remove debug flags
- Enable HTTPS
- Secure environment variables
- Enable CSP headers

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run start
```

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up
```

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Docker Documentation](https://docs.docker.com/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run test`
5. Submit a pull request

## 📞 Support

For issues and questions:
1. Check this documentation
2. Review error logs
3. Check GitHub issues
4. Contact the development team
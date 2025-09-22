# PCAF Client - Frontend Application

The frontend React application for the PCAF Platform, providing an intuitive interface for PCAF compliance, portfolio management, and emissions reporting.

## 🚀 **Quick Start**

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev

# Build for production
npm run build
npm run preview
```

## 📁 **Project Structure**

```
PCAF-client/
├── src/                              # Source code
│   ├── components/                  # React components
│   │   ├── ui/                     # Base UI components
│   │   ├── shared/                 # Shared components
│   │   ├── reports/                # Reporting components
│   │   ├── analytics/              # Analytics dashboards
│   │   └── auth/                   # Authentication
│   ├── pages/                      # Page components
│   ├── services/                   # API services
│   ├── hooks/                      # Custom React hooks
│   ├── lib/                        # Utility libraries
│   └── types/                      # TypeScript definitions
├── tests/                          # Test suites
│   ├── integration/               # Integration tests
│   ├── components/                # Component tests
│   └── e2e/                       # End-to-end tests
├── scripts/                       # Build and utility scripts
│   ├── dev/                       # Development tools
│   └── deploy/                    # Deployment scripts
├── docs/                          # Documentation
└── dist/                          # Built output
```

## 🎯 **Key Features**

### PCAF Compliance Interface

- **Motor Vehicle Calculator**: Complete PCAF methodology implementation
- **Data Quality Dashboard**: Real-time quality assessment and recommendations
- **Attribution Standards**: Visual representation of Standards A, B, C
- **Avoided Emissions Reporting**: Section 5.8 compliance with carbon credit separation
- **Multi-Asset Class Support**: Interface for all 9 PCAF asset classes

### Professional UI/UX

- **Modern Design**: Clean, professional interface using Radix UI
- **Responsive Layout**: Mobile-first design with desktop optimization
- **Dark/Light Mode**: Theme switching with system preference detection
- **Accessibility**: WCAG 2.1 AA compliant components
- **Interactive Charts**: Real-time data visualization with Recharts

### Advanced Features

- **AI-Enhanced Reporting**: Contextual narratives and insights
- **Real-time Updates**: WebSocket integration for live data
- **Offline Support**: PWA capabilities with service worker
- **Export Capabilities**: PDF, Excel, and CSV export options
- **Multi-language Support**: Internationalization ready

## 🧪 **Testing**

### Component Tests

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test
```

### Integration Tests

```bash
# RAG system integration
npm run test:rag

# API integration
npm run test:integration
```

### End-to-End Tests

```bash
# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e --ui
```

## 🎨 **UI Components**

### Base Components (Radix UI)

- **Forms**: Input, Select, Checkbox, Radio, Switch
- **Navigation**: Tabs, Breadcrumb, Pagination
- **Feedback**: Toast, Alert, Progress, Skeleton
- **Overlay**: Dialog, Popover, Tooltip, Sheet
- **Data Display**: Table, Card, Badge, Avatar

### Custom Components

- **PCAFCalculator**: Motor vehicle emissions calculator
- **DataQualityDashboard**: Portfolio quality assessment
- **ReportCenter**: Professional report generation
- **PortfolioOverview**: Real-time portfolio metrics
- **AIInsights**: Contextual AI-powered insights

## 🔧 **Scripts**

### Development

```bash
# Start development server
npm run dev

# Debug environment variables
npm run scripts:debug

# Development utilities
npm run scripts:dev
```

### Build & Deploy

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Vercel
npm run deploy:vercel
```

### Code Quality

```bash
# Lint and fix
npm run lint:fix

# Format code
npm run format

# Type checking
npm run type-check
```

## 🌐 **Environment Variables**

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001

# Authentication
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key

# Features
VITE_ENVIRONMENT=development
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PWA=true

# External Services
VITE_MAPBOX_TOKEN=your_mapbox_token
```

## 📱 **Progressive Web App**

The application includes PWA capabilities:

- **Offline Support**: Service worker for offline functionality
- **Install Prompt**: Native app-like installation
- **Push Notifications**: Real-time updates and alerts
- **Background Sync**: Data synchronization when online

## 🎯 **Performance**

- **Bundle Size**: < 500KB gzipped
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3s

## 🏗️ **Architecture**

### State Management

- **Zustand**: Lightweight state management
- **React Query**: Server state management and caching
- **Context API**: Component-level state sharing

### Routing

- **React Router**: Client-side routing with lazy loading
- **Protected Routes**: Authentication-based route protection
- **Dynamic Imports**: Code splitting for optimal performance

### Styling

- **TailwindCSS**: Utility-first CSS framework
- **CSS Modules**: Component-scoped styling
- **Radix UI**: Accessible component primitives

## 📊 **Analytics & Monitoring**

- **User Analytics**: Usage tracking and insights
- **Performance Monitoring**: Real-time performance metrics
- **Error Tracking**: Comprehensive error reporting
- **A/B Testing**: Feature flag management

## 📚 **Documentation**

- [Component Library](./docs/components/)
- [User Guide](./docs/user-guides/)
- [Development Guide](./docs/development/)
- [Deployment Guide](./docs/deployment/)

## 🤝 **Contributing**

1. Follow the component structure and naming conventions
2. Add Storybook stories for new components
3. Include tests for new features
4. Update documentation

```bash
# Before committing
npm run lint:fix
npm run format
npm run test
npm run build
```

## 🔍 **Browser Support**

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## 📱 **Mobile Support**

- **iOS Safari**: 14+
- **Chrome Mobile**: 90+
- **Samsung Internet**: 14+

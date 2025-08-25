# API Routing Fix for Vercel Deployment

## Issue Description
The frontend deployed on Vercel at `https://pcaf-client.vercel.app/` was making API calls to itself instead of the Railway backend at `https://pcaf-server-production.up.railway.app/`.

**Error:** `GET https://pcaf-client.vercel.app/api/v1/rag/collections` (404 Not Found)

## Root Cause
Several files were making API calls without using the configured `VITE_API_BASE_URL` environment variable, causing requests to go to the frontend domain instead of the backend.

## Files Fixed

### 1. `src/lib/auth.ts`
**Issue:** Used conditional logic that set API_BASE_URL to empty string in development
```typescript
// BEFORE (problematic)
private static readonly API_BASE_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001');

// AFTER (fixed)
private static readonly API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
```

### 2. `src/pages/financed-emissions/RAGManagement.tsx`
**Issue:** Hardcoded API paths without base URL
```typescript
// BEFORE (problematic)
const response = await fetch('/api/v1/rag/collections', {

// AFTER (fixed)
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
const response = await fetch(`${apiBaseUrl}/api/v1/rag/collections`, {
```

Fixed three API endpoints:
- `/api/v1/rag/collections` → `${apiBaseUrl}/api/v1/rag/collections`
- `/api/v1/rag/upload` → `${apiBaseUrl}/api/v1/rag/upload`
- `/api/v1/rag/search` → `${apiBaseUrl}/api/v1/rag/search`

### 3. `src/services/portfolioService.ts`
**Issue:** Missing slash in API URL construction
```typescript
// BEFORE (problematic)
const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}api/v1/loans/portfolio`, {

// AFTER (fixed)
const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/loans/portfolio`, {
```

### 4. `public/sw.js` (Service Worker)
**Issue:** Hardcoded API paths in service worker
```javascript
// BEFORE (problematic)
const response = await fetch('/api/loans/bulk-intake', {

// AFTER (fixed)
const apiBaseUrl = self.location.origin.includes('vercel.app') 
  ? 'https://pcaf-server-production.up.railway.app' 
  : '';
const response = await fetch(`${apiBaseUrl}/api/loans/bulk-intake`, {
```

## Environment Configuration

### Vercel Environment Variables
The following environment variables are configured in `vercel.json`:
```json
{
  "env": {
    "VITE_API_BASE_URL": "https://pcaf-server-production.up.railway.app",
    "VITE_WS_URL": "wss://pcaf-server-production.up.railway.app",
    "VITE_ENVIRONMENT": "production"
  }
}
```

### API Rewrites
Vercel is configured to proxy `/api/*` requests to the Railway backend:
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://pcaf-server-production.up.railway.app/api/$1"
    }
  ]
}
```

## Verification

### Build Status
✅ `npm run build` - Completed successfully
✅ `npm run type-check` - No TypeScript errors
✅ All API calls now use the correct base URL

### Expected Behavior
After deployment, API calls should now go to:
- `https://pcaf-server-production.up.railway.app/api/v1/rag/collections`
- `https://pcaf-server-production.up.railway.app/api/v1/auth/login`
- etc.

Instead of:
- ❌ `https://pcaf-client.vercel.app/api/v1/rag/collections`

## Deployment Steps
1. Commit and push the changes
2. Vercel will automatically redeploy
3. Test the application to ensure API calls work correctly

## Best Practices Applied
1. **Consistent API Base URL Usage:** All API calls now use `import.meta.env.VITE_API_BASE_URL`
2. **Environment-Aware Configuration:** Different URLs for development vs production
3. **Service Worker Compatibility:** Dynamic API URL detection for service worker
4. **Proper URL Construction:** Ensured correct slash placement in URL concatenation

## Files That Were Already Correct
These files were already using the correct pattern:
- `src/services/api.ts` ✅
- `src/services/dataSyncService.ts` ✅
- `src/services/realTimeService.ts` ✅
- `src/services/integrationService.ts` ✅
- `src/services/enhancedUploadService.ts` ✅
- `src/services/aiService.ts` ✅
- `src/components/LMSSyncStatusIndicator.tsx` ✅
- `src/components/LoanLedgerTable.tsx` ✅

## Testing Checklist
- [ ] Authentication (login/logout)
- [ ] RAG Management (collections, upload, search)
- [ ] Portfolio data loading
- [ ] LMS sync functionality
- [ ] Real-time features
- [ ] File uploads
- [ ] AI insights

The frontend should now correctly communicate with the Railway backend in production.
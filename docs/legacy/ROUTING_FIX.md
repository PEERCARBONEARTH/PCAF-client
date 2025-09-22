# Client-Side Routing Fix for Vercel Deployment

## Issue Description
After successful sign-in, users were being redirected to `/financed-emissions` but getting a 404 Not Found error on Vercel.

**Error:** 404 when accessing `https://pcaf-client.vercel.app/financed-emissions`

## Root Cause
The issue was caused by two problems:
1. **Missing SPA Configuration:** Vercel wasn't configured to handle client-side routing properly
2. **Route Matching Issue:** The redirect to `/financed-emissions` wasn't matching the nested route structure correctly

## Fixes Applied

### 1. Updated `vercel.json` - Added SPA Support
Added a catch-all rewrite rule to serve `index.html` for all non-API routes:

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://pcaf-server-production.up.railway.app/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Why this is needed:** In SPAs, all routes are handled by JavaScript on the client side. When a user navigates directly to a URL like `/financed-emissions`, Vercel needs to serve the `index.html` file so React Router can take over and render the correct component.

### 2. Updated `src/lib/navigation.ts` - More Specific Redirect
Changed the default post-authentication redirect:

```typescript
// BEFORE
window.location.replace('/financed-emissions');

// AFTER  
window.location.replace('/financed-emissions/overview');
```

**Why this is better:** Instead of relying on the index route, we redirect to a specific route that we know exists.

### 3. Updated `src/App.tsx` - Added Explicit Redirect Route
Added a redirect route to handle the exact `/financed-emissions` path:

```tsx
{/* New redirect route */}
<Route
  path="/financed-emissions"
  element={<Navigate to="/financed-emissions/overview" replace />}
/>

{/* Existing nested routes */}
<Route
  path="/financed-emissions/*"
  element={
    <ProtectedRoute>
      <PlatformProvider>
        <AssumptionsProvider>
          <FinancedEmissionsRoutes />
        </AssumptionsProvider>
      </PlatformProvider>
    </ProtectedRoute>
  }
/>
```

**Why this helps:** This ensures that if someone navigates to `/financed-emissions` (without a trailing path), they get redirected to `/financed-emissions/overview` instead of potentially hitting a 404.

## How Client-Side Routing Works

### Before the Fix:
1. User signs in successfully
2. Gets redirected to `/financed-emissions`
3. Vercel tries to find a file at `/financed-emissions` → 404
4. No fallback to `index.html` → User sees 404 page

### After the Fix:
1. User signs in successfully  
2. Gets redirected to `/financed-emissions/overview`
3. Vercel doesn't find a file → Falls back to `index.html` (due to catch-all rewrite)
4. React app loads → React Router matches `/financed-emissions/overview` → Renders OverviewPage

## Route Structure
The financed emissions routes are structured as:
```
/financed-emissions/
├── overview (index route)
├── upload
├── summary  
├── ledger
├── ai-insights
├── rag-management
├── reports/
├── pcaf-calculator
├── methodology
├── amortization
└── settings
```

## Testing Checklist
After deployment, test these scenarios:
- [ ] Sign in → Should redirect to `/financed-emissions/overview`
- [ ] Direct navigation to `/financed-emissions` → Should redirect to `/financed-emissions/overview`
- [ ] Direct navigation to `/financed-emissions/upload` → Should load upload page
- [ ] Browser refresh on any financed-emissions route → Should stay on the same page
- [ ] Back/forward navigation → Should work correctly

## Vercel Deployment Notes
- The catch-all rewrite rule `"source": "/(.*)"` must come AFTER more specific rules
- API routes are handled first, then everything else falls back to `index.html`
- This is the standard pattern for deploying SPAs to Vercel

## Build Status
✅ `npm run build` - Completed successfully
✅ All routes properly configured
✅ Ready for deployment

The routing issue should now be resolved, and users will be able to access the financed emissions platform after signing in.
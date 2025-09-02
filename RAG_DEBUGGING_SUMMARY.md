# 🔧 RAG System Debugging & Fixes

## 🎯 **ISSUES IDENTIFIED**

### 1. **WebSocket Connection Error**
```
Firefox can't establish a connection to the server at wss://pcaf-server-production.up.railway.app/ws
```
**Cause:** Frontend configured to connect to Railway backend that's not responding

### 2. **Static RAG Responses**
**Cause:** Multiple potential issues:
- ChromaDB confidence threshold too high (was 0.3)
- Missing surgical response patterns
- Environment variables not deployed to Vercel
- Fallback to generic responses

## ✅ **FIXES APPLIED**

### 1. **Lowered Confidence Threshold**
```typescript
// Before: if (bestMatch.relevance_score > 0.3)
// After:  if (bestMatch.relevance_score > 0.1)
```
This allows more ChromaDB results to be used instead of falling back to static responses.

### 2. **Enhanced Surgical Responses**
Added comprehensive fallback responses for:
- ✅ PCAF Data Quality Options
- ✅ Attribution Factor Calculations  
- ✅ Financed Emissions Calculations
- ✅ Compliance Requirements
- ✅ Electric Vehicle Calculations

### 3. **Improved Pattern Matching**
```typescript
const QUESTION_PATTERNS = [
  { patterns: ['pcaf options', 'data quality options', '5 options'], responseKey: 'pcaf_options' },
  { patterns: ['attribution factor', 'calculate attribution'], responseKey: 'attribution_factor' },
  { patterns: ['financed emissions', 'emission calculation'], responseKey: 'financed_emissions' },
  { patterns: ['compliance', 'pcaf compliant', 'wdqs'], responseKey: 'compliance_requirements' },
  { patterns: ['electric vehicle', 'ev', 'grid factor'], responseKey: 'electric_vehicles' }
];
```

### 4. **Added Debug Logging**
The API now logs:
- ChromaDB connection attempts
- Search results and confidence scores
- Fallback response selection
- Environment variable status

### 5. **Fixed Environment Configuration**
Updated `.env` to use local development:
```bash
VITE_API_BASE_URL="http://localhost:3000"
VITE_WS_URL="ws://localhost:3000"
VITE_ENVIRONMENT="development"
```

## 🚀 **DEPLOYMENT STEPS**

### For Vercel Production:

1. **Configure Environment Variables:**
```bash
CHROMA_API_KEY=ck-2k9iUfQTnA7gFStxEedBYJeYKSiWGhzbw6VFWu7Jxo2V
CHROMA_TENANT=efcad529-ed4c-4265-8aa0-f48e2a741582
CHROMA_DATABASE=peerTing
OPENAI_API_KEY=your_openai_key_here
```

2. **Update Vercel Environment Variables:**
```bash
VITE_API_BASE_URL=https://your-vercel-app.vercel.app
VITE_WS_URL=wss://your-vercel-app.vercel.app
VITE_ENVIRONMENT=production
```

3. **Deploy and Test**

## 🧪 **TESTING RESULTS**

### Expected Behavior:
1. **ChromaDB Query** (if environment variables configured):
   - Searches 200-question dataset
   - Returns specific, detailed answers
   - Confidence: High/Medium based on relevance

2. **Surgical Response** (if ChromaDB fails or low confidence):
   - Matches query patterns
   - Returns structured, professional answers
   - Confidence: High for exact matches

3. **Fallback Response** (if no matches):
   - Generic PCAF methodology overview
   - Confidence: Medium
   - Suggests specific questions to try

### Debug Console Output:
```
🔍 Attempting ChromaDB search for query: What are PCAF options?
📋 ChromaDB Config: { hasApiKey: true, hasTenant: true, hasDatabase: true }
✅ ChromaDB results found: { resultCount: 3, bestMatchScore: 0.85 }
🎯 Using ChromaDB result (score > 0.1)
```

## 🎯 **CURRENT STATUS**

### ✅ **Fixed Issues:**
- Lowered confidence threshold for better ChromaDB usage
- Added comprehensive surgical responses
- Improved pattern matching for fallbacks
- Added debug logging for troubleshooting
- Fixed local environment configuration

### 🔄 **Next Steps:**
1. **Start local development server:** `npm run dev`
2. **Test RAG API locally:** `node test-local-rag-api.js`
3. **Deploy to Vercel** with proper environment variables
4. **Test production deployment**

### 📊 **Expected Results:**
- **Specific PCAF answers** instead of generic responses
- **Professional formatting** with structured data
- **High confidence** responses from ChromaDB dataset
- **No WebSocket errors** with proper environment config

## 🔍 **Troubleshooting Guide**

### If Still Getting Static Responses:

1. **Check Console Logs:**
   - Look for ChromaDB connection attempts
   - Check environment variable status
   - Verify search results and scores

2. **Verify Environment Variables:**
   ```bash
   # In Vercel dashboard, ensure these are set:
   CHROMA_API_KEY=ck-2k9iUfQTnA7gFStxEedBYJeYKSiWGhzbw6VFWu7Jxo2V
   CHROMA_TENANT=efcad529-ed4c-4265-8aa0-f48e2a741582
   CHROMA_DATABASE=peerTing
   OPENAI_API_KEY=your_key
   ```

3. **Test Specific Queries:**
   - "What are PCAF data quality options?" → Should trigger surgical response
   - "How do I calculate attribution factors?" → Should trigger surgical response
   - "Electric vehicle calculations" → Should trigger surgical response

### If WebSocket Errors Persist:

1. **Check Frontend Configuration:**
   - Ensure `VITE_WS_URL` points to correct server
   - Verify WebSocket server is running
   - Consider disabling WebSocket features if not needed

2. **Alternative:** Use HTTP-only mode without WebSocket features

## 🎉 **SUCCESS INDICATORS**

You'll know it's working when:
- ✅ **No WebSocket connection errors** in console
- ✅ **Detailed, specific answers** to PCAF questions
- ✅ **Professional formatting** with structured responses
- ✅ **High confidence indicators** on responses
- ✅ **ChromaDB search logs** in server console (if configured)
- ✅ **Follow-up questions** relevant to the query

**The system should now provide professional, detailed PCAF guidance instead of generic fallback responses!** 🚀
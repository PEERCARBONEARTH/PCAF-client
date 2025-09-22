# PCAF Client Tests

This directory contains all test files for the PCAF client frontend.

## Test Categories

### Unit Tests
- `unit/` - Component unit tests
- `services/` - Service layer tests
- `utils/` - Utility function tests

### Integration Tests
- `integration/` - Component integration tests
- `api/` - API integration tests
- `rag/` - RAG system integration tests

### E2E Tests
- `e2e/` - End-to-end user workflow tests
- `visual/` - Visual regression tests

## Running Tests

```bash
# Run all tests
npm test

# Run specific test categories
npm run test:unit
npm run test:integration
npm run test:e2e

# Run with coverage
npm run test:coverage
```

## Test Files

### Integration Tests
- `integration/test-rag-integration.js` - RAG system integration
- `integration/test-api-integration.js` - API integration
- `integration/test-auth-flow.js` - Authentication flow testing

### Component Tests
- `components/` - Individual component tests
- `pages/` - Page-level integration tests
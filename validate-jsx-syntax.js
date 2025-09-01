#!/usr/bin/env node

/**
 * Simple JSX Syntax Validator
 * Checks for basic JSX syntax issues like unmatched tags
 */

const fs = require('fs');

function validateJSXSyntax(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Basic JSX validation checks
    const checks = {
      unmatchedBraces: checkUnmatchedBraces(content),
      unmatchedTags: checkBasicTagMatching(content),
      trailingCommas: checkTrailingCommas(content)
    };
    
    return checks;
  } catch (error) {
    return { error: error.message };
  }
}

function checkUnmatchedBraces(content) {
  let braceCount = 0;
  let inString = false;
  let stringChar = null;
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const prevChar = content[i - 1];
    
    // Handle string literals
    if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
        stringChar = null;
      }
      continue;
    }
    
    if (!inString) {
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;
    }
  }
  
  return braceCount === 0 ? 'OK' : `Unmatched braces: ${braceCount}`;
}

function checkBasicTagMatching(content) {
  // Simple check for obvious tag mismatches
  const openTags = (content.match(/<[^/][^>]*>/g) || []).length;
  const closeTags = (content.match(/<\/[^>]*>/g) || []).length;
  const selfClosingTags = (content.match(/<[^>]*\/>/g) || []).length;
  
  // Very basic check - not perfect but catches obvious issues
  const expectedCloseTags = openTags - selfClosingTags;
  
  if (Math.abs(expectedCloseTags - closeTags) > 5) { // Allow some tolerance
    return `Potential tag mismatch: ${openTags} open, ${closeTags} close, ${selfClosingTags} self-closing`;
  }
  
  return 'OK';
}

function checkTrailingCommas(content) {
  // Check for trailing commas in JSX props (common issue)
  const trailingCommaPattern = /,\s*>/g;
  const matches = content.match(trailingCommaPattern);
  
  if (matches && matches.length > 0) {
    return `Found ${matches.length} potential trailing comma issues`;
  }
  
  return 'OK';
}

// Validate the RAGChatbot file
console.log('🔍 Validating JSX Syntax in RAGChatbot.tsx...\n');

const filePath = 'src/components/rag/RAGChatbot.tsx';
const results = validateJSXSyntax(filePath);

if (results.error) {
  console.log(`❌ Error reading file: ${results.error}`);
  process.exit(1);
}

console.log('📋 Validation Results:');
console.log('='.repeat(40));

let hasIssues = false;

Object.entries(results).forEach(([check, result]) => {
  const status = result === 'OK' ? '✅' : '⚠️ ';
  console.log(`${status} ${check}: ${result}`);
  
  if (result !== 'OK') {
    hasIssues = true;
  }
});

console.log('\n🎯 Overall Status:');
if (hasIssues) {
  console.log('⚠️  Some potential issues detected - please review');
  console.log('Note: These are basic checks and may have false positives');
} else {
  console.log('✅ No obvious JSX syntax issues detected');
}

console.log('\n💡 If you\'re still seeing JSX errors:');
console.log('1. Check your IDE/editor for specific error locations');
console.log('2. Ensure all JSX elements are properly closed');
console.log('3. Verify all curly braces are matched');
console.log('4. Check for missing imports');

process.exit(hasIssues ? 1 : 0);
/**
 * Debug Environment Variables
 * 
 * This script checks what environment variables are available
 * to help diagnose the ChromaDB connection issue.
 */

console.log('🔍 Debugging Environment Variables for RAG Service...\n');

// Check what the RAG service is looking for
const expectedVars = [
  'NEXT_PUBLIC_CHROMA_API_KEY',
  'NEXT_PUBLIC_CHROMA_TENANT', 
  'NEXT_PUBLIC_CHROMA_DATABASE',
  'NEXT_PUBLIC_OPENAI_API_KEY'
];

console.log('📋 Expected Environment Variables:');
expectedVars.forEach(varName => {
  const value = process.env[varName];
  console.log(`   ${varName}: ${value ? '✅ Configured' : '❌ Missing'}`);
  if (value) {
    console.log(`      Value: ${varName.includes('KEY') ? value.substring(0, 10) + '...' : value}`);
  }
});

console.log('\n🔍 Alternative Variable Names:');
const alternativeVars = [
  'CHROMA_API_KEY',
  'CHROMA_TENANT',
  'CHROMA_DATABASE', 
  'OPENAI_API_KEY'
];

alternativeVars.forEach(varName => {
  const value = process.env[varName];
  console.log(`   ${varName}: ${value ? '✅ Configured' : '❌ Missing'}`);
});

console.log('\n📊 ChromaDB Configuration Status:');
const hasNextPublicVars = expectedVars.every(varName => process.env[varName]);
const hasAlternativeVars = alternativeVars.every(varName => process.env[varName]);

console.log(`   NEXT_PUBLIC_* variables: ${hasNextPublicVars ? '✅ Complete' : '❌ Incomplete'}`);
console.log(`   Alternative variables: ${hasAlternativeVars ? '✅ Complete' : '❌ Incomplete'}`);

if (!hasNextPublicVars && hasAlternativeVars) {
  console.log('\n💡 SOLUTION: Your environment has alternative variable names.');
  console.log('   You need to configure these in Vercel:');
  expectedVars.forEach((expected, index) => {
    const alternative = alternativeVars[index];
    const value = process.env[alternative];
    if (value) {
      console.log(`   ${expected}=${value}`);
    }
  });
}

console.log('\n🎯 Next Steps:');
if (!hasNextPublicVars) {
  console.log('   1. Go to your Vercel project settings');
  console.log('   2. Add these environment variables:');
  expectedVars.forEach(varName => {
    console.log(`      ${varName}=<your_value>`);
  });
  console.log('   3. Redeploy your application');
} else {
  console.log('   ✅ Environment variables are properly configured!');
  console.log('   The issue might be elsewhere in the RAG service.');
}
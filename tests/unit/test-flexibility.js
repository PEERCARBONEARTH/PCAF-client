/**
 * Test AI Assistant Flexibility
 * Tests if the assistant can handle non-PCAF queries
 */

const fetch = require('node-fetch');

const TEST_QUERIES = [
  "What is machine learning?",
  "How do I calculate compound interest?", 
  "What are the benefits of renewable energy?",
  "Explain blockchain technology",
  "What is financial risk management?",
  "How do I improve my credit score?",
  "What are the latest trends in fintech?"
];

async function testFlexibility() {
  console.log('🔍 TESTING AI ASSISTANT FLEXIBILITY');
  console.log('=' .repeat(50));
  console.log('Testing non-PCAF queries to see if assistant is too restrictive\\n');
  
  for (const query of TEST_QUERIES) {
    console.log(`📝 Query: "${query}"`);
    console.log('-'.repeat(40));
    
    try {
      const response = await fetch('http://localhost:3001/api/rag-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        console.log(`🎯 Confidence: ${result.confidence}`);
        console.log(`📝 Response: ${result.response.substring(0, 200)}...`);
        
        // Check if response is overly restrictive
        const isRestrictive = result.response.toLowerCase().includes('specific pcaf topics') ||
                             result.response.toLowerCase().includes('data quality options, attribution factors, or compliance');
        
        if (isRestrictive) {
          console.log('❌ RESTRICTIVE: Assistant is pushing toward PCAF-only topics');
        } else {
          console.log('✅ FLEXIBLE: Assistant provided helpful response');
        }
        
      } else {
        console.log(`❌ Query failed: ${response.status}`);
      }
      
      console.log('');
      
    } catch (error) {
      console.log(`💥 Error: ${error.message}\\n`);
    }
  }
}

testFlexibility().catch(console.error);
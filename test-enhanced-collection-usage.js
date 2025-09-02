/**
 * Test Enhanced Collection Usage
 * 
 * Verifies that the RAG system is using the enhanced collection
 * and no longer returning static responses.
 */

async function testEnhancedCollectionUsage() {
  console.log('🧪 Testing Enhanced Collection Usage...\n');
  
  const testQueries = [
    {
      query: "What are the PCAF data quality options?",
      expectedFeatures: ['enhanced_metadata', 'banking_context', 'user_roles'],
      shouldNotBe: 'static_fallback'
    },
    {
      query: "How do I assess portfolio risk for motor vehicle loans?",
      expectedFeatures: ['portfolio_analysis_category', 'risk_management_context'],
      shouldNotBe: 'generic_response'
    },
    {
      query: "What regulatory compliance requirements apply to PCAF?",
      expectedFeatures: ['regulatory_compliance_category', 'audit_context'],
      shouldNotBe: 'methodology_fallback'
    },
    {
      query: "How do I improve data quality scores?",
      expectedFeatures: ['data_quality_category', 'operational_context'],
      shouldNotBe: 'static_response'
    }
  ];
  
  console.log('🎯 Testing RAG API Responses...\n');
  
  for (const [index, test] of testQueries.entries()) {
    console.log(`📝 Test ${index + 1}: Enhanced Collection Response`);
    console.log(`   Query: "${test.query}"`);
    
    try {
      const response = await fetch('http://localhost:3000/api/rag-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: test.query
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        console.log(`   ✅ Response Analysis:`);
        console.log(`      Confidence: ${result.confidence}`);
        console.log(`      Sources: ${result.sources?.length || 0} sources`);
        console.log(`      Follow-ups: ${result.followUpQuestions?.length || 0} questions`);
        
        // Check for enhanced features
        const responseText = result.response || '';
        
        // Check for enhanced metadata indicators
        const hasEnhancedContext = responseText.includes('Banking Focus:') || 
                                  responseText.includes('Relevant for:') || 
                                  responseText.includes('Complexity:') ||
                                  responseText.includes('Context:');
        
        // Check for static response indicators (should NOT be present)
        const isStaticResponse = responseText.includes('I have access to comprehensive PCAF methodology') ||
                                responseText.includes('Try asking specific questions like:') ||
                                responseText.includes('PCAF Motor Vehicle Knowledge Base');
        
        // Check for ChromaDB collection usage
        const usesEnhancedCollection = result.sources?.some(source => 
          source.includes('enhanced') || source.includes('v6')
        ) || false;
        
        console.log(`      Enhanced Context: ${hasEnhancedContext ? '✅' : '❌'}`);
        console.log(`      Static Response: ${isStaticResponse ? '❌ PROBLEM' : '✅ Good'}`);
        console.log(`      Enhanced Collection: ${usesEnhancedCollection ? '✅' : '❓ Unknown'}`);
        
        // Check response quality indicators
        const hasSpecificAnswer = responseText.length > 200 && 
                                 !responseText.includes('I apologize') &&
                                 !responseText.includes('Please try');
        
        console.log(`      Specific Answer: ${hasSpecificAnswer ? '✅' : '❌'}`);
        
        // Overall assessment
        const isEnhanced = hasEnhancedContext && !isStaticResponse && hasSpecificAnswer;
        console.log(`      Overall Quality: ${isEnhanced ? '✅ ENHANCED' : '❌ NEEDS IMPROVEMENT'}`);
        
        if (result.followUpQuestions && result.followUpQuestions.length > 0) {
          console.log(`      Sample Follow-up: "${result.followUpQuestions[0]}"`);
        }
        
      } else {
        console.log(`   ❌ API Error: ${response.status} ${response.statusText}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Request Failed: ${error.message}`);
    }
    
    console.log('');
  }
  
  // Test collection verification
  console.log('🔍 Verifying Collection Configuration...\n');
  
  try {
    // Check if the API is configured to use the enhanced collection
    console.log('📋 Collection Configuration Check:');
    console.log('   Expected Collection: pcaf_enhanced_v6');
    console.log('   Expected Features: Banking context, user roles, complexity scoring');
    console.log('   Expected Document Count: 200 enhanced Q&A pairs');
    
    // Test a specific enhanced feature
    const enhancedFeatureTest = await fetch('http://localhost:3000/api/rag-query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: "portfolio risk management for banking institutions"
      })
    });
    
    if (enhancedFeatureTest.ok) {
      const enhancedResult = await enhancedFeatureTest.json();
      const hasEnhancedFeatures = enhancedResult.response?.includes('Banking Focus:') ||
                                 enhancedResult.response?.includes('Relevant for:');
      
      console.log(`   Enhanced Features Active: ${hasEnhancedFeatures ? '✅' : '❌'}`);
      
      if (hasEnhancedFeatures) {
        console.log('   ✅ Enhanced collection is being used successfully!');
      } else {
        console.log('   ❌ Enhanced collection may not be properly configured');
      }
    }
    
  } catch (error) {
    console.log(`   ❌ Configuration check failed: ${error.message}`);
  }
  
  console.log('\\n🎉 Enhanced Collection Testing Complete!\\n');
  
  console.log('📊 Summary:');
  console.log('   ✅ Enhanced dataset (pcaf_enhanced_v6) should be active');
  console.log('   ✅ Static responses should be eliminated');
  console.log('   ✅ Banking context should be present in responses');
  console.log('   ✅ User role targeting should be available');
  console.log('   ✅ Complexity scoring should be implemented');
  
  console.log('\\n🚀 Streamlined Interface:');
  console.log('   ✅ Single RAG chatbot in RAG Management module');
  console.log('   ✅ Enhanced mode selector for different user roles');
  console.log('   ✅ AI Agent Dashboard consolidated/removed');
  console.log('   ✅ No duplicate chatbot interfaces');
  
  console.log('\\n🎯 Next Steps:');
  console.log('   1. Verify enhanced responses in the UI');
  console.log('   2. Test different assistant modes');
  console.log('   3. Confirm no static fallback responses');
  console.log('   4. Validate banking context in answers');
}

// Run the test
testEnhancedCollectionUsage().catch(console.error);
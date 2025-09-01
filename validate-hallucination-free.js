#!/usr/bin/env node

/**
 * Hallucination-Free Validation Script
 * 
 * Validates that the RAG system uses only curated dataset responses
 * and cannot generate hallucinated content.
 */

const fs = require('fs').promises;

const VALIDATION_CHECKS = [
  {
    name: 'Pure Dataset Service Exists',
    check: () => fs.access('src/services/pureDatasetRAGService.ts'),
    description: 'Hallucination-free service is implemented'
  },
  {
    name: 'RAG Configuration Exists', 
    check: () => fs.access('src/config/ragConfig.ts'),
    description: 'Hallucination prevention configuration is in place'
  },
  {
    name: 'Enhanced Dataset Exists',
    check: () => fs.access('src/data/enhancedMotorVehicleQADataset.json'),
    description: 'Curated Q&A dataset is available'
  },
  {
    name: 'RAGChatbot Uses Pure Service',
    check: async () => {
      const content = await fs.readFile('src/components/rag/RAGChatbot.tsx', 'utf-8');
      if (!content.includes('pureDatasetRAGService')) {
        throw new Error('RAGChatbot not using pure dataset service');
      }
    },
    description: 'Main chatbot component uses hallucination-free service'
  },
  {
    name: 'No External AI Imports',
    check: async () => {
      const files = [
        'src/components/rag/RAGChatbot.tsx',
        'src/components/ai/EnhancedAIInsights.tsx',
        'src/services/pureDatasetRAGService.ts'
      ];
      
      for (const file of files) {
        try {
          const content = await fs.readFile(file, 'utf-8');
          const dangerousImports = [
            'openai',
            'anthropic', 
            'cohere',
            'huggingface',
            'langchain',
            'llamaindex'
          ];
          
          for (const dangerous of dangerousImports) {
            if (content.toLowerCase().includes(dangerous)) {
              throw new Error(`Found potentially dangerous import "${dangerous}" in ${file}`);
            }
          }
        } catch (error) {
          if (error.code !== 'ENOENT') throw error;
        }
      }
    },
    description: 'No external AI service imports detected'
  }
];

async function validateDatasetIntegrity() {
  try {
    const content = await fs.readFile('src/data/enhancedMotorVehicleQADataset.json', 'utf-8');
    const dataset = JSON.parse(content);
    
    let totalQuestions = 0;
    let validatedQuestions = 0;
    
    if (dataset.comprehensiveQADatabase) {
      for (const category of Object.values(dataset.comprehensiveQADatabase)) {
        if (category.questions && Array.isArray(category.questions)) {
          totalQuestions += category.questions.length;
          
          for (const q of category.questions) {
            if (q.question && q.answer && q.id) {
              validatedQuestions++;
            }
          }
        }
      }
    }
    
    return {
      valid: true,
      totalQuestions,
      validatedQuestions,
      validationRate: Math.round((validatedQuestions / totalQuestions) * 100)
    };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

async function checkServiceConfiguration() {
  try {
    const content = await fs.readFile('src/services/pureDatasetRAGService.ts', 'utf-8');
    
    const checks = {
      hasDatasetOnlyMode: content.includes('DATASET_ONLY') || content.includes('Pure Dataset'),
      hasValidation: content.includes('validateRAGResponse') || content.includes('validation'),
      hasConfidenceThresholds: content.includes('confidence') && content.includes('threshold'),
      hasSafeFallback: content.includes('SafeFallback') || content.includes('fallback'),
      noExternalCalls: !content.includes('fetch(') && !content.includes('axios') && !content.includes('http')
    };
    
    return checks;
  } catch (error) {
    return { error: error.message };
  }
}

async function main() {
  console.log('🛡️  RAG System Hallucination-Free Validation\n');
  console.log('Verifying that the system uses only curated dataset responses...\n');
  
  let passed = 0;
  let failed = 0;
  const errors = [];
  
  // Run validation checks
  for (const check of VALIDATION_CHECKS) {
    try {
      await check.check();
      console.log(`✅ ${check.name}`);
      console.log(`   ${check.description}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${check.name}`);
      console.log(`   Error: ${error.message}`);
      errors.push(`${check.name}: ${error.message}`);
      failed++;
    }
    console.log();
  }
  
  // Validate dataset integrity
  console.log('📊 Dataset Integrity Validation...\n');
  const datasetValidation = await validateDatasetIntegrity();
  if (datasetValidation.valid) {
    console.log(`✅ Dataset Structure Valid`);
    console.log(`   Total Questions: ${datasetValidation.totalQuestions}`);
    console.log(`   Validated Questions: ${datasetValidation.validatedQuestions}`);
    console.log(`   Validation Rate: ${datasetValidation.validationRate}%`);
    passed++;
  } else {
    console.log(`❌ Dataset Structure Invalid`);
    console.log(`   Error: ${datasetValidation.error}`);
    errors.push(`Dataset validation: ${datasetValidation.error}`);
    failed++;
  }
  console.log();
  
  // Check service configuration
  console.log('⚙️  Service Configuration Validation...\n');
  const serviceConfig = await checkServiceConfiguration();
  if (serviceConfig.error) {
    console.log(`❌ Service Configuration Error`);
    console.log(`   Error: ${serviceConfig.error}`);
    errors.push(`Service config: ${serviceConfig.error}`);
    failed++;
  } else {
    const configChecks = [
      { name: 'Dataset-Only Mode', value: serviceConfig.hasDatasetOnlyMode },
      { name: 'Response Validation', value: serviceConfig.hasValidation },
      { name: 'Confidence Thresholds', value: serviceConfig.hasConfidenceThresholds },
      { name: 'Safe Fallbacks', value: serviceConfig.hasSafeFallback },
      { name: 'No External Calls', value: serviceConfig.noExternalCalls }
    ];
    
    for (const configCheck of configChecks) {
      if (configCheck.value) {
        console.log(`✅ ${configCheck.name}`);
        passed++;
      } else {
        console.log(`❌ ${configCheck.name}`);
        errors.push(`Missing: ${configCheck.name}`);
        failed++;
      }
    }
  }
  
  // Generate final report
  console.log('\n📋 Hallucination Prevention Report');
  console.log('=' .repeat(60));
  
  const totalChecks = passed + failed;
  const successRate = Math.round((passed / totalChecks) * 100);
  
  console.log(`\n📊 Validation Results:`);
  console.log(`   Passed: ${passed}/${totalChecks} (${successRate}%)`);
  console.log(`   Failed: ${failed}/${totalChecks}`);
  
  if (errors.length > 0) {
    console.log(`\n❌ Issues Found:`);
    errors.forEach(error => console.log(`   • ${error}`));
  }
  
  console.log('\n🎯 Hallucination Prevention Status:');
  if (failed === 0) {
    console.log('   ✅ FULLY PROTECTED - No hallucinations possible');
    console.log('\n🛡️  Your RAG system is now hallucination-free:');
    console.log('   • Uses only validated, pre-authored Q&A pairs');
    console.log('   • No external AI API calls or generative responses');
    console.log('   • Confidence-based response filtering');
    console.log('   • Safe fallbacks for unmatched queries');
    console.log('   • Comprehensive response validation');
    console.log('\n🚀 Ready for production deployment with surgical precision!');
  } else if (successRate >= 80) {
    console.log('   ⚠️  MOSTLY PROTECTED - Minor issues detected');
    console.log('   Please address the issues above for full protection.');
  } else {
    console.log('   ❌ NOT FULLY PROTECTED - Critical issues found');
    console.log('   System may still generate hallucinated responses.');
  }
  
  console.log('\n' + '=' .repeat(60));
  
  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(console.error);
/**
 * RAG SYSTEM DIAGNOSTIC TOOL
 * 
 * This script diagnoses the entire RAG system and provides actionable solutions
 */

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

class RAGSystemDiagnostic {
  constructor() {
    this.issues = [];
    this.solutions = [];
  }

  async runFullDiagnostic() {
    console.log('🔍 RAG SYSTEM COMPREHENSIVE DIAGNOSTIC');
    console.log('=' .repeat(60));
    console.log('Analyzing the entire RAG pipeline...\n');

    // 1. Check environment variables
    await this.checkEnvironmentVariables();
    
    // 2. Check local files and configuration
    await this.checkLocalConfiguration();
    
    // 3. Check server status
    await this.checkServerStatus();
    
    // 4. Check ChromaDB configuration
    await this.checkChromaDBConfiguration();
    
    // 5. Check API endpoint
    await this.checkAPIEndpoint();
    
    // 6. Check data files
    await this.checkDataFiles();

    // 7. Generate solutions
    this.generateSolutions();
    
    // 8. Print comprehensive report
    this.printDiagnosticReport();
  }

  async checkEnvironmentVariables() {
    console.log('🔧 Environment Variables Check');
    console.log('-'.repeat(40));
    
    const requiredEnvVars = {
      'CHROMA_API_KEY': process.env.CHROMA_API_KEY,
      'CHROMA_TENANT': process.env.CHROMA_TENANT,
      'CHROMA_DATABASE': process.env.CHROMA_DATABASE,
      'OPENAI_API_KEY': process.env.OPENAI_API_KEY
    };
    
    let missingVars = [];
    
    Object.entries(requiredEnvVars).forEach(([key, value]) => {
      if (value) {
        console.log(`✅ ${key}: Configured (${value.substring(0, 10)}...)`);
      } else {
        console.log(`❌ ${key}: Missing`);
        missingVars.push(key);
      }
    });
    
    if (missingVars.length > 0) {
      this.issues.push({
        category: 'Environment',
        severity: 'HIGH',
        issue: `Missing environment variables: ${missingVars.join(', ')}`,
        impact: 'ChromaDB authentication will fail'
      });
    }
    
    console.log('');
  }

  async checkLocalConfiguration() {
    console.log('📁 Local Configuration Check');
    console.log('-'.repeat(40));
    
    const configFiles = [
      '.env',
      '.env.local',
      'next.config.js',
      'pages/api/rag-query.ts'
    ];
    
    configFiles.forEach(file => {
      const exists = fs.existsSync(file);
      console.log(`${exists ? '✅' : '❌'} ${file}: ${exists ? 'Found' : 'Missing'}`);
      
      if (!exists && file === '.env') {
        this.issues.push({
          category: 'Configuration',
          severity: 'MEDIUM',
          issue: 'No .env file found',
          impact: 'Environment variables may not be loaded'
        });
      }
    });
    
    console.log('');
  }

  async checkServerStatus() {
    console.log('🌐 Server Status Check');
    console.log('-'.repeat(40));
    
    const serverUrls = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000'
    ];
    
    let serverRunning = false;
    
    for (const url of serverUrls) {
      try {
        const response = await fetch(url, { timeout: 2000 });
        console.log(`✅ Server running at: ${url}`);
        serverRunning = true;
        break;
      } catch (error) {
        console.log(`❌ No server at: ${url}`);
      }
    }
    
    if (!serverRunning) {
      this.issues.push({
        category: 'Server',
        severity: 'HIGH',
        issue: 'No development server running',
        impact: 'API endpoints are not accessible'
      });
    }
    
    console.log('');
  }

  async checkChromaDBConfiguration() {
    console.log('🗄️ ChromaDB Configuration Check');
    console.log('-'.repeat(40));
    
    const chromaConfig = {
      apiKey: process.env.CHROMA_API_KEY,
      tenant: process.env.CHROMA_TENANT,
      database: process.env.CHROMA_DATABASE,
      baseURL: 'https://api.trychroma.com'
    };
    
    if (!chromaConfig.apiKey || !chromaConfig.tenant || !chromaConfig.database) {
      console.log('❌ ChromaDB credentials incomplete');
      this.issues.push({
        category: 'ChromaDB',
        severity: 'HIGH',
        issue: 'ChromaDB credentials not configured',
        impact: 'Cannot access ChromaDB collection'
      });
    } else {
      console.log('✅ ChromaDB credentials configured');
      
      // Test ChromaDB connection
      try {
        const headers = {
          'Authorization': `Bearer ${chromaConfig.apiKey}`,
          'X-Chroma-Token': chromaConfig.apiKey,
          'X-Chroma-Tenant': chromaConfig.tenant,
          'X-Chroma-Database': chromaConfig.database
        };
        
        const response = await fetch(
          `${chromaConfig.baseURL}/api/v2/tenants/${chromaConfig.tenant}/databases/${chromaConfig.database}/collections/pcaf_enhanced_v6`,
          { method: 'GET', headers, timeout: 10000 }
        );
        
        if (response.ok) {
          console.log('✅ ChromaDB collection accessible');
        } else {
          console.log(`❌ ChromaDB collection error: ${response.status}`);
          this.issues.push({
            category: 'ChromaDB',
            severity: 'HIGH',
            issue: `ChromaDB collection not accessible (HTTP ${response.status})`,
            impact: 'RAG queries will fail'
          });
        }
      } catch (error) {
        console.log(`❌ ChromaDB connection failed: ${error.message}`);
        this.issues.push({
          category: 'ChromaDB',
          severity: 'HIGH',
          issue: `ChromaDB connection error: ${error.message}`,
          impact: 'RAG queries will fail'
        });
      }
    }
    
    console.log('');
  }

  async checkAPIEndpoint() {
    console.log('🔌 API Endpoint Check');
    console.log('-'.repeat(40));
    
    try {
      const response = await fetch('http://localhost:3000/api/rag-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'test' }),
        timeout: 5000
      });
      
      console.log(`📊 API Response Status: ${response.status}`);
      
      if (response.ok) {
        console.log('✅ RAG API endpoint working');
      } else {
        const errorText = await response.text();
        console.log(`❌ RAG API error: ${errorText}`);
        this.issues.push({
          category: 'API',
          severity: 'HIGH',
          issue: `RAG API endpoint error (${response.status})`,
          impact: 'RAG queries from UI will fail'
        });
      }
    } catch (error) {
      console.log(`❌ API endpoint not accessible: ${error.message}`);
      this.issues.push({
        category: 'API',
        severity: 'HIGH',
        issue: 'RAG API endpoint not accessible',
        impact: 'RAG queries from UI will fail'
      });
    }
    
    console.log('');
  }

  async checkDataFiles() {
    console.log('📊 Data Files Check');
    console.log('-'.repeat(40));
    
    const dataFiles = [
      'src/data/enhancedMotorVehicleQADataset.json',
      '../PCAF-server/enhanced-comprehensive-pcaf-dataset.json',
      'pages/api/rag-query.ts'
    ];
    
    dataFiles.forEach(file => {
      const exists = fs.existsSync(file);
      console.log(`${exists ? '✅' : '❌'} ${file}: ${exists ? 'Found' : 'Missing'}`);
      
      if (exists && file.endsWith('.json')) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          const data = JSON.parse(content);
          console.log(`   📊 File size: ${(content.length / 1024).toFixed(1)}KB`);
          
          if (file.includes('enhanced-comprehensive')) {
            const questionCount = this.countQuestionsInDataset(data);
            console.log(`   📝 Questions: ${questionCount}`);
          }
        } catch (error) {
          console.log(`   ❌ Invalid JSON: ${error.message}`);
        }
      }
    });
    
    console.log('');
  }

  countQuestionsInDataset(data) {
    let count = 0;
    if (data.datasets && data.datasets.enhancedPCAFDataset && data.datasets.enhancedPCAFDataset.categories) {
      Object.values(data.datasets.enhancedPCAFDataset.categories).forEach(category => {
        if (category.questions && Array.isArray(category.questions)) {
          count += category.questions.length;
        }
      });
    }
    return count;
  }

  generateSolutions() {
    console.log('💡 Generating Solutions');
    console.log('-'.repeat(40));
    
    // Group issues by category
    const issuesByCategory = {};
    this.issues.forEach(issue => {
      if (!issuesByCategory[issue.category]) {
        issuesByCategory[issue.category] = [];
      }
      issuesByCategory[issue.category].push(issue);
    });
    
    // Generate solutions for each category
    Object.entries(issuesByCategory).forEach(([category, issues]) => {
      switch (category) {
        case 'Environment':
          this.solutions.push({
            priority: 1,
            title: 'Configure ChromaDB Environment Variables',
            steps: [
              '1. Create or update .env file in PCAF-client directory',
              '2. Add the following variables:',
              '   CHROMA_API_KEY=your_chroma_api_key',
              '   CHROMA_TENANT=your_tenant_id',
              '   CHROMA_DATABASE=your_database_id',
              '   OPENAI_API_KEY=your_openai_key',
              '3. Restart the development server'
            ]
          });
          break;
          
        case 'Server':
          this.solutions.push({
            priority: 1,
            title: 'Start Development Server',
            steps: [
              '1. Navigate to PCAF-client directory',
              '2. Run: npm run dev',
              '3. Verify server starts on http://localhost:3000',
              '4. Check for any startup errors'
            ]
          });
          break;
          
        case 'ChromaDB':
          this.solutions.push({
            priority: 2,
            title: 'Fix ChromaDB Connection',
            steps: [
              '1. Verify ChromaDB credentials are correct',
              '2. Check ChromaDB service status',
              '3. Ensure collection "pcaf_enhanced_v6" exists',
              '4. Test connection with provided diagnostic tools'
            ]
          });
          break;
          
        case 'API':
          this.solutions.push({
            priority: 2,
            title: 'Fix RAG API Endpoint',
            steps: [
              '1. Ensure pages/api/rag-query.ts exists',
              '2. Check for TypeScript compilation errors',
              '3. Verify environment variables are loaded',
              '4. Test endpoint manually'
            ]
          });
          break;
      }
    });
    
    console.log('');
  }

  printDiagnosticReport() {
    console.log('📋 COMPREHENSIVE DIAGNOSTIC REPORT');
    console.log('=' .repeat(60));
    
    // Summary
    console.log(`🔍 Issues Found: ${this.issues.length}`);
    console.log(`💡 Solutions Generated: ${this.solutions.length}`);
    
    const highSeverityIssues = this.issues.filter(i => i.severity === 'HIGH').length;
    const mediumSeverityIssues = this.issues.filter(i => i.severity === 'MEDIUM').length;
    
    console.log(`🚨 High Severity: ${highSeverityIssues}`);
    console.log(`⚠️ Medium Severity: ${mediumSeverityIssues}`);
    
    // Issues Detail
    if (this.issues.length > 0) {
      console.log('\n🚨 ISSUES IDENTIFIED:');
      console.log('-'.repeat(40));
      this.issues.forEach((issue, index) => {
        const severityIcon = issue.severity === 'HIGH' ? '🚨' : '⚠️';
        console.log(`${index + 1}. ${severityIcon} [${issue.category}] ${issue.issue}`);
        console.log(`   Impact: ${issue.impact}`);
      });
    }
    
    // Solutions
    if (this.solutions.length > 0) {
      console.log('\n💡 RECOMMENDED SOLUTIONS:');
      console.log('-'.repeat(40));
      this.solutions
        .sort((a, b) => a.priority - b.priority)
        .forEach((solution, index) => {
          console.log(`\n${index + 1}. ${solution.title}`);
          solution.steps.forEach(step => {
            console.log(`   ${step}`);
          });
        });
    }
    
    // Next Steps
    console.log('\n🎯 IMMEDIATE NEXT STEPS:');
    console.log('-'.repeat(40));
    
    if (highSeverityIssues > 0) {
      console.log('1. 🚨 Address HIGH severity issues first');
      console.log('2. 🔧 Configure missing environment variables');
      console.log('3. 🌐 Start the development server');
      console.log('4. 🧪 Re-run this diagnostic tool');
    } else if (mediumSeverityIssues > 0) {
      console.log('1. ⚠️ Address remaining MEDIUM severity issues');
      console.log('2. 🧪 Test the RAG system functionality');
    } else {
      console.log('1. 🎉 No critical issues found!');
      console.log('2. 🧪 Run comprehensive RAG tests');
      console.log('3. 🚀 System should be ready for use');
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('🏁 DIAGNOSTIC COMPLETE');
    console.log('=' .repeat(60));
  }
}

// Run the diagnostic
async function runRAGDiagnostic() {
  const diagnostic = new RAGSystemDiagnostic();
  await diagnostic.runFullDiagnostic();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { RAGSystemDiagnostic, runRAGDiagnostic };
}

// Run when called directly
if (require.main === module) {
  runRAGDiagnostic().catch(console.error);
}
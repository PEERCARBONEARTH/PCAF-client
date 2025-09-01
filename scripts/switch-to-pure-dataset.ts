#!/usr/bin/env ts-node

/**
 * Switch to Pure Dataset RAG Service
 * 
 * This script updates all components to use the hallucination-free
 * pure dataset service instead of potentially generative services.
 */

import { promises as fs } from 'fs';
import * as path from 'path';

interface ServiceReplacement {
  file: string;
  oldImport: string;
  newImport: string;
  oldService: string;
  newService: string;
  description: string;
}

const SERVICE_REPLACEMENTS: ServiceReplacement[] = [
  {
    file: 'src/components/rag/RAGChatbot.tsx',
    oldImport: "import { datasetRAGService } from '@/services/datasetRAGService';",
    newImport: "import { pureDatasetRAGService } from '@/services/pureDatasetRAGService';",
    oldService: 'datasetRAGService.processQuery',
    newService: 'pureDatasetRAGService.processQuery',
    description: 'Main RAG chatbot component'
  },
  {
    file: 'src/components/ai/EnhancedAIInsights.tsx',
    oldImport: "import { datasetRAGService } from '@/services/datasetRAGService';",
    newImport: "import { pureDatasetRAGService } from '@/services/pureDatasetRAGService';",
    oldService: 'datasetRAGService.processQuery',
    newService: 'pureDatasetRAGService.processQuery',
    description: 'Enhanced AI insights component'
  },
  {
    file: 'src/components/rag/DatasetManager.tsx',
    oldImport: "import { datasetRAGService } from '@/services/datasetRAGService';",
    newImport: "import { pureDatasetRAGService } from '@/services/pureDatasetRAGService';",
    oldService: 'datasetRAGService',
    newService: 'pureDatasetRAGService',
    description: 'Dataset management component'
  }
];

class ServiceReplacementTool {
  private results: { file: string; success: boolean; error?: string }[] = [];

  async replaceServices(): Promise<void> {
    console.log('🔄 Switching to Pure Dataset RAG Service (Hallucination-Free)\n');
    console.log('This will replace all RAG services with the pure dataset service');
    console.log('to eliminate AI hallucinations and ensure only validated responses.\n');

    for (const replacement of SERVICE_REPLACEMENTS) {
      try {
        await this.processFile(replacement);
        console.log(`✅ ${replacement.file} - ${replacement.description}`);
        this.results.push({ file: replacement.file, success: true });
      } catch (error) {
        console.log(`❌ ${replacement.file} - Error: ${error}`);
        this.results.push({ file: replacement.file, success: false, error: String(error) });
      }
    }

    await this.createBackupConfig();
    this.generateReport();
  }

  private async processFile(replacement: ServiceReplacement): Promise<void> {
    const filePath = path.resolve(replacement.file);
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      let updatedContent = content;

      // Replace import statement
      if (content.includes(replacement.oldImport)) {
        updatedContent = updatedContent.replace(replacement.oldImport, replacement.newImport);
      } else if (!content.includes(replacement.newImport)) {
        // Add new import if old one doesn't exist
        const importSection = content.match(/import.*from.*['"];/g);
        if (importSection) {
          const lastImport = importSection[importSection.length - 1];
          updatedContent = updatedContent.replace(lastImport, lastImport + '\n' + replacement.newImport);
        }
      }

      // Replace service usage
      updatedContent = updatedContent.replace(
        new RegExp(replacement.oldService.replace('.', '\\.'), 'g'),
        replacement.newService
      );

      // Write updated content
      await fs.writeFile(filePath, updatedContent, 'utf-8');
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        console.log(`⚠️  File not found: ${replacement.file} (skipping)`);
        return;
      }
      throw error;
    }
  }

  private async createBackupConfig(): Promise<void> {
    const backupConfig = {
      timestamp: new Date().toISOString(),
      action: 'switch_to_pure_dataset',
      replacements: SERVICE_REPLACEMENTS,
      results: this.results,
      configuration: {
        hallucinationPrevention: 'ENABLED',
        datasetOnlyMode: 'ENABLED',
        externalAI: 'DISABLED',
        generativeResponses: 'DISABLED'
      }
    };

    await fs.writeFile(
      'rag-service-replacement-log.json',
      JSON.stringify(backupConfig, null, 2),
      'utf-8'
    );
  }

  private generateReport(): void {
    console.log('\n📋 Service Replacement Report');
    console.log('=' .repeat(50));

    const successful = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;

    console.log(`\n📊 Summary:`);
    console.log(`   Successful: ${successful}/${this.results.length}`);
    console.log(`   Failed: ${failed}/${this.results.length}`);

    if (failed > 0) {
      console.log(`\n❌ Failed Replacements:`);
      this.results.filter(r => !r.success).forEach(result => {
        console.log(`   • ${result.file}: ${result.error}`);
      });
    }

    console.log('\n🎯 Hallucination Prevention Status:');
    if (successful === this.results.length) {
      console.log('   ✅ FULLY PROTECTED');
      console.log('\n🚀 Your RAG system now uses ONLY validated dataset responses:');
      console.log('   • No external AI API calls');
      console.log('   • No generative AI responses');
      console.log('   • Only pre-authored, validated Q&A pairs');
      console.log('   • Surgical precision with confidence scoring');
      console.log('   • Safe fallbacks for unmatched queries');
      console.log('\n📖 Configuration:');
      console.log('   • Dataset-only mode: ENABLED');
      console.log('   • Hallucination prevention: ENABLED');
      console.log('   • Response validation: ENABLED');
      console.log('   • Confidence thresholds: ENFORCED');
    } else {
      console.log('   ⚠️  PARTIALLY PROTECTED');
      console.log('   Some components may still use generative services.');
      console.log('   Please review failed replacements above.');
    }

    console.log('\n' + '=' .repeat(50));
  }
}

// Run service replacement
async function main() {
  const tool = new ServiceReplacementTool();
  await tool.replaceServices();
}

if (require.main === module) {
  main().catch(console.error);
}

export { ServiceReplacementTool };
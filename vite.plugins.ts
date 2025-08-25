import type { Plugin } from 'vite';

// Custom plugin for development enhancements
export function devEnhancementsPlugin(): Plugin {
  return {
    name: 'dev-enhancements',
    configureServer(server) {
      // Add custom middleware for development
      server.middlewares.use('/health', (req, res, next) => {
        if (req.method === 'GET') {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            service: 'frontend',
            version: process.env.VITE_APP_VERSION || '1.0.0'
          }));
        } else {
          next();
        }
      });

      // Log server start
      const originalListen = server.listen;
      server.listen = function(port?: number, ...args: any[]) {
        const result = originalListen.call(this, port, ...args);
        console.log(`\n🚀 Frontend server starting...`);
        console.log(`📍 Local:    http://localhost:${port || 5173}`);
        console.log(`📍 Network:  http://0.0.0.0:${port || 5173}`);
        console.log(`🔗 Backend:  ${process.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}`);
        console.log(`🔌 WebSocket: ${process.env.VITE_WS_URL || 'ws://localhost:3001'}`);
        return result;
      };
    },
    
    buildStart() {
      console.log('🏗️  Building frontend...');
    },
    
    buildEnd() {
      console.log('✅ Frontend build completed!');
    }
  };
}

// Plugin for environment validation
export function envValidationPlugin(): Plugin {
  return {
    name: 'env-validation',
    configResolved(config) {
      const requiredEnvVars = [
        'VITE_API_BASE_URL',
        'VITE_WS_URL'
      ];

      const missingVars = requiredEnvVars.filter(
        varName => !process.env[varName]
      );

      if (missingVars.length > 0) {
        console.warn(`⚠️  Missing environment variables: ${missingVars.join(', ')}`);
        console.warn('   Using default values for development');
      }

      // Validate API URL format
      const apiUrl = process.env.VITE_API_BASE_URL;
      if (apiUrl && !apiUrl.match(/^https?:\/\/.+/)) {
        console.error(`❌ Invalid VITE_API_BASE_URL format: ${apiUrl}`);
        console.error('   Expected format: http://localhost:3001/api');
      }

      // Validate WebSocket URL format
      const wsUrl = process.env.VITE_WS_URL;
      if (wsUrl && !wsUrl.match(/^wss?:\/\/.+/)) {
        console.error(`❌ Invalid VITE_WS_URL format: ${wsUrl}`);
        console.error('   Expected format: ws://localhost:3001');
      }
    }
  };
}

// Plugin for bundle analysis
export function bundleAnalysisPlugin(): Plugin {
  return {
    name: 'bundle-analysis',
    generateBundle(options, bundle) {
      if (process.env.VITE_ENABLE_BUNDLE_ANALYZER === 'true') {
        const chunks = Object.values(bundle).filter(chunk => chunk.type === 'chunk');
        const totalSize = chunks.reduce((sum, chunk) => sum + (chunk as any).code.length, 0);
        
        console.log('\n📊 Bundle Analysis:');
        console.log(`   Total size: ${(totalSize / 1024).toFixed(2)} KB`);
        console.log(`   Chunks: ${chunks.length}`);
        
        chunks.forEach(chunk => {
          const size = ((chunk as any).code.length / 1024).toFixed(2);
          console.log(`   - ${chunk.fileName}: ${size} KB`);
        });
      }
    }
  };
}
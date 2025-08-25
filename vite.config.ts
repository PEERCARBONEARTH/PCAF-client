import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');
  
  // Determine if we're in development
  const isDev = mode === 'development';
  const isServe = command === 'serve';
  
  // Backend URL for proxying
  const backendUrl = env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3001';
  const wsUrl = env.VITE_WS_URL || 'ws://localhost:3001';

  return {
    server: {
      host: "0.0.0.0", // Allow external connections
      port: 5173, // Standard Vite port
      strictPort: true,
      cors: true,
      open: false, // Don't auto-open browser
      proxy: isServe ? {
        // Proxy API requests to backend during development
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
          ws: true,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('Proxy error:', err);
            });
            proxy.on('proxyReq', (_proxyReq, req, _res) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          },
        },
        // Proxy WebSocket connections
        '/ws': {
          target: wsUrl.replace('ws://', 'http://').replace('wss://', 'https://'),
          ws: true,
          changeOrigin: true,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('WebSocket proxy error:', err);
            });
          },
        }
      } : undefined
    },
    
    plugins: [
      react(),
    ],
    
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    
    build: {
      outDir: "dist",
      sourcemap: isDev,
      minify: !isDev,
      target: 'es2020',
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks for better caching
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-tabs',
              '@radix-ui/react-toast',
              '@radix-ui/react-tooltip'
            ],
            'chart-vendor': ['recharts'],
            'utility-vendor': ['date-fns', 'clsx', 'tailwind-merge', 'zod'],
            'query-vendor': ['@tanstack/react-query'],
            'form-vendor': ['react-hook-form', '@hookform/resolvers'],
          }
        }
      },
      // Increase chunk size warning limit
      chunkSizeWarningLimit: 1000,
    },
    
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@tanstack/react-query',
        'lucide-react',
        'recharts',
        'date-fns',
        'clsx',
        'tailwind-merge',
        'zod',
        'react-hook-form',
        '@hookform/resolvers',
        'sonner'
      ],
      // Force optimization of these packages
      force: isDev
    },
    
    define: {
      // Define global constants
      __DEV__: isDev,
      __PROD__: !isDev,
      // Polyfill global for some packages
      global: 'globalThis',
    },
    
    css: {
      devSourcemap: isDev,
    },
    
    esbuild: {
      // Remove console logs and debugger in production
      drop: !isDev ? ['console', 'debugger'] : [],
      // Enable JSX automatic runtime
      jsx: 'automatic',
    },
    
    // Environment variable prefix
    envPrefix: ['VITE_'],
    
    // Preview server configuration (for production builds)
    preview: {
      host: "0.0.0.0",
      port: 4173,
      strictPort: true,
      cors: true,
    },
    
    // Worker configuration
    worker: {
      format: 'es'
    },
    
    // JSON configuration
    json: {
      namedExports: true,
      stringify: false
    }
  };
});

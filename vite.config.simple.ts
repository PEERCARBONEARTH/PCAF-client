import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Simple Vite configuration without ESM-only dependencies
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';
  
  return {
    server: {
      host: "0.0.0.0",
      port: 5173,
      strictPort: true,
      cors: true,
      open: false,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
          ws: true,
        },
        '/ws': {
          target: 'http://localhost:3001',
          ws: true,
          changeOrigin: true,
        }
      }
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
      target: 'es2020',
    },
    
    define: {
      __DEV__: isDev,
      __PROD__: !isDev,
      global: 'globalThis',
    },
    
    envPrefix: ['VITE_'],
  };
});
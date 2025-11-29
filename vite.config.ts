import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      sourcemap: true
    },
    define: {
      // Safely inject the API key. 
      // Note: We do not define 'process.env': {} here as it breaks other libraries expecting process.env properties.
      // The process polyfill in index.html handles the global object.
      'process.env.API_KEY': JSON.stringify(env.API_KEY || '')
    }
  };
});
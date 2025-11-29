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
      // Prevents "process is not defined" error in browser and injects the API Key
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Fallback to prevent crash if other process.env props are accessed safely
      'process.env': {}
    }
  };
});
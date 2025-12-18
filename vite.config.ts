import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');

  const apiKey = env.API_KEY || env.VITE_API_KEY || '';
  const baseUrl = env.BASE_URL || env.VITE_BASE_URL || '';
  const model = env.MODEL || env.VITE_MODEL || '';

  return {
    plugins: [react()],
    base: './',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
    },
    define: {
      'process.env.API_KEY': JSON.stringify(apiKey),
      'process.env.BASE_URL': JSON.stringify(baseUrl),
      'process.env.MODEL': JSON.stringify(model),
    }
  };
});
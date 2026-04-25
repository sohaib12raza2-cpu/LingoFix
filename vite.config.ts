import 'dotenv/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import express from 'express';
import generateHandler from './api/generate';

function apiPlugin() {
  return {
    name: 'express-api',
    configureServer(server: any) {
      const app = express();
      app.use(express.json());
      app.post('/api/generate', generateHandler);
      server.middlewares.use(app);
    }
  };
}

export default defineConfig(({ mode }) => {
  return {
    base: '/',
    plugins: [react(), tailwindcss(), apiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});

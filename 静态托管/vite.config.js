import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base 设为相对路径，便于部署到云开发静态托管的任意子目录
export default defineConfig({
  plugins: [react()],
  base: './',
  server: { port: 4173, host: true },
});

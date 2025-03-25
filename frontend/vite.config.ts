import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
// vite.config.ts

export default defineConfig({

  base: "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  server: {
    proxy: {
      '/login': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/login/, '/login'),
      },
    },
  },
});

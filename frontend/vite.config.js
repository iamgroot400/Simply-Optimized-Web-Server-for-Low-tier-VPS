import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In dev, proxy /api to the Express backend so the SPA and API share an origin.
// In production, Nginx serves the built files and proxies /api (see nginx.conf).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { "/api": { target: "http://127.0.0.1:4000", changeOrigin: true } },
  },
  build: { outDir: "dist", sourcemap: false },
});

/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";
import path from "path";

// `npm run analyze` (ANALYZE=true) genera dist/stats.html con el desglose del bundle.
// recharts (~150KB gzip) NO necesita manualChunks: queda aislado de forma natural en
// el chunk lazy de SessionsPage (único consumidor vía FocusChart). Forzar un manualChunk
// provocaba un import espurio de recharts en el chunk de DashboardPage.
const analyze = process.env.ANALYZE === "true";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    analyze &&
      visualizer({
        filename: "dist/stats.html",
        gzipSize: true,
        brotliSize: true,
      }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// base: "./" makes the built dist/ use relative asset paths, so it works
// whether you serve it from a domain root, a subfolder, or open it behind
// any static host without extra config.
export default defineConfig({
  base: "./",
  plugins: [
    react(),
    // Offline + installable: precache the built app; public/manifest.webmanifest is used as-is.
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      manifest: false,
      workbox: { globPatterns: ["**/*.{js,css,html,png,woff2,webmanifest}"] },
    }),
  ],
});

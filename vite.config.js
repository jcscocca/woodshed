import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" makes the built dist/ use relative asset paths, so it works
// whether you serve it from a domain root, a subfolder, or open it behind
// any static host without extra config.
export default defineConfig({
  base: "./",
  plugins: [react()],
});

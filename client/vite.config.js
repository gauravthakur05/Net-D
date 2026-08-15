import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Forward /api requests to the Express backend during development,
      // so the client can just call "/api/..." without hardcoding a host.
      "/api": "http://localhost:4000",
    },
  },
});

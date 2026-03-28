// ABOUTME: Configures Vitest for deterministic domain and component testing.
// ABOUTME: Uses a browser-like environment for React rendering tests.
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
  },
});

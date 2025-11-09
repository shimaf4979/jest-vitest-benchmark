import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    include: ["src/vitest/**/*.test.ts", "src/vitest/**/*.test.tsx"],
    setupFiles: ["./vitest.setup.ts"],
    isolate: false,
    pool: "vmThreads",
    // Use default vmThreads count (usually CPU cores)
  },
});

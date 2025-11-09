import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    include: ["src/vitest/**/*.test.ts", "src/vitest/**/*.test.tsx"],
    setupFiles: ["./vitest.setup.ts"],
    // Disable isolation - tests run in same context
    isolate: false,
    // Use single thread to show sequential slowdown
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  },
});

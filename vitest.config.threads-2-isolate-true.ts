import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    include: ["src/vitest/**/*.test.ts", "src/vitest/**/*.test.tsx"],
    setupFiles: ["./vitest.setup.ts"],
    isolate: true,
    pool: "threads",
    poolOptions: {
      threads: {
        maxThreads: 2,
        minThreads: 2,
      },
    },
  },
});

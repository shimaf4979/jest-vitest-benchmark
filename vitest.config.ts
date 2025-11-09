import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    include: ["src/vitest/**/*.test.ts", "src/vitest/**/*.test.tsx"],
    setupFiles: ["./vitest.setup.ts"],
    // Default without explicit pool configuration
    // This can be slower in some cases
  },
});

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const configs = [
  // Jest configurations
  {
    name: "Jest (default)",
    cmd: "npx jest --clearCache && npx jest --no-cache",
  },
  {
    name: "Jest (1 worker)",
    cmd: "npx jest --clearCache && npx jest --config jest.config.maxWorkers-1.js --no-cache",
  },
  {
    name: "Jest (2 workers)",
    cmd: "npx jest --clearCache && npx jest --config jest.config.maxWorkers-2.js --no-cache",
  },
  {
    name: "Jest (4 workers)",
    cmd: "npx jest --clearCache && npx jest --config jest.config.maxWorkers-4.js --no-cache",
  },

  // Vitest configurations
  { name: "Vitest (default)", cmd: "npx vitest run --no-cache" },
  {
    name: "Vitest (no-isolate)",
    cmd: "npx vitest run --config vitest.config.no-isolate.ts --no-cache",
  },
  {
    name: "Vitest (slow mode)",
    cmd: "npx vitest run --config vitest.config.slow.ts --no-cache",
  },
  {
    name: "Vitest (isolate only)",
    cmd: "npx vitest run --config vitest.config.isolate-only.ts --no-cache",
  },
  {
    name: "Vitest (isolate single)",
    cmd: "npx vitest run --config vitest.config.isolate-single.ts --no-cache",
  },
  {
    name: "Vitest (1 thread)",
    cmd: "npx vitest run --config vitest.config.threads-1.ts --no-cache",
  },
  {
    name: "Vitest (2 threads)",
    cmd: "npx vitest run --config vitest.config.threads-2.ts --no-cache",
  },
  {
    name: "Vitest (4 threads)",
    cmd: "npx vitest run --config vitest.config.threads-4.ts --no-cache",
  },
  {
    name: "Vitest (forks)",
    cmd: "npx vitest run --config vitest.config.forks.ts --no-cache",
  },
];

const results = [];

// Function to clear caches
function clearCaches() {
  console.log("Clearing caches...");

  // Clear node_modules/.cache if it exists
  const cacheDir = path.join(__dirname, "node_modules", ".cache");
  if (fs.existsSync(cacheDir)) {
    fs.rmSync(cacheDir, { recursive: true, force: true });
  }

  // Clear node_modules/.vitest if it exists
  const vitestCacheDir = path.join(__dirname, "node_modules", ".vitest");
  if (fs.existsSync(vitestCacheDir)) {
    fs.rmSync(vitestCacheDir, { recursive: true, force: true });
  }

  console.log("Caches cleared\n");
}

console.log("Starting benchmark tests...\n");

for (const config of configs) {
  // Clear caches before each test
  clearCaches();

  console.log(`Running: ${config.name}`);
  console.log(`Command: ${config.cmd}`);

  const start = Date.now();

  try {
    const output = execSync(config.cmd, {
      stdio: "pipe",
      encoding: "utf-8",
    });

    const duration = Date.now() - start;

    // Extract Duration line from output if exists
    const durationMatch = output.match(/Duration\s+(.+)/);
    const detailedDuration = durationMatch ? durationMatch[1] : null;

    results.push({
      name: config.name,
      duration,
      detailedDuration,
      status: "success",
    });

    console.log(`✓ Completed in ${duration}ms`);
    if (detailedDuration) {
      console.log(`  Duration: ${detailedDuration}`);
    }
    console.log();
  } catch (error) {
    const duration = Date.now() - start;

    // Try to extract output even on error
    const output = error.stdout || error.stderr || "";
    const durationMatch = output.match(/Duration\s+(.+)/);
    const detailedDuration = durationMatch ? durationMatch[1] : null;

    results.push({
      name: config.name,
      duration,
      detailedDuration,
      status: "failed",
      error: error.message,
    });

    console.log(`✗ Failed in ${duration}ms`);
    if (detailedDuration) {
      console.log(`  Duration: ${detailedDuration}`);
    }
    console.log(`Error: ${error.message}\n`);
  }
}

console.log("\n" + "=".repeat(80));
console.log("BENCHMARK RESULTS");
console.log("=".repeat(80) + "\n");

// Sort by duration
const sortedResults = [...results].sort((a, b) => a.duration - b.duration);

sortedResults.forEach((result, index) => {
  const status = result.status === "success" ? "✓" : "✗";
  const duration = `${result.duration}ms`;
  const rank = index + 1;

  console.log(`${rank}. [${status}] ${result.name.padEnd(25)} - ${duration}`);
});

console.log("\n" + "=".repeat(80));
console.log("COMPARISON");
console.log("=".repeat(80) + "\n");

// Compare Jest vs Vitest
const jestResults = results.filter(
  (r) => r.name.startsWith("Jest") && r.status === "success",
);
const vitestResults = results.filter(
  (r) => r.name.startsWith("Vitest") && r.status === "success",
);

if (jestResults.length > 0) {
  const avgJest =
    jestResults.reduce((sum, r) => sum + r.duration, 0) / jestResults.length;
  console.log(`Jest Average: ${avgJest.toFixed(2)}ms`);
}

if (vitestResults.length > 0) {
  const avgVitest =
    vitestResults.reduce((sum, r) => sum + r.duration, 0) /
    vitestResults.length;
  console.log(`Vitest Average: ${avgVitest.toFixed(2)}ms`);
}

if (jestResults.length > 0 && vitestResults.length > 0) {
  const avgJest =
    jestResults.reduce((sum, r) => sum + r.duration, 0) / jestResults.length;
  const avgVitest =
    vitestResults.reduce((sum, r) => sum + r.duration, 0) /
    vitestResults.length;
  const diff = (((avgVitest - avgJest) / avgJest) * 100).toFixed(2);

  if (avgVitest < avgJest) {
    console.log(`\nVitest is ${Math.abs(diff)}% faster than Jest`);
  } else {
    console.log(`\nJest is ${Math.abs(diff)}% faster than Vitest`);
  }
}

// Save results to JSON
const outputPath = "./benchmark-results.json";
fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
console.log(`\nResults saved to: ${outputPath}`);

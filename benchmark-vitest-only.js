const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const configs = [
  // Vitest Threads - isolate: true
  {
    name: "Vitest Threads-1 isolate=true",
    cmd: "npx vitest run --config vitest.config.threads-1-isolate-true.ts --no-cache",
  },
  {
    name: "Vitest Threads-2 isolate=true",
    cmd: "npx vitest run --config vitest.config.threads-2-isolate-true.ts --no-cache",
  },
  {
    name: "Vitest Threads-4 isolate=true",
    cmd: "npx vitest run --config vitest.config.threads-4-isolate-true.ts --no-cache",
  },
  {
    name: "Vitest Threads-default isolate=true",
    cmd: "npx vitest run --config vitest.config.threads-default-isolate-true.ts --no-cache",
  },

  // Vitest Threads - isolate: false
  {
    name: "Vitest Threads-1 isolate=false",
    cmd: "npx vitest run --config vitest.config.threads-1-isolate-false.ts --no-cache",
  },
  {
    name: "Vitest Threads-2 isolate=false",
    cmd: "npx vitest run --config vitest.config.threads-2-isolate-false.ts --no-cache",
  },
  {
    name: "Vitest Threads-4 isolate=false",
    cmd: "npx vitest run --config vitest.config.threads-4-isolate-false.ts --no-cache",
  },
  {
    name: "Vitest Threads-default isolate=false",
    cmd: "npx vitest run --config vitest.config.threads-default-isolate-false.ts --no-cache",
  },

  // Vitest Forks - isolate: true
  {
    name: "Vitest Forks-1 isolate=true",
    cmd: "npx vitest run --config vitest.config.forks-1-isolate-true.ts --no-cache",
  },
  {
    name: "Vitest Forks-2 isolate=true",
    cmd: "npx vitest run --config vitest.config.forks-2-isolate-true.ts --no-cache",
  },
  {
    name: "Vitest Forks-4 isolate=true",
    cmd: "npx vitest run --config vitest.config.forks-4-isolate-true.ts --no-cache",
  },
  {
    name: "Vitest Forks-default isolate=true",
    cmd: "npx vitest run --config vitest.config.forks-default-isolate-true.ts --no-cache",
  },

  // Vitest Forks - isolate: false
  {
    name: "Vitest Forks-1 isolate=false",
    cmd: "npx vitest run --config vitest.config.forks-1-isolate-false.ts --no-cache",
  },
  {
    name: "Vitest Forks-2 isolate=false",
    cmd: "npx vitest run --config vitest.config.forks-2-isolate-false.ts --no-cache",
  },
  {
    name: "Vitest Forks-4 isolate=false",
    cmd: "npx vitest run --config vitest.config.forks-4-isolate-false.ts --no-cache",
  },
  {
    name: "Vitest Forks-default isolate=false",
    cmd: "npx vitest run --config vitest.config.forks-default-isolate-false.ts --no-cache",
  },

  // Vitest vmThreads - isolate: true
  {
    name: "Vitest vmThreads-1 isolate=true",
    cmd: "npx vitest run --config vitest.config.vmthreads-1-isolate-true.ts --no-cache",
  },
  {
    name: "Vitest vmThreads-2 isolate=true",
    cmd: "npx vitest run --config vitest.config.vmthreads-2-isolate-true.ts --no-cache",
  },
  {
    name: "Vitest vmThreads-4 isolate=true",
    cmd: "npx vitest run --config vitest.config.vmthreads-4-isolate-true.ts --no-cache",
  },
  {
    name: "Vitest vmThreads-default isolate=true",
    cmd: "npx vitest run --config vitest.config.vmthreads-default-isolate-true.ts --no-cache",
  },

  // Vitest vmThreads - isolate: false
  {
    name: "Vitest vmThreads-1 isolate=false",
    cmd: "npx vitest run --config vitest.config.vmthreads-1-isolate-false.ts --no-cache",
  },
  {
    name: "Vitest vmThreads-2 isolate=false",
    cmd: "npx vitest run --config vitest.config.vmthreads-2-isolate-false.ts --no-cache",
  },
  {
    name: "Vitest vmThreads-4 isolate=false",
    cmd: "npx vitest run --config vitest.config.vmthreads-4-isolate-false.ts --no-cache",
  },
  {
    name: "Vitest vmThreads-default isolate=false",
    cmd: "npx vitest run --config vitest.config.vmthreads-default-isolate-false.ts --no-cache",
  },

  // Vitest default config
  {
    name: "Vitest (default config)",
    cmd: "npx vitest run --no-cache",
  },
];

const results = [];

function clearCaches() {
  console.log("Clearing caches...");

  const cacheDir = path.join(__dirname, "node_modules", ".cache");
  if (fs.existsSync(cacheDir)) {
    fs.rmSync(cacheDir, { recursive: true, force: true });
  }

  const vitestCacheDir = path.join(__dirname, "node_modules", ".vitest");
  if (fs.existsSync(vitestCacheDir)) {
    fs.rmSync(vitestCacheDir, { recursive: true, force: true });
  }

  console.log("Caches cleared\n");
}

console.log("=".repeat(80));
console.log("BENCHMARK: Vitest Only Performance Comparison");
console.log("=".repeat(80));
console.log(`Total configurations: ${configs.length}`);
console.log("=".repeat(80));

for (const config of configs) {
  clearCaches();

  console.log(`\nRunning: ${config.name}`);
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
  } catch (error) {
    const duration = Date.now() - start;

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
    console.log(`Error: ${error.message}`);
  }
}

// Sort results by duration
const sortedResults = [...results].sort((a, b) => a.duration - b.duration);

console.log("\n\n" + "=".repeat(80));
console.log("BENCHMARK RESULTS (sorted by speed)");
console.log("=".repeat(80));

sortedResults.forEach((result, index) => {
  const status = result.status === "success" ? "✓" : "✗";
  console.log(
    `${(index + 1).toString().padStart(2)}. [${status}] ${result.name.padEnd(40)} - ${result.duration}ms`,
  );
  if (result.detailedDuration) {
    console.log(`    ${result.detailedDuration}`);
  }
});

// Save results to JSON
const outputPath = "./benchmark-vitest-results.json";
fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

console.log("\n" + "=".repeat(80));
console.log(`Results saved to: ${outputPath}`);
console.log("=".repeat(80));

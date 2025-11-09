const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

/**
 * マルチスケールベンチマーク
 *
 * 10, 50, 100ファイルでベンチマークを実行し、
 * それぞれの結果をJSONファイルに出力
 */

const testFileCounts = [10, 50, 100];

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

// Function to clear caches
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

// Function to set test file count
function setTestFileCount(count) {
  console.log(`\n${"=".repeat(80)}`);
  console.log(`Setting up ${count} test files...`);
  console.log("=".repeat(80));

  try {
    execSync(`./scripts/cleanup-tests.sh`, { stdio: "inherit" });
    execSync(`./scripts/generate-more-tests.sh ${count}`, { stdio: "inherit" });
    console.log(`✓ Successfully set up ${count} test files\n`);
    return true;
  } catch (error) {
    console.error(`✗ Failed to set up test files: ${error.message}`);
    return false;
  }
}

// Run benchmarks for a specific file count
function runBenchmark(fileCount) {
  console.log(`\n${"=".repeat(80)}`);
  console.log(`BENCHMARK: ${fileCount} TEST FILES`);
  console.log("=".repeat(80));

  const results = [];

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

  return results;
}

// Main execution
console.log("=".repeat(80));
console.log("MULTI-SCALE BENCHMARK");
console.log("=".repeat(80));
console.log(`\nTesting with: ${testFileCounts.join(", ")} files\n`);

const allResults = {};

for (const fileCount of testFileCounts) {
  if (!setTestFileCount(fileCount)) {
    console.error(
      `Skipping benchmark for ${fileCount} files due to setup error`,
    );
    continue;
  }

  const results = runBenchmark(fileCount);
  allResults[fileCount] = results;

  // Save individual result
  const outputPath = `./benchmark-results-${fileCount}files.json`;
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n✓ Results saved to: ${outputPath}`);
}

// Generate summary
console.log("\n\n" + "=".repeat(80));
console.log("SUMMARY");
console.log("=".repeat(80));

for (const fileCount of testFileCounts) {
  if (!allResults[fileCount]) continue;

  console.log(`\n### ${fileCount} Files ###`);

  const results = allResults[fileCount];
  const sortedResults = [...results].sort((a, b) => a.duration - b.duration);

  sortedResults.slice(0, 5).forEach((result, index) => {
    const status = result.status === "success" ? "✓" : "✗";
    console.log(
      `${index + 1}. [${status}] ${result.name.padEnd(40)} - ${result.duration}ms`,
    );
  });
}

// Save combined results
const combinedOutputPath = "./benchmark-results-all.json";
fs.writeFileSync(combinedOutputPath, JSON.stringify(allResults, null, 2));
console.log(`\n✓ Combined results saved to: ${combinedOutputPath}`);

console.log("\n" + "=".repeat(80));
console.log("Benchmark complete!");
console.log("=".repeat(80));

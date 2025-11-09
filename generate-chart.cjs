const fs = require("fs");
const path = require("path");

// Read benchmark results
const resultsPath = path.join(__dirname, "benchmark-results.json");
const results = JSON.parse(fs.readFileSync(resultsPath, "utf-8"));

// Parse detailed duration to extract metrics
function parseDetailedDuration(detailedDuration) {
  if (!detailedDuration) return null;

  const metrics = {
    transform: 0,
    setup: 0,
    collect: 0,
    tests: 0,
    environment: 0,
    prepare: 0,
  };

  const patterns = {
    transform: /transform ([\d.]+)s/,
    setup: /setup ([\d.]+)s/,
    collect: /collect ([\d.]+)s/,
    tests: /tests ([\d.]+)s/,
    environment: /environment ([\d.]+)s/,
    prepare: /prepare ([\d.]+)(?:ms|s)/,
  };

  for (const [key, pattern] of Object.entries(patterns)) {
    const match = detailedDuration.match(pattern);
    if (match) {
      let value = parseFloat(match[1]);
      // Convert ms to s for prepare
      if (
        key === "prepare" &&
        detailedDuration.includes("prepare") &&
        detailedDuration.match(/prepare ([\d.]+)ms/)
      ) {
        value = value / 1000;
      }
      metrics[key] = value;
    }
  }

  return metrics;
}

// Categorize results
const categories = {
  jest: [],
  vitestThreadsIsolateTrue: [],
  vitestThreadsIsolateFalse: [],
  vitestForksIsolateTrue: [],
  vitestForksIsolateFalse: [],
  vitestVmThreadsIsolateTrue: [],
  vitestVmThreadsIsolateFalse: [],
  vitestDefault: [],
};

results.forEach((result) => {
  if (result.name.startsWith("Jest")) {
    categories.jest.push(result);
  } else if (
    result.name.includes("Threads") &&
    result.name.includes("isolate=true")
  ) {
    categories.vitestThreadsIsolateTrue.push(result);
  } else if (
    result.name.includes("Threads") &&
    result.name.includes("isolate=false")
  ) {
    categories.vitestThreadsIsolateFalse.push(result);
  } else if (
    result.name.includes("Forks") &&
    result.name.includes("isolate=true")
  ) {
    categories.vitestForksIsolateTrue.push(result);
  } else if (
    result.name.includes("Forks") &&
    result.name.includes("isolate=false")
  ) {
    categories.vitestForksIsolateFalse.push(result);
  } else if (
    result.name.includes("vmThreads") &&
    result.name.includes("isolate=true")
  ) {
    categories.vitestVmThreadsIsolateTrue.push(result);
  } else if (
    result.name.includes("vmThreads") &&
    result.name.includes("isolate=false")
  ) {
    categories.vitestVmThreadsIsolateFalse.push(result);
  } else if (result.name.includes("default config")) {
    categories.vitestDefault.push(result);
  }
});

// Generate HTML
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Jest vs Vitest Benchmark Results</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #0d1117;
      color: #c9d1d9;
      padding: 20px;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    h1 {
      text-align: center;
      color: #58a6ff;
      margin-bottom: 10px;
      font-size: 2.5rem;
    }
    .subtitle {
      text-align: center;
      color: #8b949e;
      margin-bottom: 40px;
      font-size: 1.1rem;
    }
    .chart-container {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 8px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    }
    .chart-title {
      font-size: 1.5rem;
      margin-bottom: 20px;
      color: #58a6ff;
      border-bottom: 2px solid #30363d;
      padding-bottom: 10px;
    }
    canvas {
      max-height: 600px;
    }
    .chart-wrapper {
      position: relative;
      height: 600px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .summary-card {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 8px;
      padding: 20px;
    }
    .summary-card h3 {
      color: #58a6ff;
      margin-bottom: 15px;
      font-size: 1.2rem;
    }
    .summary-card .metric {
      display: flex;
      justify-content: space-between;
      margin: 10px 0;
      padding: 8px 0;
      border-bottom: 1px solid #21262d;
    }
    .summary-card .metric:last-child {
      border-bottom: none;
    }
    .metric-name {
      color: #8b949e;
    }
    .metric-value {
      color: #58a6ff;
      font-weight: bold;
    }
    .fastest {
      color: #3fb950 !important;
    }
    .slowest {
      color: #f85149 !important;
    }
    footer {
      text-align: center;
      margin-top: 40px;
      padding: 20px;
      color: #8b949e;
      border-top: 1px solid #30363d;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Jest vs Vitest Benchmark Results</h1>
    <p class="subtitle">Performance comparison across different configurations</p>

    <div class="summary">
      <div class="summary-card">
        <h3>Fastest Configuration</h3>
        <div class="metric">
          <span class="metric-name">Name:</span>
          <span class="metric-value fastest">${results.sort((a, b) => a.duration - b.duration)[0].name}</span>
        </div>
        <div class="metric">
          <span class="metric-name">Duration:</span>
          <span class="metric-value fastest">${(results.sort((a, b) => a.duration - b.duration)[0].duration / 1000).toFixed(2)}s</span>
        </div>
      </div>

      <div class="summary-card">
        <h3>Slowest Configuration</h3>
        <div class="metric">
          <span class="metric-name">Name:</span>
          <span class="metric-value slowest">${results.sort((a, b) => b.duration - a.duration)[0].name}</span>
        </div>
        <div class="metric">
          <span class="metric-name">Duration:</span>
          <span class="metric-value slowest">${(results.sort((a, b) => b.duration - a.duration)[0].duration / 1000).toFixed(2)}s</span>
        </div>
      </div>

      <div class="summary-card">
        <h3>Statistics</h3>
        <div class="metric">
          <span class="metric-name">Total Configs:</span>
          <span class="metric-value">${results.length}</span>
        </div>
        <div class="metric">
          <span class="metric-name">Average Duration:</span>
          <span class="metric-value">${(results.reduce((sum, r) => sum + r.duration, 0) / results.length / 1000).toFixed(2)}s</span>
        </div>
        <div class="metric">
          <span class="metric-name">Speed Improvement:</span>
          <span class="metric-value fastest">${(results.sort((a, b) => b.duration - a.duration)[0].duration / results.sort((a, b) => a.duration - b.duration)[0].duration).toFixed(2)}x</span>
        </div>
      </div>
    </div>

    <div class="chart-container">
      <h2 class="chart-title">Test Suite Overview (106 Files, 3,283 Tests)</h2>
      <div class="chart-wrapper">
        <canvas id="overallChart"></canvas>
      </div>
    </div>

    <div class="chart-container">
      <h2 class="chart-title">Jest Configurations</h2>
      <div class="chart-wrapper">
        <canvas id="jestChart"></canvas>
      </div>
    </div>

    <div class="chart-container">
      <h2 class="chart-title">Vitest Threads Comparison</h2>
      <div class="chart-wrapper">
        <canvas id="threadsChart"></canvas>
      </div>
    </div>

    <div class="chart-container">
      <h2 class="chart-title">Vitest Forks Comparison</h2>
      <div class="chart-wrapper">
        <canvas id="forksChart"></canvas>
      </div>
    </div>

    <div class="chart-container">
      <h2 class="chart-title">Vitest vmThreads Comparison</h2>
      <div class="chart-wrapper">
        <canvas id="vmThreadsChart"></canvas>
      </div>
    </div>

    <div class="chart-container">
      <h2 class="chart-title">isolate=true vs isolate=false (All Pools)</h2>
      <div class="chart-wrapper">
        <canvas id="isolateComparisonChart"></canvas>
      </div>
    </div>

    <div class="chart-container">
      <h2 class="chart-title">Vitest Detailed Metrics (Threads isolate=true)</h2>
      <div class="chart-wrapper">
        <canvas id="detailedMetricsChart"></canvas>
      </div>
    </div>

    <footer>
      Generated on ${new Date().toLocaleString()} | Benchmark Data: ${results.length} configurations
    </footer>
  </div>

  <script>
    const results = ${JSON.stringify(results, null, 2)};

    // Chart.js default config
    Chart.defaults.color = '#c9d1d9';
    Chart.defaults.borderColor = '#30363d';

    // Overall comparison
    new Chart(document.getElementById('overallChart'), {
      type: 'bar',
      data: {
        labels: results.map(r => r.name),
        datasets: [{
          label: 'Duration (ms)',
          data: results.map(r => r.duration),
          backgroundColor: results.map(r => {
            if (r.name.includes('Jest')) return 'rgba(248, 81, 73, 0.8)'; // Jest: Red

            // Vitest Threads: Blue
            if (r.name.includes('Threads') && r.name.includes('isolate=true')) return 'rgba(88, 166, 255, 0.8)';
            if (r.name.includes('Threads') && r.name.includes('isolate=false')) return 'rgba(88, 166, 255, 0.4)';

            // Vitest Forks: Cyan
            if (r.name.includes('Forks') && r.name.includes('isolate=true')) return 'rgba(34, 211, 238, 0.8)';
            if (r.name.includes('Forks') && r.name.includes('isolate=false')) return 'rgba(34, 211, 238, 0.4)';

            // Vitest vmThreads: Purple-blue
            if (r.name.includes('vmThreads') && r.name.includes('isolate=true')) return 'rgba(147, 197, 253, 0.8)';
            if (r.name.includes('vmThreads') && r.name.includes('isolate=false')) return 'rgba(147, 197, 253, 0.4)';

            // Default Vitest
            return 'rgba(88, 166, 255, 0.8)';
          }),
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            left: 10,
            right: 10,
            top: 10,
            bottom: 10
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => \`Duration: \${(context.parsed.x / 1000).toFixed(2)}s\`
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            title: { display: true, text: 'Duration (ms)' },
            grid: { color: '#21262d' }
          },
          y: {
            grid: { display: false },
            ticks: {
              autoSkip: false,
              maxRotation: 0,
              minRotation: 0
            }
          }
        }
      }
    });

    // Jest chart
    const jestResults = results.filter(r => r.name.startsWith('Jest'));
    new Chart(document.getElementById('jestChart'), {
      type: 'bar',
      data: {
        labels: jestResults.map(r => r.name.replace('Jest ', '')),
        datasets: [{
          label: 'Duration (s)',
          data: jestResults.map(r => r.duration / 1000),
          backgroundColor: 'rgba(248, 81, 73, 0.8)',
          borderColor: 'rgba(248, 81, 73, 1)',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Duration (seconds)' },
            grid: { color: '#21262d' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });

    // Threads comparison
    const threadsIsolateTrue = results.filter(r => r.name.includes('Threads') && r.name.includes('isolate=true'));
    const threadsIsolateFalse = results.filter(r => r.name.includes('Threads') && r.name.includes('isolate=false'));

    new Chart(document.getElementById('threadsChart'), {
      type: 'bar',
      data: {
        labels: ['1 thread', '2 threads', '4 threads', 'default'],
        datasets: [
          {
            label: 'isolate=true',
            data: threadsIsolateTrue.map(r => r.duration / 1000),
            backgroundColor: 'rgba(88, 166, 255, 0.8)',
            borderColor: 'rgba(88, 166, 255, 1)',
            borderWidth: 2
          },
          {
            label: 'isolate=false',
            data: threadsIsolateFalse.map(r => r.duration / 1000),
            backgroundColor: 'rgba(88, 166, 255, 0.4)',
            borderColor: 'rgba(88, 166, 255, 0.6)',
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Duration (seconds)' },
            grid: { color: '#21262d' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });

    // Forks comparison
    const forksIsolateTrue = results.filter(r => r.name.includes('Forks') && r.name.includes('isolate=true'));
    const forksIsolateFalse = results.filter(r => r.name.includes('Forks') && r.name.includes('isolate=false'));

    new Chart(document.getElementById('forksChart'), {
      type: 'bar',
      data: {
        labels: ['1 fork', '2 forks', '4 forks', 'default'],
        datasets: [
          {
            label: 'isolate=true',
            data: forksIsolateTrue.map(r => r.duration / 1000),
            backgroundColor: 'rgba(34, 211, 238, 0.8)',
            borderColor: 'rgba(34, 211, 238, 1)',
            borderWidth: 2
          },
          {
            label: 'isolate=false',
            data: forksIsolateFalse.map(r => r.duration / 1000),
            backgroundColor: 'rgba(34, 211, 238, 0.4)',
            borderColor: 'rgba(34, 211, 238, 0.6)',
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Duration (seconds)' },
            grid: { color: '#21262d' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });

    // vmThreads comparison
    const vmThreadsIsolateTrue = results.filter(r => r.name.includes('vmThreads') && r.name.includes('isolate=true'));
    const vmThreadsIsolateFalse = results.filter(r => r.name.includes('vmThreads') && r.name.includes('isolate=false'));

    new Chart(document.getElementById('vmThreadsChart'), {
      type: 'bar',
      data: {
        labels: ['1 thread', '2 threads', '4 threads', 'default'],
        datasets: [
          {
            label: 'isolate=true',
            data: vmThreadsIsolateTrue.map(r => r.duration / 1000),
            backgroundColor: 'rgba(147, 197, 253, 0.8)',
            borderColor: 'rgba(147, 197, 253, 1)',
            borderWidth: 2
          },
          {
            label: 'isolate=false',
            data: vmThreadsIsolateFalse.map(r => r.duration / 1000),
            backgroundColor: 'rgba(147, 197, 253, 0.4)',
            borderColor: 'rgba(147, 197, 253, 0.6)',
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Duration (seconds)' },
            grid: { color: '#21262d' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });

    // isolate comparison
    const isolateTrue = results.filter(r => r.name.includes('isolate=true') && !r.name.includes('default config'));
    const isolateFalse = results.filter(r => r.name.includes('isolate=false'));

    new Chart(document.getElementById('isolateComparisonChart'), {
      type: 'box',
      data: {
        labels: ['isolate=true', 'isolate=false'],
        datasets: [{
          label: 'Duration Distribution',
          data: [
            isolateTrue.map(r => r.duration / 1000),
            isolateFalse.map(r => r.duration / 1000)
          ],
          backgroundColor: ['rgba(88, 166, 255, 0.8)', 'rgba(88, 166, 255, 0.4)'],
          borderColor: ['rgba(88, 166, 255, 1)', 'rgba(88, 166, 255, 0.6)'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Duration (seconds)' },
            grid: { color: '#21262d' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });

    // Detailed metrics chart
    const threadsIsolateTrueWithMetrics = threadsIsolateTrue
      .map(r => ({ ...r, metrics: ${JSON.stringify(results.filter((r) => r.name.includes("Threads") && r.name.includes("isolate=true")).map((r) => parseDetailedDuration(r.detailedDuration)))} }))
      .filter(r => r.metrics);

    if (threadsIsolateTrueWithMetrics.length > 0) {
      new Chart(document.getElementById('detailedMetricsChart'), {
        type: 'bar',
        data: {
          labels: ['1 thread', '2 threads', '4 threads', 'default'],
          datasets: [
            {
              label: 'Transform',
              data: ${JSON.stringify(results.filter((r) => r.name.includes("Threads") && r.name.includes("isolate=true")).map((r) => parseDetailedDuration(r.detailedDuration)?.transform || 0))},
              backgroundColor: 'rgba(88, 166, 255, 0.8)',
            },
            {
              label: 'Setup',
              data: ${JSON.stringify(results.filter((r) => r.name.includes("Threads") && r.name.includes("isolate=true")).map((r) => parseDetailedDuration(r.detailedDuration)?.setup || 0))},
              backgroundColor: 'rgba(201, 130, 255, 0.8)',
            },
            {
              label: 'Collect',
              data: ${JSON.stringify(results.filter((r) => r.name.includes("Threads") && r.name.includes("isolate=true")).map((r) => parseDetailedDuration(r.detailedDuration)?.collect || 0))},
              backgroundColor: 'rgba(255, 184, 108, 0.8)',
            },
            {
              label: 'Tests',
              data: ${JSON.stringify(results.filter((r) => r.name.includes("Threads") && r.name.includes("isolate=true")).map((r) => parseDetailedDuration(r.detailedDuration)?.tests || 0))},
              backgroundColor: 'rgba(63, 185, 80, 0.8)',
            },
            {
              label: 'Prepare',
              data: ${JSON.stringify(results.filter((r) => r.name.includes("Threads") && r.name.includes("isolate=true")).map((r) => parseDetailedDuration(r.detailedDuration)?.prepare || 0))},
              backgroundColor: 'rgba(248, 81, 73, 0.8)',
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) => \`\${context.dataset.label}: \${context.parsed.y.toFixed(2)}s\`
              }
            }
          },
          scales: {
            x: {
              stacked: true,
              grid: { display: false }
            },
            y: {
              beginAtZero: true,
              stacked: true,
              title: { display: true, text: 'Duration (seconds)' },
              grid: { color: '#21262d' }
            }
          }
        }
      });
    }
  </script>
</body>
</html>
`;

// Write HTML file
const outputPath = path.join(__dirname, "benchmark-results.html");
fs.writeFileSync(outputPath, html);

console.log(`✓ HTML chart generated: ${outputPath}`);
console.log(`  Open file://${outputPath} in your browser to view the results.`);

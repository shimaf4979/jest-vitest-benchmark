const { execSync } = require("child_process");
const fs = require("fs");

/**
 * メトリクスの詳細分析スクリプト
 *
 * setup, environment に何が影響しているか詳細に分析します
 */

const configs = [
  {
    name: "isolate: false (fastest)",
    config: "vitest.config.fastest.ts",
    description: "環境を共有、最速"
  },
  {
    name: "isolate: true (single thread)",
    config: "vitest.config.isolate-single.ts",
    description: "環境を分離、シングルスレッド"
  },
  {
    name: "isolate: true (4 threads)",
    config: "vitest.config.threads-4.ts",
    description: "環境を分離、4並列"
  },
];

console.log("=" .repeat(80));
console.log("メトリクス詳細分析");
console.log("=" .repeat(80));
console.log("\n各設定での setup, environment の詳細を比較します\n");

const results = [];

for (const { name, config, description } of configs) {
  console.log(`\n${"=".repeat(80)}`);
  console.log(`設定: ${name}`);
  console.log(`説明: ${description}`);
  console.log(`ファイル: ${config}`);
  console.log("=".repeat(80));

  try {
    // NODE_ENV=test で詳細ログを有効化
    const output = execSync(
      `NODE_OPTIONS="--expose-gc" npx vitest run --config ${config} --no-cache --reporter=verbose`,
      {
        encoding: "utf-8",
        stdio: "pipe",
      }
    );

    console.log("\n--- 出力 ---");
    // Duration行とその周辺を抽出
    const lines = output.split("\n");
    lines.forEach((line, i) => {
      if (line.includes("Duration") ||
          line.includes("transform") ||
          line.includes("setup") ||
          line.includes("environment") ||
          line.includes("Test Files") ||
          line.includes("Tests") ||
          line.includes("heap")) {
        console.log(line);
      }
    });

    // メトリクスを抽出
    const durationMatch = output.match(/Duration\s+(.+)/);
    const transformMatch = output.match(/transform\s+([\d.]+[ms]+)/);
    const setupMatch = output.match(/setup\s+([\d.]+[ms]+)/);
    const collectMatch = output.match(/collect\s+([\d.]+[ms]+)/);
    const testsMatch = output.match(/tests\s+([\d.]+[ms]+)/);
    const environmentMatch = output.match(/environment\s+([\d.]+[ms]+)/);
    const prepareMatch = output.match(/prepare\s+([\d.]+[ms]+)/);

    results.push({
      name,
      description,
      metrics: {
        transform: transformMatch ? transformMatch[1] : "N/A",
        setup: setupMatch ? setupMatch[1] : "N/A",
        collect: collectMatch ? collectMatch[1] : "N/A",
        tests: testsMatch ? testsMatch[1] : "N/A",
        environment: environmentMatch ? environmentMatch[1] : "N/A",
        prepare: prepareMatch ? prepareMatch[1] : "N/A",
      }
    });

  } catch (error) {
    console.log(`\n❌ エラー: ${error.message}`);
  }
}

console.log("\n\n" + "=".repeat(80));
console.log("比較サマリー");
console.log("=".repeat(80));

console.log("\n| 設定 | setup | environment | 特徴 |");
console.log("|------|-------|-------------|------|");

results.forEach(r => {
  console.log(`| ${r.name.padEnd(30)} | ${r.metrics.setup.padEnd(8)} | ${r.metrics.environment.padEnd(11)} | ${r.description} |`);
});

console.log("\n\n" + "=".repeat(80));
console.log("分析");
console.log("=".repeat(80));

console.log(`
## setup時間の違い

setup時間 = テスト環境のセットアップ時間

【影響する要因】
1. **setupFiles の実行** (vitest.setup.ts)
   - @testing-library/jest-dom の初期化
   - グローバル変数の設定

2. **jsdom環境の初期化回数**
   - isolate: false → 1回のみ
   - isolate: true  → 各テストファイルごと (100回)

3. **モジュールのロード**
   - isolate: false → キャッシュを使用
   - isolate: true  → 毎回再ロード

## environment時間の違い

environment時間 = jsdom操作の累積時間

【影響する要因】
1. **jsdomインスタンス数**
   - isolate: false → 1つのインスタンスを共有
   - isolate: true  → 各ファイルごとにインスタンス作成
   - 並列実行      → スレッド数 × インスタンス数

2. **DOM操作の回数**
   - Reactコンポーネントのマウント/アンマウント
   - 各テストでの render() 呼び出し
   - クリーンアップ処理

3. **並列化の影響**
   - シングルスレッド → 累積時間 = 実時間
   - 4スレッド        → 累積時間 = 実時間 × 約4倍

## 実験方法

各設定の違いを見るには:

1. **ファイル数を変える**
   - 10ファイル: ./scripts/cleanup-tests.sh && ./scripts/generate-more-tests.sh 10
   - 50ファイル: ./scripts/cleanup-tests.sh && ./scripts/generate-more-tests.sh 50
   - 100ファイル: ./scripts/cleanup-tests.sh && ./scripts/generate-more-tests.sh 100

2. **setup時間の変化を観察**
   - isolate: false → ファイル数が増えてもsetup時間は一定
   - isolate: true  → ファイル数に比例してsetup時間が増加

3. **コンポーネントテストを増やす/減らす**
   - UIテストを削除 → environment時間が大幅減少
   - 計算処理のみ  → environment時間が最小化
`);

console.log("\n結果を保存しました: metrics-analysis.json");
fs.writeFileSync("metrics-analysis.json", JSON.stringify(results, null, 2));

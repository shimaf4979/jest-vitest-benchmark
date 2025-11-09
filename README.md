# Test Global Share Demo - Jest vs Vitest Benchmark

JestとVitestのパフォーマンスを比較するためのベンチマークプロジェクト。

## 🚀 クイックスタート

### ローカル実行

```bash
# 依存関係をインストール
pnpm install

# ベンチマークを実行（現在のファイル数で）
pnpm run benchmark
# → 結果: benchmark-results.json

# マルチスケールベンチマーク（10, 50, 100ファイルで実行）
pnpm run benchmark:multi
# → 結果: benchmark-results-10files.json
#        benchmark-results-50files.json
#        benchmark-results-100files.json
#        benchmark-results-all.json

# Vitest専用ベンチマーク
pnpm run benchmark:vitest
# → 結果: benchmark-vitest-results.json

# 個別にテスト実行
pnpm run test:jest
pnpm run test:vitest
pnpm run test:fastest  # 最速設定（開発用）
```

## 📊 GitHub Actions

`.github/workflows/benchmark.yml`

**トリガー:**
- `main`/`master`ブランチへのpush
- Pull Request
- 手動実行（workflow_dispatch）

**実行内容:**
- Node.js 20.x でベンチマークを実行
- 各テスト前にキャッシュをクリア
- 結果をArtifactとして保存（30日間保持）
- 結果をSummaryに表示

**手動実行方法:**
1. GitHubのリポジトリページを開く
2. "Actions" タブをクリック
3. "Benchmark - Jest vs Vitest" を選択
4. "Run workflow" をクリック

## 📁 プロジェクト構成

```
test-global-share-demo/
├── .github/
│   └── workflows/
│       └── benchmark.yml          # ベンチマークワークフロー
├── src/
│   ├── components/               # Reactコンポーネント
│   │   ├── Button.tsx
│   │   ├── Counter.tsx
│   │   ├── TodoList.tsx
│   │   └── Form.tsx
│   ├── jest/                     # Jestテスト（7ファイル）
│   │   ├── test1.test.ts
│   │   ├── test2.test.ts
│   │   ├── heavy.test.ts
│   │   ├── string-operations.test.ts
│   │   ├── async-operations.test.ts
│   │   ├── data-structures.test.ts
│   │   └── react-components.test.tsx
│   ├── vitest/                   # Vitestテスト（7ファイル）
│   │   └── (同じ構成)
│   ├── shared.ts
│   └── heavy-computation.ts
├── benchmark.js                  # ベンチマークスクリプト
├── jest.config.js               # Jest設定（デフォルト）
├── jest.config.maxWorkers-*.js  # Jestワーカー設定
├── vitest.config.ts             # Vitest設定（デフォルト）
├── vitest.config.*.ts           # Vitest各種設定
├── BENCHMARK.md                 # ベンチマーク詳細ドキュメント
└── package.json
```

## 🧪 テスト内容

合計: 約110-115テスト

1. **基本テスト** - グローバル状態の共有テスト
2. **heavy.test** - 重い計算処理（フィボナッチ、素数、行列演算）
3. **string-operations.test** - 文字列操作
4. **async-operations.test** - 非同期処理、Promise、タイムアウト
5. **data-structures.test** - データ構造（配列、Set、Map、Stack、Queue）
6. **react-components.test** - Reactコンポーネント（Button, Counter, TodoList, Form）

## ⚙️ 設定バリエーション

### Jest
- デフォルト
- 1 worker
- 2 workers
- 4 workers

### Vitest
- デフォルト
- No isolate（isolate: false）
- Slow mode（single thread + no isolate）
- 1 thread
- 2 threads
- 4 threads
- Forks mode

## 📈 結果の見方

### GitHub Actionsでの確認

1. **Summary** - Actions実行ページの"Summary"タブで結果を確認
2. **Artifacts** - 結果JSONファイルをダウンロード可能

### ローカルでの確認

```bash
# ベンチマーク実行
pnpm run benchmark

# 結果ファイルを確認
cat benchmark-results.json
```

## 🔍 なぜ slow mode が速いのか？

現在の結果では `slow mode` が最速ですが、これはテスト数が少ない（約112テスト）ためです。

### 理由
1. **並列化のオーバーヘッド** - スレッド起動コストがテスト実行時間より大きい
2. **jsdom初期化コスト** - 環境を複数回初期化するコストが高い
3. **テスト数が少ない** - 並列化の恩恵を受けるほどのテスト数がない

詳細は `ANALYSIS.md` を参照してください。

## 🧪 並列化の効果を確認する

テスト数を増やして並列化の効果を確認できます:

```bash
# テストファイルを20個に増やす
./scripts/generate-more-tests.sh 20

# ベンチマーク実行
pnpm run benchmark

# 結果確認後、クリーンアップ
./scripts/cleanup-tests.sh
```

テスト数が増えると、並列化の設定が有利になります。

### 簡易版

```bash
# 遅い設定（isolate: false）
npx vitest run --config vitest.config.no-isolate.ts

# 最も遅い（single thread + isolate: false）
npx vitest run --config vitest.config.slow.ts

# 速い設定（4 threads）
npx vitest run --config vitest.config.threads-4.ts
```

## 🛠️ 開発

### 新しいテストを追加

1. `src/jest/` と `src/vitest/` に同じテストファイルを追加
2. テストを実行して確認
3. ベンチマークで影響を確認

### 新しい設定を追加

1. 新しい設定ファイルを作成（例: `vitest.config.custom.ts`）
2. `benchmark.js` の `configs` 配列に追加
3. ベンチマークを実行

## 📝 ライセンス

ISC

## 🤝 コントリビューション

Issue や Pull Request を歓迎します！

### PR を作成する際

1. ブランチを作成
2. 変更を commit
3. PR を作成
4. 自動的にベンチマークが実行されます

## 📚 参考リンク

- [Jest Documentation](https://jestjs.io/)
- [Vitest Documentation](https://vitest.dev/)
- [GitHub Actions Documentation](https://docs.github.com/actions)

# Vitest vs Jest ベンチマーク

このプロジェクトは、VitestとJestのパフォーマンスを比較するためのベンチマークです。

## Vitestが遅くなるケースとその再現方法

### 1. **isolate: false の場合**
設定: `vitest.config.no-isolate.ts`

```typescript
{
  isolate: false  // テストファイル間で状態が共有される
}
```

**問題点:**
- テストファイル間でグローバル状態が共有される
- 副作用が他のテストに影響する可能性
- テストの順序に依存する問題が発生しやすい

**実行方法:**
```bash
npx vitest run --config vitest.config.no-isolate.ts
```

### 2. **シングルスレッド + isolate: false**
設定: `vitest.config.slow.ts`

```typescript
{
  isolate: false,
  pool: "threads",
  poolOptions: {
    threads: {
      singleThread: true
    }
  }
}
```

**問題点:**
- 並列実行の恩恵を受けられない
- すべてのテストが順次実行される
- jsdom環境のセットアップコストが毎回かかる

**実行方法:**
```bash
npx vitest run --config vitest.config.slow.ts
```

### 3. **デフォルト設定（最適化なし）**
設定: `vitest.config.ts`

明示的なプール設定やスレッド数の指定がない場合、環境によっては最適でない設定になる可能性があります。

## ベンチマーク実行方法

### 全ての設定で自動比較
```bash
pnpm run benchmark
```

このコマンドは以下を実行します:
1. 各テスト前にキャッシュをクリア
2. Jest/Vitestの全設定でテストを実行
3. 実行時間を比較
4. 結果を`benchmark-results.json`に保存

### 個別実行

#### Jest
```bash
# デフォルト
pnpm run test:jest

# ワーカー数指定
npx jest --config jest.config.maxWorkers-1.js
npx jest --config jest.config.maxWorkers-2.js
npx jest --config jest.config.maxWorkers-4.js
```

#### Vitest
```bash
# デフォルト
pnpm run test:vitest

# 遅い設定
npx vitest run --config vitest.config.no-isolate.ts
npx vitest run --config vitest.config.slow.ts

# スレッド数指定
npx vitest run --config vitest.config.threads-1.ts
npx vitest run --config vitest.config.threads-2.ts
npx vitest run --config vitest.config.threads-4.ts

# Forks モード
npx vitest run --config vitest.config.forks.ts
```

## テスト構成

各テストランナーで7つのテストファイル:
1. `test1.test.ts` - 基本テスト
2. `test2.test.ts` - 基本テスト
3. `heavy.test.ts` - 重い計算処理（フィボナッチ、素数、行列演算など）
4. `string-operations.test.ts` - 文字列操作
5. `async-operations.test.ts` - 非同期処理
6. `data-structures.test.ts` - データ構造
7. `react-components.test.tsx` - Reactコンポーネント（UI）

合計: 約110-115テスト

## 期待される結果

### Vitestが速いケース
- 適切なスレッド数が設定されている
- forksモードを使用
- isolateが適切に設定されている

### Vitestが遅いケース
- `isolate: false` + シングルスレッド
- デフォルト設定で最適化されていない
- jsdom環境で多数のコンポーネントテスト

### Jestの特徴
- ワーカー数によって安定したパフォーマンス
- 成熟したキャッシング機構
- 大規模プロジェクトでの実績

## パフォーマンス改善のポイント

### Vitest
1. `pool: "forks"` を使用（プロセス分離）
2. 適切なスレッド数を設定（CPUコア数に応じて）
3. `isolate: true` でテストを分離（デフォルト）
4. 必要に応じて`--no-cache`を使わない

### Jest
1. `maxWorkers` を調整（CPUコア数の50-75%推奨）
2. `--no-cache` は開発時のみ使用
3. テストの並列化を意識した設計

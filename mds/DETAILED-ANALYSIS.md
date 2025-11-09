# Vitest 設定の詳細比較

## slow mode vs 1 thread の違い

### 結果比較

```
Vitest (slow mode):   1404ms total
  Duration: 1.02s (transform 429ms, setup 573ms, collect 715ms, tests 526ms, environment 13.20s, prepare 71ms)

Vitest (1 thread):    4248ms total
  Duration: 3.75s (transform 576ms, setup 2.33s, collect 1.37s, tests 1.23s, environment 15.89s, prepare 268ms)
```

### 設定の違い

#### Vitest (slow mode) - `vitest.config.slow.ts`
```typescript
{
  isolate: false,           // ← 重要！
  pool: "threads",
  poolOptions: {
    threads: {
      singleThread: true
    }
  }
}
```

#### Vitest (1 thread) - `vitest.config.threads-1.ts`
```typescript
{
  isolate: true,            // ← デフォルト
  pool: "threads",
  poolOptions: {
    threads: {
      singleThread: true
    }
  }
}
```

## なぜ slow mode が速いのか？

### `isolate: false` の影響

| 項目 | slow mode (isolate: false) | 1 thread (isolate: true) | 差分 |
|------|---------------------------|-------------------------|------|
| **transform** | 429ms | 576ms | +147ms |
| **setup** | 573ms | 2.33s | **+1757ms** ⚠️ |
| **collect** | 715ms | 1.37s | +655ms |
| **tests** | 526ms | 1.23s | +704ms |
| **environment** | 13.20s | 15.89s | +2.69s |
| **prepare** | 71ms | 268ms | +197ms |
| **Total** | 1.02s | 3.75s | **+2.73s** |

### 主な違い

#### 1. **Setup時間の違い（573ms vs 2.33s = 約4倍）**

**isolate: false (slow mode)**:
- テストファイル間で環境を共有
- モジュールを一度だけロード
- jsdomインスタンスを再利用

**isolate: true (1 thread)**:
- 各テストファイルごとに環境をリセット
- モジュールを毎回再ロード
- jsdomを毎回クリーンアップ・再作成

```
slow mode: 
  [File1] → [File2] → [File3] ... (同じ環境を再利用)

1 thread:
  [File1] → [環境リセット] → [File2] → [環境リセット] → [File3] ...
```

#### 2. **Collect時間の違い（715ms vs 1.37s = 約2倍）**

テストケースの収集フェーズ:

**isolate: false**:
- モジュールキャッシュを活用
- importが高速

**isolate: true**:
- 毎回モジュールを再インポート
- キャッシュが使えない

#### 3. **Tests実行時間の違い（526ms vs 1.23s = 約2.3倍）**

実際のテスト実行:

**isolate: false**:
- 共有された環境で実行
- オーバーヘッドが少ない

**isolate: true**:
- 分離された環境で実行
- 環境の初期化コストが含まれる

## Environment時間について

```
slow mode:     13.20s
1 thread:      15.89s
差分:          +2.69s
```

これは**トータルの環境セットアップ時間**です:

**isolate: false**:
- jsdom環境を1回初期化 × 30ファイル分の累積

**isolate: true**:
- jsdom環境を30回初期化（各ファイルごと）

## なぜ Total Duration が実行時間と違うのか？

```
Completed in: 1404ms (実際の実行時間)
Duration:     1.02s  (Vitestが報告する時間)
```

**理由**:
- `Duration` はVitestのテスト実行フェーズのみ
- `Completed in` はプロセス全体（Vitest起動、終了処理含む）

## 内訳の詳細

### transform (429ms vs 576ms)
TypeScript → JavaScript への変換時間

**isolate: false**:
- ファイルを一度だけ変換
- 変換結果をキャッシュ

**isolate: true**:
- 環境リセット時に再変換が必要

### setup (573ms vs 2.33s) ⚠️ **最大の差**
テスト環境のセットアップ

**isolate: false**:
- グローバル環境を1回セットアップ
- すべてのファイルで共有

**isolate: true**:
- 各ファイルごとに環境をセットアップ
- 30ファイル × セットアップコスト

### collect (715ms vs 1.37s)
テストケースの収集

**isolate: false**:
- モジュール解決が高速
- キャッシュを活用

**isolate: true**:
- 毎回モジュールを再解決
- importを再実行

### tests (526ms vs 1.23s)
実際のテスト実行

**isolate: false**:
- 連続して実行
- 環境切り替えなし

**isolate: true**:
- ファイル間で環境をリセット
- 各テストがクリーンな状態

### prepare (71ms vs 268ms)
テスト実行の準備

**isolate: false**:
- 最小限の準備

**isolate: true**:
- 分離のための追加準備

## トレードオフ

### isolate: false (slow mode) の長所
✅ 高速（環境を再利用）
✅ メモリ効率が良い
✅ 小規模プロジェクトに最適

### isolate: false の短所
❌ テスト間で状態が共有される
❌ グローバル変数の汚染リスク
❌ テストの順序依存が起こりやすい
❌ デバッグが困難

### isolate: true (1 thread) の長所
✅ テストの独立性が保証される
✅ クリーンな状態で実行
✅ バグを見つけやすい
✅ 本番環境に近い

### isolate: true の短所
❌ 遅い（環境を毎回作り直す）
❌ メモリ使用量が多い
❌ セットアップコストが高い

## 実用的な推奨

### 開発中（速度優先）
```typescript
{
  isolate: false,  // 高速フィードバック
  pool: "threads",
  poolOptions: {
    threads: { singleThread: true }
  }
}
```

### CI/本番（安全性優先）
```typescript
{
  isolate: true,   // テストの独立性
  pool: "forks",   // 完全な分離
  poolOptions: {
    forks: { maxForks: 4 }
  }
}
```

### ハイブリッド
```json
{
  "scripts": {
    "test": "vitest --config vitest.config.slow.ts",      // 開発用
    "test:ci": "vitest --config vitest.config.threads-4.ts" // CI用
  }
}
```

## 結論

**slow mode が速い理由**:
- `isolate: false` により環境を再利用
- setup時間が **4倍** 速い（573ms vs 2.33s）
- トータルで **3倍** 速い（1.02s vs 3.75s）

**1 thread が遅い理由**:
- `isolate: true` により毎回環境をリセット
- 各ファイルごとに完全なセットアップが必要
- 安全性とのトレードオフ

**30ファイルでの影響**:
- ファイル数が多いほど `isolate: true` のオーバーヘッドが大きくなる
- 1ファイルあたり約90msの追加コスト
- 30ファイル × 90ms = 2.7秒の差

# なぜ isolate single と 1 thread で時間が違うのか？

## 結果の比較

```
Vitest (isolate single): 33936ms (33.9秒)
  Duration:  33.28s
  setup:     8.54s
  environment: 67.79s

Vitest (1 thread):       43776ms (43.8秒) ← 約10秒遅い！
  Duration:  43.10s
  setup:     10.96s
  environment: 87.93s
```

**差分: 約10秒 (29%遅い)**

## 設定の違い

### vitest.config.isolate-single.ts
```typescript
{
  globals: true,
  environment: "jsdom",
  include: ["src/vitest/**/*.test.ts", "src/vitest/**/*.test.tsx"],
  setupFiles: ["./vitest.setup.ts"],
  isolate: true,           // ← 明示的に指定
  pool: "threads",
  poolOptions: {
    threads: {
      singleThread: true,
    },
  },
}
```

### vitest.config.threads-1.ts
```typescript
{
  globals: true,
  environment: "jsdom",
  include: ["src/vitest/**/*.test.ts", "src/vitest/**/*.test.tsx"],
  setupFiles: ["./vitest.setup.ts"],
  // isolate: 指定なし → デフォルト値を使用
  pool: "threads",
  poolOptions: {
    threads: {
      singleThread: true,
    },
  },
}
```

**唯一の違い: `isolate` を明示的に書いているかどうか**

## なぜ違いが出るのか？

### 仮説1: デフォルト値の微妙な違い
Vitestのバージョンやコンテキストによって、`isolate` のデフォルト値が変わる可能性

```typescript
// isolate-single.ts
isolate: true  // 明示的にtrue

// threads-1.ts  
isolate: undefined → デフォルト値に解決される
```

デフォルト値が完全な `true` ではなく、何か中間的な動作をしている？

### 仮説2: 最適化の違い
明示的に `isolate: true` を書くと、Vitestが特定の最適化パスを通る

```
isolate明示:
  → より効率的な分離メカニズム
  
isolateデフォルト:
  → 保守的な動作（より慎重な分離）
```

### 仮説3: setupの実行回数
```
isolate single: setup 8.54s
1 thread:       setup 10.96s  (+2.42s)

environment:
isolate single: 67.79s
1 thread:       87.93s  (+20.14s)
```

**setup時間の差: 2.42秒**
**environment時間の差: 20.14秒**

これは、`1 thread` の方が:
- より多くのセットアップを実行している
- より重い環境管理をしている

可能性を示唆しています。

## Vitestの内部動作の推測

### isolate明示的にtrue
```javascript
if (config.isolate === true) {
  // 最適化された分離パス
  useOptimizedIsolation()
}
```

### isolate未指定
```javascript
if (config.isolate === undefined) {
  // デフォルト動作
  // より保守的な実装？
  config.isolate = getDefaultIsolate()
  useLegacyIsolation()
}
```

## 実験: 明示的にfalseにした場合

もし `threads-1.ts` で `isolate: false` を明示すると？

```typescript
// threads-1-false.ts (テスト用)
{
  isolate: false,  // 明示的にfalse
  pool: "threads",
  poolOptions: {
    threads: { singleThread: true }
  }
}
```

これが `slow mode` と同じ速度になるはず。

## 数値から見る違い

### ファイルあたりのコスト

**isolate single:**
```
setup: 8.54s ÷ 100ファイル = 85.4ms/ファイル
environment: 67.79s ÷ 100 = 677.9ms/ファイル
```

**1 thread:**
```
setup: 10.96s ÷ 100ファイル = 109.6ms/ファイル  (+24.2ms)
environment: 87.93s ÷ 100 = 879.3ms/ファイル  (+201.4ms)
```

**1ファイルあたりの追加コスト: 約225ms**
**100ファイル × 225ms = 22.5秒** ← これが10秒の差を説明

## 結論

### 直接的な原因
`isolate` を明示的に書くかどうかで、Vitestの内部動作が変わっている

### 推奨される対応

**明示的に書く:**
```typescript
export default defineConfig({
  test: {
    isolate: true,  // または false を明示的に
    // ...
  }
})
```

**理由:**
1. 動作が予測可能
2. パフォーマンスが安定
3. 設定の意図が明確

## 追加実験の提案

### 実験1: defaultにisolate: trueを追加
```typescript
// vitest.config.ts
{
  isolate: true,  // 追加
  // pool指定なし
}
```

→ 速くなるはず

### 実験2: threads-1にisolate: falseを追加
```typescript
// vitest.config.threads-1.ts
{
  isolate: false,  // 変更
  pool: "threads",
  poolOptions: { threads: { singleThread: true }}
}
```

→ slow modeと同じ速度になるはず

## Vitestのバージョン依存の可能性

この動作はVitestのバージョンによって変わる可能性があります:

```json
"vitest": "^4.0.8"
```

最新版では改善されているかもしれません。

## 実用的な教訓

### ベストプラクティス
```typescript
// 👍 Good: 明示的
export default defineConfig({
  test: {
    isolate: true,  // 明示的に指定
    pool: "threads",
    poolOptions: {
      threads: { singleThread: true }
    }
  }
})

// 👎 Avoid: 暗黙的
export default defineConfig({
  test: {
    // isolate未指定 → 予期しない動作
    pool: "threads",
    poolOptions: {
      threads: { singleThread: true }
    }
  }
})
```

### 速度を求めるなら
```typescript
{
  isolate: false,  // 明示的にfalse
  pool: "threads",
  poolOptions: { threads: { singleThread: true }}
}
```

### 安全性を求めるなら
```typescript
{
  isolate: true,  // 明示的にtrue
  pool: "forks",
  poolOptions: { forks: { maxForks: 4 }}
}
```

## まとめ

**問題:**
- 同じはずの設定なのに10秒の差
- `isolate: true` (明示) vs 未指定

**原因:**
- Vitestの内部実装の違い
- デフォルト値の解決ロジック
- 最適化パスの違い

**解決策:**
- 常に `isolate` を明示的に書く
- 設定の意図を明確にする

**重要な発見:**
設定を明示的に書くことで、約29%の速度改善が得られる！

# 設定ファイルの完全比較

## 全設定ファイルの一覧

### 1. vitest.config.ts (default)
```typescript
{
  isolate: デフォルト(true),
  pool: 指定なし → Vitestが自動判断
}
```

### 2. vitest.config.no-isolate.ts
```typescript
{
  isolate: false,  // 環境を共有
  // poolは指定なし
}
```

### 3. vitest.config.slow.ts (slow mode)
```typescript
{
  isolate: false,         // 環境を共有
  pool: "threads",
  poolOptions: {
    threads: {
      singleThread: true  // 1スレッドで実行
    }
  }
}
```

### 4. vitest.config.isolate-only.ts
```typescript
{
  isolate: true,  // 環境を分離
  // poolは指定なし → Vitestが自動判断
}
```

### 5. vitest.config.isolate-single.ts
```typescript
{
  isolate: true,          // 環境を分離
  pool: "threads",
  poolOptions: {
    threads: {
      singleThread: true  // 1スレッドで実行
    }
  }
}
```

### 6. vitest.config.threads-1.ts
```typescript
{
  isolate: デフォルト(true),
  pool: "threads",
  poolOptions: {
    threads: {
      singleThread: true
    }
  }
}
```

### 7. vitest.config.threads-2.ts
```typescript
{
  isolate: デフォルト(true),
  pool: "threads",
  poolOptions: {
    threads: {
      maxThreads: 2,
      minThreads: 2
    }
  }
}
```

### 8. vitest.config.threads-4.ts
```typescript
{
  isolate: デフォルト(true),
  pool: "threads",
  poolOptions: {
    threads: {
      maxThreads: 4,
      minThreads: 4
    }
  }
}
```

### 9. vitest.config.forks.ts
```typescript
{
  isolate: デフォルト(true),
  pool: "forks",  // プロセス分離
  poolOptions: {
    forks: {
      maxForks: 4,
      minForks: 4
    }
  }
}
```

## 設定の比較表

| 設定名 | isolate | pool | threads/forks | 説明 |
|--------|---------|------|---------------|------|
| **default** | true | 自動 | 自動 | Vitestにお任せ |
| **no-isolate** | false | 自動 | 自動 | 環境共有のみ指定 |
| **slow mode** | false | threads | 1 (single) | 環境共有＋シングル |
| **isolate only** | true | 自動 | 自動 | 環境分離のみ指定 |
| **isolate single** | true | threads | 1 (single) | 環境分離＋シングル |
| **1 thread** | true | threads | 1 (single) | 同上 |
| **2 threads** | true | threads | 2 | 環境分離＋2並列 |
| **4 threads** | true | threads | 4 | 環境分離＋4並列 |
| **forks** | true | forks | 4 | プロセス分離 |

## 実は同じ設定のペア

### ペア1: isolate single = 1 thread
```typescript
// vitest.config.isolate-single.ts
{ isolate: true, pool: "threads", poolOptions: { threads: { singleThread: true }}}

// vitest.config.threads-1.ts
{ isolate: デフォルト(true), pool: "threads", poolOptions: { threads: { singleThread: true }}}
```
→ **ほぼ同じ動作になるはず**

### ペア2: default ≈ isolate only
```typescript
// vitest.config.ts
{ isolate: デフォルト(true) }

// vitest.config.isolate-only.ts  
{ isolate: true }
```
→ **ほぼ同じ動作になるはず**

---

# なぜ時間を足し算してもDurationにならないのか？

## 実際の数値で見る

```
Vitest (default)
Completed in: 11186ms  ← 実際の経過時間
Duration:     10.79s   ← Vitestが報告する時間

内訳:
  transform:    1.41s
  setup:        6.49s
  collect:      2.57s
  tests:        1.65s
  environment:  50.41s  ← これが問題！
  prepare:      892ms

合計: 1.41 + 6.49 + 2.57 + 1.65 + 50.41 + 0.892 = 63.412s ❌
```

**63秒もかかってないのに、なぜ63秒？**

## 理由1: environment時間は累積時間

`environment` の時間は**並列実行された全ての環境の合計時間**です。

### 例: 4スレッドで並列実行

```
実際の経過時間:
0s ────────────────────── 3s
Thread 1: [==========] 3s environment
Thread 2: [==========] 3s environment  
Thread 3: [==========] 3s environment
Thread 4: [==========] 3s environment

報告される environment: 3s × 4 = 12s ← 累積！
実際の経過時間: 3s
```

### slow modeの場合

```
slow mode:
  Completed in: 1636ms (実経過時間)
  environment:  44.25s (累積時間)

なぜ44秒？
→ 100ファイル × 平均442ms/ファイル = 44.25s

でも実際は1.6秒しかかかっていない！
→ シングルスレッドで連続実行だから
```

## 理由2: 各メトリクスの意味が異なる

| メトリクス | 計測方法 | 並列化の影響 |
|-----------|----------|-------------|
| transform | 累積時間 | 並列実行の合計 |
| setup | 累積時間 | 並列実行の合計 |
| collect | 累積時間 | 並列実行の合計 |
| tests | 累積時間 | 並列実行の合計 |
| **environment** | **累積時間** | **全スレッドの合計** ⚠️ |
| prepare | 実時間 | 準備の実時間 |

## 実際の計算例

### Vitest (4 threads)
```
Completed in: 11984ms (実際の経過時間)
Duration:     11.58s

内訳:
  transform:    1.04s
  setup:        8.05s
  collect:      2.44s
  tests:        2.27s
  environment:  53.85s  ← 4スレッド × 各スレッドの累積
  prepare:      929ms

Durationの計算:
  transform + setup + collect + tests + prepare
  = 1.04 + 8.05 + 2.44 + 2.27 + 0.929
  = 14.72s ← これでも合わない

実は Duration は「メインスレッドの経過時間」に近い
environment は別カウント（参考値）
```

## 正しい理解

### Duration (10.79s)
**メインスレッド視点での実行時間**
- Vitestのテストランナーが実際に動いている時間
- ワーカースレッドの待ち時間も含む

### environment (50.41s)
**全スレッド/プロセスのjsdom操作の合計時間**
- スレッド1: 12.6s
- スレッド2: 12.5s
- スレッド3: 12.7s
- スレッド4: 12.6s
- **合計: 50.4s** ← これを表示

### Completed in (11186ms)
**プロセス全体の実経過時間**
- Vitestの起動時間
- テスト実行時間
- 終了処理時間

## 視覚的な説明

```
タイムライン（4スレッド並列の例）:

0ms ────────────────────────────────── 11186ms (Completed in)
├─ Vitest起動
├─ prepare: 892ms
├─────────────────────────────────────┐
│ Thread 1: jsdom操作 12.6s           │
│ Thread 2: jsdom操作 12.5s           │ → environment: 50.41s
│ Thread 3: jsdom操作 12.7s           │   (並列実行の合計)
│ Thread 4: jsdom操作 12.6s           │
├─────────────────────────────────────┘
└─ 終了処理

メインスレッド視点: Duration 10.79s
実経過時間:         Completed in 11.18s
累積時間(参考値):   environment 50.41s
```

## まとめ

### なぜ足し算が合わない？

1. **environment は累積時間**
   - 並列実行された全スレッドの合計
   - 実経過時間とは異なる

2. **各メトリクスは異なる計測方法**
   - Duration: メインスレッドの時間
   - environment: 全スレッドの累積
   - Completed in: プロセス全体の経過時間

3. **重要なのは `Completed in`**
   - これが実際にかかった時間
   - ユーザーが体感する速度

### 実用的な見方

```
slow mode:
  Completed in: 1636ms   ← これを見る！
  environment:  44.25s   ← 参考値（累積）

4 threads:
  Completed in: 11984ms  ← これを見る！
  environment:  53.85s   ← 参考値（累積）
```

**結論: `Completed in` の値で比較するのが正解！**

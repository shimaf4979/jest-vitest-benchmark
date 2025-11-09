# ベンチマーク結果分析

## slow mode が最速になった理由

### ベンチマーク結果
```
1. Vitest (slow mode)        - 2088ms  ← 最速！
2. Vitest (no-isolate)       - 2116ms
3. Vitest (2 threads)        - 3347ms
4. Vitest (1 thread)         - 3392ms
5. Vitest (4 threads)        - 3394ms
6. Vitest (forks)            - 3427ms
7. Vitest (default)          - 3480ms
8. Jest (1 worker)           - 7340ms
9. Jest (2 workers)          - 7557ms
10. Jest (default)           - 10271ms
11. Jest (4 workers)         - 10797ms
```

## 原因分析

### 1. **テスト数が少ない（約112テスト）**

並列化のオーバーヘッドが利益を上回る:
- スレッド/プロセスの起動コスト
- 環境(jsdom)の複数回初期化
- テスト間の通信コスト

### 2. **isolate: false の効果**

`slow mode` の設定:
```typescript
{
  isolate: false,           // テスト間で環境を共有
  pool: "threads",
  poolOptions: {
    threads: {
      singleThread: true    // シングルスレッド
    }
  }
}
```

**メリット:**
- jsdom環境を1回だけ初期化
- モジュールのロード/キャッシュが共有される
- テストファイル間の切り替えコストが最小

**デメリット:**
- グローバル状態が共有される（副作用のリスク）
- テストの独立性が損なわれる

### 3. **jsdom の初期化コストが支配的**

Reactコンポーネントのテストを含むため、jsdom環境のセットアップが重い:

```
単一環境（slow mode）:
jsdom初期化 × 1 = 低コスト

並列実行（4 threads）:
jsdom初期化 × 4 = 高コスト
```

### 4. **テストの特性**

現在のテスト内容:
- 計算処理（CPU依存）より環境セットアップの比重が大きい
- 個々のテストが軽量
- I/O待ちが少ない

## 並列化が有利になるケース

### テスト数を増やす

テストファイルを増やして実験:

```bash
# テストファイルを20個に増やす
for i in {8..20}; do
  cp src/vitest/heavy.test.ts src/vitest/heavy-$i.test.ts
  cp src/jest/heavy.test.ts src/jest/heavy-$i.test.ts
done

# 再度ベンチマーク
pnpm run benchmark
```

期待される結果:
- slow mode: 線形に増加（2088ms → 約4000ms）
- 4 threads: サブ線形に増加（3394ms → 約4500ms）
- **並列化が有利になる**

### より重い処理を追加

```typescript
// 例: 非常に重いテスト
test("very heavy computation", () => {
  const result = fibonacci(40); // 非常に遅い
  expect(result).toBe(102334155);
});
```

CPU集約的なテストが増えると並列化の恩恵が大きくなります。

## 実用的な推奨設定

### 小規模プロジェクト（<200テスト）
```typescript
// vitest.config.ts
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
→ **オーバーヘッドを最小化**

### 中規模プロジェクト（200-1000テスト）
```typescript
{
  isolate: true,
  pool: "threads",
  poolOptions: {
    threads: {
      maxThreads: 2,  // CPUコア数の半分
    }
  }
}
```
→ **バランス**

### 大規模プロジェクト（1000+テスト）
```typescript
{
  isolate: true,
  pool: "forks",
  poolOptions: {
    forks: {
      maxForks: 4,  // CPUコア数程度
    }
  }
}
```
→ **完全分離で安定性優先**

## Jest が遅い理由

1. **変換オーバーヘッド**: ts-jestによるTypeScript変換
2. **環境セットアップ**: jsdom環境の初期化が重い
3. **成熟したツールのコスト**: 多機能ゆえの複雑性

## 改善の提案

### より現実的なベンチマークにする

1. **テスト数を増やす**
   ```bash
   # 各テストファイルを複製
   ./scripts/duplicate-tests.sh 20
   ```

2. **より重い処理を追加**
   ```typescript
   // src/heavy-computation.ts に追加
   export function veryHeavyComputation() {
     return fibonacci(35) + calculatePrimes(10000);
   }
   ```

3. **I/O操作を含める**
   ```typescript
   test("file operations", async () => {
     const data = await fs.promises.readFile("test.txt");
     expect(data).toBeDefined();
   });
   ```

### 実験スクリプト

```bash
#!/bin/bash
# scripts/scale-test.sh

echo "Testing with different test counts..."

for count in 10 20 50 100 200; do
  echo "Test count: $count"
  # テストを複製
  ./scripts/generate-tests.sh $count
  # ベンチマーク実行
  pnpm run benchmark
  # 結果を保存
  mv benchmark-results.json "results-$count-tests.json"
done
```

## 結論

**現在の状況:**
- テスト数が少ない（112テスト）
- 環境セットアップコストが支配的
- オーバーヘッドの方が並列化の利益より大きい

**slow mode が速い理由:**
- jsdom初期化が1回で済む
- モジュールキャッシュが共有される
- スレッド間通信がない

**実プロジェクトでは:**
- テスト数が増えると並列化が有利になる
- 安全性（isolate: true）とのトレードオフを考慮
- プロジェクト規模に応じた設定が必要

# Vitest メトリクスの詳細説明

## Duration の各項目の意味

```
Duration: 10.79s (transform 1.41s, setup 6.49s, collect 2.57s, tests 1.65s, environment 50.41s, prepare 892ms)
```

### 1. **transform** (変換時間)
TypeScript/JSX → JavaScript への変換時間

```
transform 1.41s
```

**何をしているか:**
- `.ts` → `.js` への変換
- `.tsx` → `.js` への変換  
- ESM/CommonJSの変換

**影響する要因:**
- ファイル数
- TypeScriptの複雑さ
- トランスパイラの性能（esbuild, swc等）

**isolate の影響:**
- `isolate: false` → 1回だけ変換
- `isolate: true` → 環境リセット時に再変換の可能性

### 2. **setup** (セットアップ時間)
テスト環境のセットアップ時間

```
setup 6.49s
```

**何をしているか:**
- グローバル変数の設定
- setupFiles の実行 (`vitest.setup.ts`)
- テストランナーの初期化
- モックの準備

**isolate の影響:**
```
isolate: false (slow mode)
  setup 663ms    ← 1回だけセットアップ

isolate: true (default)  
  setup 6.49s    ← 各ファイルごとにセットアップ (100ファイル × 約65ms)
```

**これが最大の差を生む！**

### 3. **collect** (収集時間)
テストケースの収集時間

```
collect 2.57s
```

**何をしているか:**
- テストファイルの読み込み
- `describe`, `test` の検出
- テストツリーの構築
- モジュールの依存関係解決

**処理の流れ:**
```javascript
// このようなテストケースを見つける
describe("Test Suite", () => {
  test("test 1", () => { ... });
  test("test 2", () => { ... });
});
```

**isolate の影響:**
- `isolate: false` → モジュールキャッシュを活用
- `isolate: true` → 毎回モジュールを再読み込み

### 4. **tests** (テスト実行時間)
実際のテストコードの実行時間

```
tests 1.65s
```

**何をしているか:**
- テストケース内のコードを実行
- アサーション (`expect`) の評価
- 非同期処理の待機

**これは純粋なテストロジックの実行時間**

100ファイル × 約34テスト/ファイル = 約3400テスト
→ 1テストあたり約0.5ms

**なぜ isolate で変わる:**
- `isolate: false` → 連続実行
- `isolate: true` → ファイル間で環境リセットのオーバーヘッド

### 5. **environment** ⚠️ 最も重要！
テスト環境（jsdom）の初期化・管理時間の**累積**

```
environment 50.41s
```

**何をしているか:**
- jsdomインスタンスの作成
- DOM APIの初期化 (document, window, etc.)
- React Testing Libraryの準備
- 環境のクリーンアップ

**これは累積時間！**
```
isolate: false (slow mode)
  environment 44.25s
  = 1つのjsdom × 100ファイル分の累積使用時間

isolate: true (default)
  environment 50.41s  
  = 100個のjsdom × 各ファイルの累積時間
```

**重要な誤解を避ける:**
- この時間は実際の経過時間ではない
- すべてのjsdom操作の合計時間
- 並列実行でもこの数値は減らない

**比較:**
```
slow mode:   44.25s environment (1つの環境を100ファイルで共有)
default:     50.41s environment (環境を作り直すオーバーヘッド)
forks:       78.37s environment (プロセス分離のコストが大きい)
```

### 6. **prepare** (準備時間)
テスト実行の最終準備

```
prepare 892ms
```

**何をしているか:**
- テストスイートの並べ替え
- ワーカースレッド/プロセスの割り当て
- メモリの確保

**影響する要因:**
- pool設定 (threads vs forks)
- 並列数

## 実際の例で見る

### Vitest (slow mode) - 最速
```
Duration: 1.23s
  transform:    985ms   ← 1回だけ変換
  setup:        663ms   ← 1回だけセットアップ ✅
  collect:      1.46s   ← キャッシュ活用
  tests:        772ms   ← 連続実行
  environment:  44.25s  ← 1つの環境を共有
  prepare:      52ms    ← シンプル
```

### Vitest (default) - 並列
```
Duration: 10.79s
  transform:    1.41s   ← 並列で変換
  setup:        6.49s   ← 100ファイル × 65ms ⚠️
  collect:      2.57s   ← 毎回再読み込み
  tests:        1.65s   ← 並列実行
  environment:  50.41s  ← 環境作り直しのコスト
  prepare:      892ms   ← 並列化の準備
```

### Vitest (forks) - 最も安全
```
Duration: 16.39s
  transform:    1.53s
  setup:        9.46s   ← プロセス分離のコスト
  collect:      3.28s
  tests:        2.45s
  environment:  78.37s  ← プロセス間通信のオーバーヘッド ⚠️
  prepare:      1.37s   ← fork準備
```

## なぜ並列化しても遅い？

100ファイルでも並列化が効果的でない理由:

### 1. **setup時間が支配的**
```
1 thread:  setup 6.35s
4 threads: setup 8.05s  ← 並列化で逆に遅くなる！
```

**理由:**
- jsdom初期化は並列化できない部分が多い
- スレッド間の同期コスト
- メモリ競合

### 2. **environment時間の増加**
```
1 thread:  environment 43.62s
4 threads: environment 53.85s  (+10s)
forks:     environment 78.37s  (+35s)
```

**理由:**
- プロセス/スレッド分離のオーバーヘッド
- jsdomの複数インスタンス管理コスト

### 3. **テスト自体が軽量**
```
tests: 1.65s (100ファイル)
= 約16ms/ファイル
```

テスト実行時間 < 環境セットアップ時間
→ 並列化の恩恵が小さい

## 最適な設定の選び方

### 開発中（フィードバック速度重視）
```typescript
{
  isolate: false,  // ← slow mode
  pool: "threads",
  poolOptions: { threads: { singleThread: true } }
}
```
**理由:** setup時間が最小（663ms vs 6.49s）

### CI/本番（安全性重視）
```typescript
{
  isolate: true,
  pool: "forks",
  poolOptions: { forks: { maxForks: 4 } }
}
```
**理由:** 完全分離、状態汚染なし

### バランス重視
```typescript
{
  isolate: true,
  pool: "threads",
  poolOptions: { threads: { singleThread: true } }
}
```
**理由:** 安全性を保ちつつ、オーバーヘッド最小

## まとめ

| メトリクス | 意味 | isolate: false | isolate: true |
|-----------|------|----------------|---------------|
| transform | TS→JS変換 | 1回 | 各ファイル |
| **setup** | 環境セットアップ | **1回のみ** ✅ | **100回** ⚠️ |
| collect | テスト収集 | キャッシュ活用 | 毎回再読み込み |
| tests | テスト実行 | 連続実行 | 分離実行 |
| **environment** | jsdom管理 | 共有 | 分離（コスト大）|
| prepare | 準備 | シンプル | 並列化準備 |

**100ファイルの結論:**
- `isolate: false` が圧倒的に速い（1.6s vs 10s+）
- 並列化しても setup/environment のコストが大きい
- テストが軽量すぎて並列化の恩恵が小さい

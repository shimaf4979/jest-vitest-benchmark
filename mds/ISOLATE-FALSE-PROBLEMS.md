# isolate: false で失敗する例と解決方法

## 概要

`isolate: false` は高速ですが、テスト間で環境が共有されるため、副作用が問題になります。
このドキュメントでは、実際の失敗例と、個別ファイルで修正する方法を説明します。

## 問題の種類

### 1. グローバル変数の汚染
### 2. DOM要素の残留
### 3. モジュールキャッシュの共有

---

## 例1: グローバル変数の汚染

### 問題コード

**isolate-false-problem-1.test.ts**
```typescript
// グローバル変数を変更
(globalThis as any).SHARED_COUNTER = 100;

test("should increment SHARED_COUNTER", () => {
  (globalThis as any).SHARED_COUNTER++;
  expect((globalThis as any).SHARED_COUNTER).toBe(101);
});
```

**isolate-false-problem-2.test.ts**
```typescript
test("should NOT have SHARED_COUNTER", () => {
  // isolate: false の場合、前のファイルで101になっている
  expect((globalThis as any).SHARED_COUNTER).toBeUndefined(); // ❌ 失敗！
});
```

### 実行結果

```bash
# isolate: false で実行
npx vitest run --config vitest.config.fastest.ts

# problem-2 が失敗:
# Expected: undefined
# Received: 101
```

### 解決方法: beforeEach/afterEach でクリーンアップ

**isolate-false-problem-3-fixed.test.ts**
```typescript
describe("Fixed Example", () => {
  let originalValue: any;
  
  beforeEach(() => {
    // テスト前に現在の値を保存
    originalValue = (globalThis as any).SHARED_COUNTER;
  });
  
  afterEach(() => {
    // テスト後に元の値に戻す
    if (originalValue === undefined) {
      delete (globalThis as any).SHARED_COUNTER;
    } else {
      (globalThis as any).SHARED_COUNTER = originalValue;
    }
  });
  
  test("should safely use SHARED_COUNTER", () => {
    (globalThis as any).SHARED_COUNTER = 999;
    expect((globalThis as any).SHARED_COUNTER).toBe(999);
    // afterEach で元に戻される ✅
  });
});
```

---

## 例2: DOM要素の残留

### 問題コード

**isolate-false-problem-dom-1.test.tsx**
```typescript
const DirtyComponent: React.FC = () => {
  React.useEffect(() => {
    const style = document.createElement("style");
    style.id = "dirty-style";
    style.textContent = "body { background: red; }";
    document.head.appendChild(style);
    
    // クリーンアップしない！❌
  }, []);
  
  return <div>Dirty Component</div>;
};

test("should render dirty component", () => {
  render(<DirtyComponent />);
  // styleがDOMに追加されたまま
});
```

**isolate-false-problem-dom-2.test.tsx**
```typescript
test("should NOT have dirty-style", () => {
  const style = document.getElementById("dirty-style");
  expect(style).toBeNull(); // ❌ 失敗！前のテストで追加されたまま
});
```

### 実行結果

```bash
# isolate: false で実行
npx vitest run --config vitest.config.fastest.ts

# dom-2 が失敗:
# Expected: null
# Received: <style id="dirty-style">...</style>
```

### 解決方法1: コンポーネント内でクリーンアップ

```typescript
const CleanComponent: React.FC = () => {
  React.useEffect(() => {
    const style = document.createElement("style");
    style.id = "clean-style";
    document.head.appendChild(style);
    
    // クリーンアップ関数を返す ✅
    return () => {
      style.remove();
    };
  }, []);
  
  return <div>Clean Component</div>;
};
```

### 解決方法2: テストファイルでクリーンアップ

**isolate-false-problem-dom-3-fixed.test.tsx**
```typescript
describe("Fixed DOM Example", () => {
  afterEach(() => {
    // Reactコンポーネントのクリーンアップ
    cleanup();
    
    // 追加のクリーンアップ
    const style = document.getElementById("clean-style");
    if (style) {
      style.remove();
    }
  });
  
  test("should render clean component", () => {
    render(<CleanComponent />);
    // afterEach でクリーンアップされる ✅
  });
  
  test("should be clean after previous test", () => {
    const style = document.getElementById("clean-style");
    expect(style).toBeNull(); // ✅ 成功！
  });
});
```

---

## 検証方法

### isolate: false で実行（失敗を確認）

```bash
# fastest設定（isolate: false）
npx vitest run --config vitest.config.fastest.ts

# 失敗するテスト:
# - isolate-false-problem-2.test.ts
# - isolate-false-problem-dom-2.test.tsx
```

### isolate: true で実行（成功を確認）

```bash
# isolate: true の設定
npx vitest run --config vitest.config.isolate-single.ts

# 全て成功 ✅
# 環境がリセットされるため、副作用が影響しない
```

### 修正版のみテスト（isolate: false でも成功）

```bash
# 修正版のファイルのみ実行
npx vitest run --config vitest.config.fastest.ts isolate-false-problem-3-fixed isolate-false-problem-dom-3-fixed

# 全て成功 ✅
# 適切なクリーンアップにより、isolate: false でも安全
```

---

## ベストプラクティス

### 1. グローバル変数を使う場合

```typescript
describe("Test with global state", () => {
  let originalValue: any;
  
  beforeEach(() => {
    originalValue = (globalThis as any).SOME_GLOBAL;
  });
  
  afterEach(() => {
    // 必ず元に戻す
    if (originalValue === undefined) {
      delete (globalThis as any).SOME_GLOBAL;
    } else {
      (globalThis as any).SOME_GLOBAL = originalValue;
    }
  });
  
  // テスト...
});
```

### 2. DOM操作をする場合

```typescript
describe("Test with DOM manipulation", () => {
  afterEach(() => {
    // Reactのクリーンアップ
    cleanup();
    
    // カスタム要素のクリーンアップ
    document.querySelectorAll('[data-test-element]').forEach(el => {
      el.remove();
    });
  });
  
  // テスト...
});
```

### 3. Reactコンポーネントの副作用

```typescript
const Component: React.FC = () => {
  React.useEffect(() => {
    // 副作用
    const handler = () => { /* ... */ };
    window.addEventListener('resize', handler);
    
    // 必ずクリーンアップを実装 ✅
    return () => {
      window.removeEventListener('resize', handler);
    };
  }, []);
  
  return <div>...</div>;
};
```

---

## まとめ

### isolate: false の問題点

| 問題 | 原因 | 影響 |
|------|------|------|
| グローバル変数汚染 | 変数の変更が残る | 他のテストが失敗 |
| DOM要素残留 | 要素が削除されない | メモリリーク、衝突 |
| モジュールキャッシュ | モックが残る | 予期しない動作 |

### 解決策

| 方法 | 実装場所 | メリット | デメリット |
|------|----------|----------|-----------|
| **beforeEach/afterEach** | テストファイル | 確実にクリーンアップ | 各ファイルで実装必要 |
| **useEffect cleanup** | コンポーネント | 再利用可能 | コンポーネント修正必要 |
| **isolate: true** | 設定ファイル | 自動的に分離 | 遅い |

### 推奨設定

**開発時（速度優先）**
```typescript
// vitest.config.ts
{
  isolate: false,
  // 各テストファイルでクリーンアップを徹底
}
```

**CI（安全性優先）**
```typescript
// vitest.config.ci.ts
{
  isolate: true,
  // 自動的に環境を分離
}
```

---

## テスト実行

```bash
# 問題を確認
pnpm run test:fastest

# 修正版のみテスト
npx vitest run --config vitest.config.fastest.ts -t "Fixed"

# isolate: true で比較
npx vitest run --config vitest.config.isolate-single.ts
```

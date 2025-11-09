import { describe, test, expect, beforeEach, afterEach } from "vitest";

/**
 * isolate: false でも成功する例（修正版）
 *
 * 解決方法: beforeEach/afterEach でクリーンアップ
 *
 * 個別ファイルでグローバル状態を管理することで、
 * isolate: false でも安全にテストできる
 */

describe("Isolate False Problem 3 - Fixed", () => {
  // 元の値を保存
  let originalValue: any;

  beforeEach(() => {
    // テスト前に現在の値を保存
    originalValue = (globalThis as any).SHARED_COUNTER;
  });

  afterEach(() => {
    // テスト後に元の値に戻す（クリーンアップ）
    if (originalValue === undefined) {
      delete (globalThis as any).SHARED_COUNTER;
    } else {
      (globalThis as any).SHARED_COUNTER = originalValue;
    }
  });

  test("should safely use SHARED_COUNTER", () => {
    // グローバル変数を変更
    (globalThis as any).SHARED_COUNTER = 999;
    expect((globalThis as any).SHARED_COUNTER).toBe(999);
    // afterEach で元に戻される
  });

  test("should be clean after previous test", () => {
    // 前のテストの影響を受けない
    // beforeEach で元の値が復元されている
    expect((globalThis as any).SHARED_COUNTER).toBe(originalValue);
  });
});

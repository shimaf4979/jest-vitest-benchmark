import { describe, test, expect } from "vitest";

/**
 * isolate: false で失敗する例 1
 *
 * グローバル変数を変更すると、他のテストファイルに影響する
 */

// グローバル変数を変更
(globalThis as any).SHARED_COUNTER = 100;

describe("Isolate False Problem 1", () => {
  test("should have SHARED_COUNTER = 100", () => {
    expect((globalThis as any).SHARED_COUNTER).toBe(100);
  });

  test("should increment SHARED_COUNTER", () => {
    (globalThis as any).SHARED_COUNTER++;
    expect((globalThis as any).SHARED_COUNTER).toBe(101);
  });
});

import { describe, test, expect } from "vitest";

/**
 * isolate: false で失敗する例 2
 *
 * 前のファイル(problem-1)で変更されたグローバル変数の影響を受ける
 *
 * 期待: SHARED_COUNTER = undefined (初期状態)
 * 実際: SHARED_COUNTER = 101 (problem-1で変更された後)
 *
 * これは isolate: false の場合のみ失敗します
 */

describe("Isolate False Problem 2", () => {
  test("should NOT have SHARED_COUNTER (expects undefined)", () => {
    // isolate: false の場合、problem-1で101になっているので失敗
    // isolate: true  の場合、環境がリセットされるので成功
    expect((globalThis as any).SHARED_COUNTER).toBeUndefined();
  });
});

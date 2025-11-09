import React from "react";
import { describe, test, expect } from "vitest";
import { render } from "@testing-library/react";

/**
 * isolate: false で失敗する例 - DOM編 2
 *
 * 前のファイル(dom-1)で追加されたstyleタグが残っている
 * isolate: false の場合のみ失敗
 */

describe("Isolate False Problem - DOM 2", () => {
  test("should NOT have dirty-style (expects null)", () => {
    // isolate: false の場合、dom-1で追加されたstyleが残っているので失敗
    // isolate: true  の場合、環境がリセットされるので成功
    const style = document.getElementById("dirty-style");
    expect(style).toBeNull();
  });
});

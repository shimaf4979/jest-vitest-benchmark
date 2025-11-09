import React from "react";
import { describe, test, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";

/**
 * isolate: false でも成功する例 - DOM編（修正版）
 *
 * 解決方法: afterEach で DOM をクリーンアップ
 */

const CleanComponent: React.FC = () => {
  React.useEffect(() => {
    const style = document.createElement("style");
    style.id = "clean-style";
    style.textContent = "body { background: blue; }";
    document.head.appendChild(style);

    // 適切なクリーンアップを実装
    return () => {
      style.remove();
    };
  }, []);

  return <div>Clean Component</div>;
};

describe("Isolate False Problem - DOM 3 Fixed", () => {
  afterEach(() => {
    // React コンポーネントのクリーンアップ
    cleanup();

    // 追加のクリーンアップ: テストで追加した要素を削除
    const style = document.getElementById("clean-style");
    if (style) {
      style.remove();
    }
  });

  test("should render clean component", () => {
    const { getByText } = render(<CleanComponent />);
    expect(getByText("Clean Component")).toBeInTheDocument();

    const style = document.getElementById("clean-style");
    expect(style).toBeTruthy();
    // afterEach でクリーンアップされる
  });

  test("should be clean after previous test", () => {
    // 前のテストで追加されたstyleは削除されている
    const style = document.getElementById("clean-style");
    expect(style).toBeNull();
  });
});

import React from "react";
import { describe, test, expect } from "vitest";
import { render } from "@testing-library/react";

/**
 * isolate: false で失敗する例 - DOM編
 *
 * DOMに要素を追加して、クリーンアップしない
 */

const DirtyComponent: React.FC = () => {
  // マウント時にグローバルにスタイルを追加（副作用）
  React.useEffect(() => {
    const style = document.createElement("style");
    style.id = "dirty-style";
    style.textContent = "body { background: red; }";
    document.head.appendChild(style);

    // クリーンアップしない！
  }, []);

  return <div>Dirty Component</div>;
};

describe("Isolate False Problem - DOM 1", () => {
  test("should render dirty component", () => {
    const { getByText } = render(<DirtyComponent />);
    expect(getByText("Dirty Component")).toBeInTheDocument();

    // styleが追加される
    const style = document.getElementById("dirty-style");
    expect(style).toBeTruthy();
  });
});

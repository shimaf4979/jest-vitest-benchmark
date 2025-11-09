import { shared } from "../shared";

test("vitest test2 reads shared", () => {
  console.log(
    "vitest test2:",
    shared.count,
    (globalThis as any).GLOBAL_COUNTER,
  );
});

import { shared } from "../shared";

test("vitest test1 modifies shared", () => {
  shared.count++;
  (globalThis as any).GLOBAL_COUNTER++;
  console.log(
    "vitest test1:",
    shared.count,
    (globalThis as any).GLOBAL_COUNTER,
  );
});

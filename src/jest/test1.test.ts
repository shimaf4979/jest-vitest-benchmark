import { shared } from "../shared";

test("jest test1 modifies shared", () => {
  shared.count++;
  (globalThis as any).GLOBAL_COUNTER++;
  console.log("jest test1:", shared.count, (globalThis as any).GLOBAL_COUNTER);
});

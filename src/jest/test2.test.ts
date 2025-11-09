import { shared } from "../shared";

test("jest test2 reads shared", () => {
  console.log("jest test2:", shared.count, (globalThis as any).GLOBAL_COUNTER);
});

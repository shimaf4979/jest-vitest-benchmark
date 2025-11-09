import { describe, test, expect } from "vitest";

describe("Async Operations Tests - Vitest", () => {
  describe("Promise Tests", () => {
    test("should resolve promise", async () => {
      const promise = Promise.resolve(42);
      await expect(promise).resolves.toBe(42);
    });

    test("should reject promise", async () => {
      const promise = Promise.reject(new Error("failed"));
      await expect(promise).rejects.toThrow("failed");
    });

    test("should handle multiple promises", async () => {
      const promises = [
        Promise.resolve(1),
        Promise.resolve(2),
        Promise.resolve(3),
      ];
      const results = await Promise.all(promises);
      expect(results).toEqual([1, 2, 3]);
    });

    test("should handle promise race", async () => {
      const promises = [
        new Promise((resolve) => setTimeout(() => resolve("slow"), 100)),
        new Promise((resolve) => setTimeout(() => resolve("fast"), 10)),
      ];
      const result = await Promise.race(promises);
      expect(result).toBe("fast");
    });
  });

  describe("Async/Await Tests", () => {
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    test("should wait for timeout", async () => {
      const start = Date.now();
      await delay(50);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(40);
    });

    test("should process async array", async () => {
      const numbers = [1, 2, 3, 4, 5];
      const processAsync = async (n: number) => {
        await delay(10);
        return n * 2;
      };
      const results = await Promise.all(numbers.map(processAsync));
      expect(results).toEqual([2, 4, 6, 8, 10]);
    });

    test("should handle async errors", async () => {
      const failAsync = async () => {
        await delay(10);
        throw new Error("Async error");
      };
      await expect(failAsync()).rejects.toThrow("Async error");
    });
  });

  describe("Async Data Processing", () => {
    const fetchData = async (id: number) => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return { id, name: `Item ${id}`, value: id * 10 };
    };

    test("should fetch single item", async () => {
      const item = await fetchData(1);
      expect(item).toEqual({ id: 1, name: "Item 1", value: 10 });
    });

    test("should fetch multiple items", async () => {
      const ids = [1, 2, 3, 4, 5];
      const items = await Promise.all(ids.map(fetchData));
      expect(items.length).toBe(5);
      expect(items[0].id).toBe(1);
      expect(items[4].id).toBe(5);
    });

    test("should handle parallel async operations", async () => {
      const operations = Array.from({ length: 10 }, (_, i) => fetchData(i));
      const results = await Promise.all(operations);
      expect(results.length).toBe(10);
    });
  });

  describe("Async Retry Logic", () => {
    let attemptCount = 0;

    const unreliableOperation = async () => {
      attemptCount++;
      if (attemptCount < 3) {
        throw new Error("Failed");
      }
      return "Success";
    };

    const retryOperation = async (
      fn: () => Promise<string>,
      maxRetries: number,
    ) => {
      let lastError;
      for (let i = 0; i < maxRetries; i++) {
        try {
          return await fn();
        } catch (error) {
          lastError = error;
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
      }
      throw lastError;
    };

    test("should retry failed operation", async () => {
      attemptCount = 0;
      const result = await retryOperation(unreliableOperation, 5);
      expect(result).toBe("Success");
      expect(attemptCount).toBe(3);
    });
  });

  describe("Async Queue Processing", () => {
    test("should process queue sequentially", async () => {
      const queue = [1, 2, 3, 4, 5];
      const results: number[] = [];

      for (const item of queue) {
        await new Promise((resolve) => setTimeout(resolve, 5));
        results.push(item * 2);
      }

      expect(results).toEqual([2, 4, 6, 8, 10]);
    });

    test("should process with concurrency limit", async () => {
      const items = Array.from({ length: 20 }, (_, i) => i);
      const results: number[] = [];
      const concurrency = 3;

      for (let i = 0; i < items.length; i += concurrency) {
        const batch = items.slice(i, i + concurrency);
        const batchResults = await Promise.all(
          batch.map(async (item) => {
            await new Promise((resolve) => setTimeout(resolve, 10));
            return item * 2;
          }),
        );
        results.push(...batchResults);
      }

      expect(results.length).toBe(20);
    });
  });
});

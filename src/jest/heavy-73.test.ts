import {
  fibonacci,
  isPrime,
  getPrimes,
  matrixMultiply,
  generateLargeArray,
  sortLargeArray,
  calculateStatistics,
  DataProcessor,
} from "../heavy-computation";

describe("Heavy Computation Tests - Jest 73", () => {
  describe("Fibonacci", () => {
    test.each([
      [0, 0],
      [1, 1],
      [5, 5],
      [10, 55],
      [15, 610],
      [20, 6765],
    ])("fibonacci(%i) should return %i", (input, expected) => {
      expect(fibonacci(input)).toBe(expected);
    });
  });

  describe("Prime Numbers", () => {
    test.each([
      [2, true],
      [3, true],
      [4, false],
      [17, true],
      [100, false],
      [101, true],
      [997, true],
      [1000, false],
    ])("isPrime(%i) should return %s", (num, expected) => {
      expect(isPrime(num)).toBe(expected);
    });

    test("getPrimes should return all primes up to 100", () => {
      const primes = getPrimes(100);
      expect(primes.length).toBe(25);
      expect(primes[0]).toBe(2);
      expect(primes[primes.length - 1]).toBe(97);
    });

    test("getPrimes should handle large range", () => {
      const primes = getPrimes(1000);
      expect(primes.length).toBe(168);
    });
  });

  describe("Matrix Operations", () => {
    test("should multiply 2x2 matrices", () => {
      const a = [
        [1, 2],
        [3, 4],
      ];
      const b = [
        [5, 6],
        [7, 8],
      ];
      const result = matrixMultiply(a, b);
      expect(result).toEqual([
        [19, 22],
        [43, 50],
      ]);
    });

    test("should multiply 3x3 matrices", () => {
      const a = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ];
      const b = [
        [9, 8, 7],
        [6, 5, 4],
        [3, 2, 1],
      ];
      const result = matrixMultiply(a, b);
      expect(result[0][0]).toBe(30);
      expect(result[2][2]).toBe(90);
    });

    test("should handle larger matrices", () => {
      const size = 10;
      const a = Array(size)
        .fill(0)
        .map((_, i) =>
          Array(size)
            .fill(0)
            .map((_, j) => i + j),
        );
      const b = Array(size)
        .fill(0)
        .map((_, i) =>
          Array(size)
            .fill(0)
            .map((_, j) => i * j),
        );
      const result = matrixMultiply(a, b);
      expect(result.length).toBe(size);
      expect(result[0].length).toBe(size);
    });
  });

  describe("Array Operations", () => {
    test.each([100, 500, 1000, 2000])(
      "should generate array of size %i",
      (size) => {
        const arr = generateLargeArray(size);
        expect(arr.length).toBe(size);
        expect(arr[0]).toBe(0);
        expect(arr[arr.length - 1]).toBe(size - 1);
      },
    );

    test.each([100, 500, 1000])("should sort array of size %i", (size) => {
      const arr = generateLargeArray(size).reverse();
      const sorted = sortLargeArray(arr);
      expect(sorted[0]).toBe(0);
      expect(sorted[sorted.length - 1]).toBe(size - 1);
    });

    test("should calculate statistics correctly", () => {
      const arr = [1, 2, 3, 4, 5];
      const stats = calculateStatistics(arr);
      expect(stats.mean).toBe(3);
      expect(stats.median).toBe(3);
    });

    test("should handle large dataset statistics", () => {
      const arr = generateLargeArray(10000);
      const stats = calculateStatistics(arr);
      expect(stats.mean).toBeGreaterThan(0);
      expect(stats.median).toBeGreaterThan(0);
      expect(stats.stdDev).toBeGreaterThan(0);
    });
  });

  describe("DataProcessor", () => {
    let processor: DataProcessor;

    beforeEach(() => {
      processor = new DataProcessor();
    });

    test("should store and retrieve data", () => {
      processor.setData("key1", "value1");
      expect(processor.getData("key1")).toBe("value1");
    });

    test("should process data", () => {
      processor.setData("num1", 10);
      processor.setData("num2", 20);
      processor.processData((val) => val * 2);
      expect(processor.getData("num1")).toBe(20);
      expect(processor.getData("num2")).toBe(40);
    });

    test("should handle large dataset", () => {
      for (let i = 0; i < 1000; i++) {
        processor.setData(`key${i}`, i);
      }
      processor.processData((val) => val + 1);
      expect(processor.getData("key0")).toBe(1);
      expect(processor.getData("key999")).toBe(1000);
    });

    test("should clear data", () => {
      processor.setData("key1", "value1");
      processor.clear();
      expect(processor.getData("key1")).toBeUndefined();
    });
  });

  describe("Combined Heavy Operations", () => {
    test("should handle multiple heavy operations", () => {
      const fib = fibonacci(15);
      const primes = getPrimes(100);
      const arr = generateLargeArray(500);
      const sorted = sortLargeArray(arr);
      const stats = calculateStatistics(sorted);

      expect(fib).toBe(610);
      expect(primes.length).toBe(25);
      expect(stats.mean).toBeGreaterThan(0);
    });

    test("should process large matrix and array", () => {
      const matrix = Array(20)
        .fill(0)
        .map((_, i) =>
          Array(20)
            .fill(0)
            .map((_, j) => i + j),
        );
      const result = matrixMultiply(matrix, matrix);
      const arr = generateLargeArray(1000);
      const stats = calculateStatistics(arr);

      expect(result.length).toBe(20);
      expect(stats.stdDev).toBeGreaterThan(0);
    });
  });
});

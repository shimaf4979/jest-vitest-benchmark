// 重い計算処理を行うユーティリティ関数

export function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

export function isPrime(num: number): boolean {
  if (num <= 1) return false;
  if (num <= 3) return true;
  if (num % 2 === 0 || num % 3 === 0) return false;

  for (let i = 5; i * i <= num; i += 6) {
    if (num % i === 0 || num % (i + 2) === 0) return false;
  }
  return true;
}

export function getPrimes(max: number): number[] {
  const primes: number[] = [];
  for (let i = 2; i < max; i++) {
    if (isPrime(i)) {
      primes.push(i);
    }
  }
  return primes;
}

export function matrixMultiply(a: number[][], b: number[][]): number[][] {
  const rowsA = a.length;
  const colsA = a[0].length;
  const colsB = b[0].length;

  const result: number[][] = Array(rowsA)
    .fill(0)
    .map(() => Array(colsB).fill(0));

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      for (let k = 0; k < colsA; k++) {
        result[i][j] += a[i][k] * b[k][j];
      }
    }
  }

  return result;
}

export function generateLargeArray(size: number): number[] {
  return Array.from({ length: size }, (_, i) => i);
}

export function sortLargeArray(arr: number[]): number[] {
  return [...arr].sort((a, b) => a - b);
}

export function calculateStatistics(arr: number[]): {
  mean: number;
  median: number;
  stdDev: number;
} {
  const sorted = [...arr].sort((a, b) => a - b);
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const median = sorted[Math.floor(sorted.length / 2)];
  const variance = arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
  const stdDev = Math.sqrt(variance);

  return { mean, median, stdDev };
}

export class DataProcessor {
  private data: Map<string, any> = new Map();

  setData(key: string, value: any): void {
    this.data.set(key, value);
  }

  getData(key: string): any {
    return this.data.get(key);
  }

  processData(fn: (value: any) => any): void {
    for (const [key, value] of this.data.entries()) {
      this.data.set(key, fn(value));
    }
  }

  clear(): void {
    this.data.clear();
  }
}

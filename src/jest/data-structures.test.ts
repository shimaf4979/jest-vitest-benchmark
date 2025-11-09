describe("Data Structures Tests - Jest", () => {
  describe("Array Operations", () => {
    test("should map array", () => {
      const numbers = [1, 2, 3, 4, 5];
      const doubled = numbers.map((n) => n * 2);
      expect(doubled).toEqual([2, 4, 6, 8, 10]);
    });

    test("should filter array", () => {
      const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const evens = numbers.filter((n) => n % 2 === 0);
      expect(evens).toEqual([2, 4, 6, 8, 10]);
    });

    test("should reduce array", () => {
      const numbers = [1, 2, 3, 4, 5];
      const sum = numbers.reduce((acc, n) => acc + n, 0);
      expect(sum).toBe(15);
    });

    test("should find element", () => {
      const numbers = [1, 2, 3, 4, 5];
      const found = numbers.find((n) => n > 3);
      expect(found).toBe(4);
    });

    test("should flatten nested arrays", () => {
      const nested = [[1, 2], [3, 4], [5, 6]];
      const flat = nested.flat();
      expect(flat).toEqual([1, 2, 3, 4, 5, 6]);
    });

    test("should chunk array", () => {
      const chunk = <T>(arr: T[], size: number): T[][] => {
        const result: T[][] = [];
        for (let i = 0; i < arr.length; i += size) {
          result.push(arr.slice(i, i + size));
        }
        return result;
      };
      const numbers = [1, 2, 3, 4, 5, 6, 7, 8];
      expect(chunk(numbers, 3)).toEqual([[1, 2, 3], [4, 5, 6], [7, 8]]);
    });
  });

  describe("Set Operations", () => {
    test("should create set from array", () => {
      const numbers = [1, 2, 2, 3, 3, 3, 4, 5];
      const unique = new Set(numbers);
      expect(unique.size).toBe(5);
      expect([...unique]).toEqual([1, 2, 3, 4, 5]);
    });

    test("should perform set union", () => {
      const set1 = new Set([1, 2, 3]);
      const set2 = new Set([3, 4, 5]);
      const union = new Set([...set1, ...set2]);
      expect([...union].sort()).toEqual([1, 2, 3, 4, 5]);
    });

    test("should perform set intersection", () => {
      const set1 = new Set([1, 2, 3, 4]);
      const set2 = new Set([3, 4, 5, 6]);
      const intersection = new Set([...set1].filter((x) => set2.has(x)));
      expect([...intersection]).toEqual([3, 4]);
    });

    test("should perform set difference", () => {
      const set1 = new Set([1, 2, 3, 4]);
      const set2 = new Set([3, 4, 5, 6]);
      const difference = new Set([...set1].filter((x) => !set2.has(x)));
      expect([...difference]).toEqual([1, 2]);
    });
  });

  describe("Map Operations", () => {
    test("should create and use map", () => {
      const map = new Map<string, number>();
      map.set("one", 1);
      map.set("two", 2);
      expect(map.get("one")).toBe(1);
      expect(map.size).toBe(2);
    });

    test("should iterate over map", () => {
      const map = new Map([
        ["a", 1],
        ["b", 2],
        ["c", 3],
      ]);
      const keys = [...map.keys()];
      const values = [...map.values()];
      expect(keys).toEqual(["a", "b", "c"]);
      expect(values).toEqual([1, 2, 3]);
    });

    test("should use map for counting", () => {
      const words = ["apple", "banana", "apple", "cherry", "banana", "apple"];
      const count = new Map<string, number>();
      for (const word of words) {
        count.set(word, (count.get(word) || 0) + 1);
      }
      expect(count.get("apple")).toBe(3);
      expect(count.get("banana")).toBe(2);
      expect(count.get("cherry")).toBe(1);
    });
  });

  describe("Stack Operations", () => {
    class Stack<T> {
      private items: T[] = [];

      push(item: T) {
        this.items.push(item);
      }

      pop(): T | undefined {
        return this.items.pop();
      }

      peek(): T | undefined {
        return this.items[this.items.length - 1];
      }

      isEmpty(): boolean {
        return this.items.length === 0;
      }

      size(): number {
        return this.items.length;
      }
    }

    test("should perform stack operations", () => {
      const stack = new Stack<number>();
      stack.push(1);
      stack.push(2);
      stack.push(3);
      expect(stack.size()).toBe(3);
      expect(stack.peek()).toBe(3);
      expect(stack.pop()).toBe(3);
      expect(stack.size()).toBe(2);
    });

    test("should check balanced parentheses", () => {
      const isBalanced = (str: string): boolean => {
        const stack: string[] = [];
        const pairs: Record<string, string> = { ")": "(", "]": "[", "}": "{" };

        for (const char of str) {
          if (["(", "[", "{"].includes(char)) {
            stack.push(char);
          } else if ([")", "]", "}"].includes(char)) {
            if (stack.pop() !== pairs[char]) return false;
          }
        }
        return stack.length === 0;
      };

      expect(isBalanced("()")).toBe(true);
      expect(isBalanced("([])")).toBe(true);
      expect(isBalanced("({[]})")).toBe(true);
      expect(isBalanced("(]")).toBe(false);
      expect(isBalanced("((()")).toBe(false);
    });
  });

  describe("Queue Operations", () => {
    class Queue<T> {
      private items: T[] = [];

      enqueue(item: T) {
        this.items.push(item);
      }

      dequeue(): T | undefined {
        return this.items.shift();
      }

      front(): T | undefined {
        return this.items[0];
      }

      isEmpty(): boolean {
        return this.items.length === 0;
      }

      size(): number {
        return this.items.length;
      }
    }

    test("should perform queue operations", () => {
      const queue = new Queue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.size()).toBe(3);
      expect(queue.front()).toBe(1);
      expect(queue.dequeue()).toBe(1);
      expect(queue.size()).toBe(2);
    });

    test("should process queue in order", () => {
      const queue = new Queue<string>();
      queue.enqueue("first");
      queue.enqueue("second");
      queue.enqueue("third");

      const results: string[] = [];
      while (!queue.isEmpty()) {
        const item = queue.dequeue();
        if (item) results.push(item);
      }

      expect(results).toEqual(["first", "second", "third"]);
    });
  });

  describe("Object Operations", () => {
    test("should merge objects", () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { b: 3, c: 4 };
      const merged = { ...obj1, ...obj2 };
      expect(merged).toEqual({ a: 1, b: 3, c: 4 });
    });

    test("should deep clone object", () => {
      const original = { a: 1, b: { c: 2 } };
      const cloned = JSON.parse(JSON.stringify(original));
      cloned.b.c = 3;
      expect(original.b.c).toBe(2);
      expect(cloned.b.c).toBe(3);
    });

    test("should get object keys and values", () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(Object.keys(obj)).toEqual(["a", "b", "c"]);
      expect(Object.values(obj)).toEqual([1, 2, 3]);
      expect(Object.entries(obj)).toEqual([["a", 1], ["b", 2], ["c", 3]]);
    });
  });
});

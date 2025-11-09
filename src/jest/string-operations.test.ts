describe("String Operations Tests - Jest", () => {
  describe("String Manipulation", () => {
    test.each([
      ["hello", "HELLO"],
      ["world", "WORLD"],
      ["TypeScript", "TYPESCRIPT"],
      ["jest", "JEST"],
    ])("should uppercase %s to %s", (input, expected) => {
      expect(input.toUpperCase()).toBe(expected);
    });

    test.each([
      ["HELLO", "hello"],
      ["WORLD", "world"],
      ["TYPESCRIPT", "typescript"],
      ["JEST", "jest"],
    ])("should lowercase %s to %s", (input, expected) => {
      expect(input.toLowerCase()).toBe(expected);
    });

    test("should reverse string", () => {
      const reverse = (str: string) => str.split("").reverse().join("");
      expect(reverse("hello")).toBe("olleh");
      expect(reverse("world")).toBe("dlrow");
    });

    test("should check palindrome", () => {
      const isPalindrome = (str: string) => {
        const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, "");
        return cleaned === cleaned.split("").reverse().join("");
      };
      expect(isPalindrome("racecar")).toBe(true);
      expect(isPalindrome("hello")).toBe(false);
      expect(isPalindrome("A man a plan a canal Panama")).toBe(true);
    });
  });

  describe("String Search", () => {
    const text = "The quick brown fox jumps over the lazy dog";

    test("should find substring", () => {
      expect(text.includes("quick")).toBe(true);
      expect(text.includes("slow")).toBe(false);
    });

    test("should find index of substring", () => {
      expect(text.indexOf("fox")).toBe(16);
      expect(text.indexOf("cat")).toBe(-1);
    });

    test("should match regex", () => {
      expect(text.match(/\w+/g)?.length).toBe(9);
      expect(text.match(/[aeiou]/gi)?.length).toBe(11);
    });
  });

  describe("String Generation", () => {
    test("should generate repeated string", () => {
      expect("a".repeat(5)).toBe("aaaaa");
      expect("ab".repeat(3)).toBe("ababab");
    });

    test("should pad string", () => {
      expect("5".padStart(3, "0")).toBe("005");
      expect("hello".padEnd(10, "!")).toBe("hello!!!!!");
    });

    test("should generate random string", () => {
      const generateRandomString = (length: number) => {
        return Array.from({ length }, () =>
          String.fromCharCode(97 + Math.floor(Math.random() * 26)),
        ).join("");
      };
      const str = generateRandomString(10);
      expect(str.length).toBe(10);
      expect(/^[a-z]+$/.test(str)).toBe(true);
    });
  });

  describe("String Parsing", () => {
    test("should split CSV", () => {
      const csv = "name,age,city";
      expect(csv.split(",")).toEqual(["name", "age", "city"]);
    });

    test("should parse JSON string", () => {
      const json = '{"name":"John","age":30}';
      const obj = JSON.parse(json);
      expect(obj.name).toBe("John");
      expect(obj.age).toBe(30);
    });

    test("should extract numbers from string", () => {
      const text = "The price is $123.45 and tax is $12.34";
      const numbers = text.match(/\d+\.\d+/g)?.map(Number);
      expect(numbers).toEqual([123.45, 12.34]);
    });
  });

  describe("String Encoding", () => {
    test("should encode URI component", () => {
      const url = "hello world";
      expect(encodeURIComponent(url)).toBe("hello%20world");
    });

    test("should convert to base64", () => {
      const text = "hello";
      const base64 = Buffer.from(text).toString("base64");
      expect(base64).toBe("aGVsbG8=");
    });

    test("should count character occurrences", () => {
      const countChars = (str: string) => {
        const count: Record<string, number> = {};
        for (const char of str) {
          count[char] = (count[char] || 0) + 1;
        }
        return count;
      };
      const result = countChars("hello");
      expect(result.h).toBe(1);
      expect(result.l).toBe(2);
    });
  });
});

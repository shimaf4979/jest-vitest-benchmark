#!/bin/bash

# テストファイルを増やして並列化の効果を確認するスクリプト

COUNT=${1:-20}

echo "Generating $COUNT test files..."

cd "$(dirname "$0")/.."

# Vitest用のテストを複製
for i in $(seq 8 $COUNT); do
  cp src/vitest/heavy.test.ts "src/vitest/heavy-$i.test.ts"
  sed -i.bak "s/Heavy Computation Tests - Vitest/Heavy Computation Tests - Vitest $i/g" "src/vitest/heavy-$i.test.ts"
  rm "src/vitest/heavy-$i.test.ts.bak" 2>/dev/null || true
done

# Jest用のテストを複製
for i in $(seq 8 $COUNT); do
  cp src/jest/heavy.test.ts "src/jest/heavy-$i.test.ts"
  sed -i.bak "s/Heavy Computation Tests - Jest/Heavy Computation Tests - Jest $i/g" "src/jest/heavy-$i.test.ts"
  rm "src/jest/heavy-$i.test.ts.bak" 2>/dev/null || true
done

echo "Generated $(($COUNT - 7)) additional test files for each runner"
echo "Total test files: $COUNT per runner"
echo ""
echo "Run benchmark with: pnpm run benchmark"

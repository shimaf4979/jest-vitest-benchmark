#!/bin/bash

# 生成したテストファイルを削除するスクリプト

echo "Cleaning up generated test files..."

cd "$(dirname "$0")/.."

# Vitest用の生成ファイルを削除
rm -f src/vitest/heavy-*.test.ts

# Jest用の生成ファイルを削除
rm -f src/jest/heavy-*.test.ts

echo "Cleanup complete. Original test files remain."
echo "Test files per runner: 7 (original)"

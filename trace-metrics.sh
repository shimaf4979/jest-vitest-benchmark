#!/bin/bash

# メトリクスのトレーシングスクリプト
# setup, environment に何が影響しているか詳細に調査

set -e

echo "=========================================="
echo "Vitest メトリクス トレーシング"
echo "=========================================="
echo ""

# 1. 少ないファイル数でテスト (10ファイル)
echo "【1】ファイル数: 10での比較"
echo "=========================================="
./scripts/cleanup-tests.sh
./scripts/generate-more-tests.sh 10

echo ""
echo "--- isolate: false ---"
npx vitest run --config vitest.config.fastest.ts --no-cache 2>&1 | grep -E "(Duration|Test Files|Tests)"

echo ""
echo "--- isolate: true (single) ---"
npx vitest run --config vitest.config.isolate-single.ts --no-cache 2>&1 | grep -E "(Duration|Test Files|Tests)"

echo ""
echo ""

# 2. 中程度のファイル数でテスト (50ファイル)
echo "【2】ファイル数: 50での比較"
echo "=========================================="
./scripts/cleanup-tests.sh
./scripts/generate-more-tests.sh 50

echo ""
echo "--- isolate: false ---"
npx vitest run --config vitest.config.fastest.ts --no-cache 2>&1 | grep -E "(Duration|Test Files|Tests)"

echo ""
echo "--- isolate: true (single) ---"
npx vitest run --config vitest.config.isolate-single.ts --no-cache 2>&1 | grep -E "(Duration|Test Files|Tests)"

echo ""
echo ""

# 3. 多いファイル数でテスト (100ファイル)
echo "【3】ファイル数: 100での比較"
echo "=========================================="
./scripts/cleanup-tests.sh
./scripts/generate-more-tests.sh 100

echo ""
echo "--- isolate: false ---"
npx vitest run --config vitest.config.fastest.ts --no-cache 2>&1 | grep -E "(Duration|Test Files|Tests)"

echo ""
echo "--- isolate: true (single) ---"
npx vitest run --config vitest.config.isolate-single.ts --no-cache 2>&1 | grep -E "(Duration|Test Files|Tests)"

echo ""
echo ""
echo "=========================================="
echo "分析結果"
echo "=========================================="
echo ""
echo "setup時間の増加率を観察してください:"
echo ""
echo "isolate: false の場合:"
echo "  → setup時間はファイル数に依らずほぼ一定"
echo "  → 環境を1回だけセットアップ"
echo ""
echo "isolate: true の場合:"
echo "  → setup時間はファイル数に比例して増加"
echo "  → 各ファイルごとに環境をセットアップ"
echo ""
echo "environment時間:"
echo "  → jsdom操作の累積時間"
echo "  → ファイル数に比例して増加（どちらの設定でも）"
echo ""

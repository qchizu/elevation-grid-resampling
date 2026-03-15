#!/bin/bash
# 全処理を一括実行するスクリプト
set -eu

SCRIPT_DIR="$(dirname "$0")"

echo "========================================"
echo "  標高グリッドリサンプリング比較 - 全処理"
echo "========================================"

bash "$SCRIPT_DIR/01_merge.sh"
bash "$SCRIPT_DIR/02_resample.sh"
bash "$SCRIPT_DIR/03_slope.sh"
bash "$SCRIPT_DIR/04_colorize.sh"
bash "$SCRIPT_DIR/05_tiles.sh"
python3 "$SCRIPT_DIR/06_profile.py"

echo ""
echo "========================================"
echo "  全処理完了！"
echo "  確認方法:"
echo "    python3 -m http.server 8080 --directory docs/"
echo "    ブラウザで http://localhost:8080 を開く"
echo "========================================"

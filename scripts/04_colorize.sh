#!/bin/bash
# ステップ4: 傾斜量に色彩を適用（カラーレリーフ）
set -eu

SCRIPT_DIR="$(dirname "$0")"
OUT_DIR="$SCRIPT_DIR/../data"
COLOR_TABLE="$SCRIPT_DIR/../color_slope.txt"

echo "=== ステップ4: カラーリリーフ適用 ==="

gdaldem color-relief \
    "$OUT_DIR/slope_near.tif" \
    "$COLOR_TABLE" \
    "$OUT_DIR/colored_near.tif" \
    -alpha \
    -co COMPRESS=DEFLATE \
    -co TILED=YES
echo "  完了: colored_near.tif"

gdaldem color-relief \
    "$OUT_DIR/slope_bilinear.tif" \
    "$COLOR_TABLE" \
    "$OUT_DIR/colored_bilinear.tif" \
    -alpha \
    -co COMPRESS=DEFLATE \
    -co TILED=YES
echo "  完了: colored_bilinear.tif"

echo "=== カラーリリーフ適用完了 ==="

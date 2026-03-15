#!/bin/bash
# ステップ3: gdaldem slopeで傾斜量図を生成（百分率）
set -eu

OUT_DIR="$(dirname "$0")/../data"

echo "=== ステップ3: 傾斜量図生成 ==="

gdaldem slope \
    "$OUT_DIR/dem_near.tif" \
    "$OUT_DIR/slope_near.tif" \
    -p \
    -co COMPRESS=DEFLATE \
    -co TILED=YES
echo "  完了: slope_near.tif"

gdaldem slope \
    "$OUT_DIR/dem_bilinear.tif" \
    "$OUT_DIR/slope_bilinear.tif" \
    -p \
    -co COMPRESS=DEFLATE \
    -co TILED=YES
echo "  完了: slope_bilinear.tif"

echo "=== 傾斜量図生成完了 ==="

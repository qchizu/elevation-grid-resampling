#!/bin/bash
# ステップ1: 4タイルを結合してVRTを作成
set -eu

DATA_DIR="/mnt/e/mapdata/03_dem/59_rinya/noto_2024/0pt5_01/01_tif"
OUT_DIR="$(dirname "$0")/../data"

mkdir -p "$OUT_DIR"

echo "=== ステップ1: タイル結合 ==="
gdalbuildvrt \
    "$OUT_DIR/merged.vrt" \
    "$DATA_DIR/07ed58.tif" \
    "$DATA_DIR/07ed59.tif" \
    "$DATA_DIR/07ed68.tif" \
    "$DATA_DIR/07ed69.tif"

echo "完了: $OUT_DIR/merged.vrt"
gdalinfo "$OUT_DIR/merged.vrt" | grep -E "Size|Pixel Size|Corner"

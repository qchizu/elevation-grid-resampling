#!/bin/bash
# ステップ2: nearest/bilinearで経緯度系に変換（1mメッシュ相当）
# ターゲット: JGD2011 geographic (EPSG:6668)、解像度 0.000009° ≈ 1m
set -eu

OUT_DIR="$(dirname "$0")/../data"

echo "=== ステップ2: リサンプリング（経緯度変換） ==="

# nearestリサンプリング
echo "  nearest リサンプリング..."
gdalwarp \
    -t_srs EPSG:6668 \
    -tr 0.000009 0.000009 \
    -r near \
    -co COMPRESS=DEFLATE \
    -co TILED=YES \
    "$OUT_DIR/merged.vrt" \
    "$OUT_DIR/dem_near.tif"
echo "  完了: dem_near.tif"

# bilinearリサンプリング
echo "  bilinear リサンプリング..."
gdalwarp \
    -t_srs EPSG:6668 \
    -tr 0.000009 0.000009 \
    -r bilinear \
    -co COMPRESS=DEFLATE \
    -co TILED=YES \
    "$OUT_DIR/merged.vrt" \
    "$OUT_DIR/dem_bilinear.tif"
echo "  完了: dem_bilinear.tif"

echo "=== リサンプリング完了 ==="

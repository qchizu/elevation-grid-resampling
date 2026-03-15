#!/bin/bash
# ステップ2: nearest/bilinearで経緯度系に変換（1mメッシュ相当）
# ターゲット: JGD2011 geographic (EPSG:6668)、解像度 0.04秒 = 1/90000° ≈ 1m（基盤地図情報1mDEM相当）
set -eu

OUT_DIR="$(dirname "$0")/../data"

# 0.04秒 = 0.04/3600° = 1/90000°
RESOLUTION="0.00001111111111"

echo "=== ステップ2: リサンプリング（経緯度変換）==="
echo "  解像度: ${RESOLUTION}° (= 0.04秒角 ≈ 基盤地図情報1mDEM相当)"

# nearestリサンプリング
echo "  nearest リサンプリング..."
gdalwarp \
    -t_srs EPSG:6668 \
    -tr ${RESOLUTION} ${RESOLUTION} \
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
    -tr ${RESOLUTION} ${RESOLUTION} \
    -r bilinear \
    -co COMPRESS=DEFLATE \
    -co TILED=YES \
    "$OUT_DIR/merged.vrt" \
    "$OUT_DIR/dem_bilinear.tif"
echo "  完了: dem_bilinear.tif"

echo "=== リサンプリング完了 ==="

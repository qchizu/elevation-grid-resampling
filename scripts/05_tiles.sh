#!/bin/bash
# ステップ5: gdal2tilesでPNGタイルを生成（zoom 13-17、XYZ形式）
set -eu

SCRIPT_DIR="$(dirname "$0")"
OUT_DIR="$SCRIPT_DIR/../data"
TILES_DIR="$SCRIPT_DIR/../docs/tiles"

echo "=== ステップ5: PNGタイル生成 ==="

mkdir -p "$TILES_DIR/near" "$TILES_DIR/bilinear"

echo "  near タイル生成中（zoom 13-17）..."
gdal2tiles.py \
    -z 13-17 \
    -w none \
    --xyz \
    --processes=4 \
    "$OUT_DIR/colored_near.tif" \
    "$TILES_DIR/near/"
echo "  完了: docs/tiles/near/"

echo "  bilinear タイル生成中（zoom 13-17）..."
gdal2tiles.py \
    -z 13-17 \
    -w none \
    --xyz \
    --processes=4 \
    "$OUT_DIR/colored_bilinear.tif" \
    "$TILES_DIR/bilinear/"
echo "  完了: docs/tiles/bilinear/"

# タイル数の確認
NEAR_COUNT=$(find "$TILES_DIR/near" -name "*.png" | wc -l)
BILINEAR_COUNT=$(find "$TILES_DIR/bilinear" -name "*.png" | wc -l)
echo "=== タイル生成完了: near=${NEAR_COUNT}枚, bilinear=${BILINEAR_COUNT}枚 ==="

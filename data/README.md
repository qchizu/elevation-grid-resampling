# データディレクトリ

このディレクトリは処理中間ファイルの出力先です。`.gitignore` により Git 管理対象外です。

## 使用データ

- **林野庁 LiDAR 0.5mメッシュDEM**（能登半島 2024年）
- ソース: `/mnt/e/mapdata/03_dem/59_rinya/noto_2024/0pt5_01/01_tif/`
- 使用タイル: `07ed58.tif`, `07ed59.tif`, `07ed68.tif`, `07ed69.tif`
- 座標系: JGD2011 / Japan Plane Rectangular CS VII（EPSG:6675）
- 解像度: 0.5m × 0.5m

## 生成ファイル

`scripts/run_all.sh` を実行すると以下のファイルが生成されます。

| ファイル名 | 説明 |
|-----------|------|
| `merged.vrt` | 4タイルを結合した VRT ファイル |
| `dem_near.tif` | nearest リサンプリングで経緯度変換した DEM |
| `dem_bilinear.tif` | bilinear リサンプリングで経緯度変換した DEM |
| `slope_near.tif` | nearest DEM から生成した傾斜量図（%） |
| `slope_bilinear.tif` | bilinear DEM から生成した傾斜量図（%） |
| `colored_near.tif` | カラーリリーフ適用済み傾斜量図（nearest） |
| `colored_bilinear.tif` | カラーリリーフ適用済み傾斜量図（bilinear） |

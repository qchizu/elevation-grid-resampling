# 標高グリッド リサンプリング比較

**nearest（最近傍）vs bilinear（双線形）— 傾斜量図のアーティファクト検証**

[GitHub Pages で確認する](https://qchizu.github.io/elevation-grid-resampling/)

---

## 背景

基盤地図情報の標高グリッドデータは、平面直角座標系（JGD2011 / EPSG:6675）から
経緯度系（JGD2011 geographic, EPSG:6668）への変換時に **nearest（最近傍）リサンプリング**
を使用しているという仮説があります。この処理により、傾斜量図にグリッド状の
不自然なアーティファクトが生じます。

本リポジトリでは林野庁の0.5mメッシュLiDAR DEM（能登半島 2024年）を使い、
nearest と bilinear の2種類のリサンプリングを比較し、bilinear が傾斜量図の品質を
改善することを実証します。

---

## 使用データ

- **林野庁 LiDAR 0.5mメッシュDEM**（能登半島 2024年）
- タイル: `07ed58`, `07ed59`, `07ed68`, `07ed69`
- 座標系: JGD2011 / Japan Plane Rectangular CS VII（EPSG:6675）
- 解像度: 0.5m × 0.5m

---

## ディレクトリ構成

```
elevation-grid-resampling/
├── scripts/
│   ├── 01_merge.sh         # 4タイルを結合してVRTを作成
│   ├── 02_resample.sh      # nearest/bilinearで経緯度系に変換
│   ├── 03_slope.sh         # gdaldem slopeで傾斜量図を生成
│   ├── 04_colorize.sh      # 傾斜量に色彩を適用
│   ├── 05_tiles.sh         # gdal2tilesでPNGタイルを生成（zoom 13-17）
│   ├── 06_profile.py       # 断面図データをJSONとして出力
│   └── run_all.sh          # 全処理を一括実行
├── docs/                   # GitHub Pages
│   ├── index.html
│   ├── style.css
│   ├── map.js
│   ├── profile.js
│   ├── profile_data.json   # 断面図データ（スクリプト生成）
│   └── tiles/
│       ├── near/           # nearestリサンプリング傾斜量タイル
│       └── bilinear/       # bilinearリサンプリング傾斜量タイル
├── data/
│   └── README.md           # データ配置方法の説明
├── color_slope.txt         # 傾斜量のカラーテーブル
└── README.md
```

---

## セットアップと実行

### 前提条件

- GDAL（`gdalbuildvrt`, `gdalwarp`, `gdaldem`, `gdal2tiles.py`）
- Python 3 + GDAL Python バインディング

### 処理パイプライン実行

```bash
# データソースのパスを scripts/01_merge.sh で確認・修正してから実行
bash scripts/run_all.sh
```

### ローカル確認

```bash
python3 -m http.server 8080 --directory docs/
# ブラウザで http://localhost:8080 を開く
```

---

## 処理パイプライン

| ステップ | スクリプト | 処理内容 |
|---------|-----------|---------|
| 1 | `01_merge.sh` | 4タイル結合（VRT作成） |
| 2 | `02_resample.sh` | 経緯度変換（nearest / bilinear） |
| 3 | `03_slope.sh` | 傾斜量図生成（百分率） |
| 4 | `04_colorize.sh` | カラーリリーフ適用 |
| 5 | `05_tiles.sh` | PNGタイル生成（zoom 13-17） |
| 6 | `06_profile.py` | 断面図データ生成（JSON） |

---

## ライセンス

- コード: MIT
- 林野庁 LiDAR データ: [林野庁の利用規約](https://www.rinya.maff.go.jp/)に従う

#!/usr/bin/env python3
"""
断面図データ生成スクリプト
4タイルエリアを横断する断面線から標高プロファイルを抽出し、JSONで出力する
"""

import json
import math
import os
import sys

try:
    from osgeo import gdal, osr
except ImportError:
    print("エラー: GDAL Pythonバインディングが必要です（pip install gdal）", file=sys.stderr)
    sys.exit(1)

# スクリプトディレクトリ基準のパス
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(SCRIPT_DIR, "..", "data")
DOCS_DIR = os.path.join(SCRIPT_DIR, "..", "docs")

# 断面線の定義（エリアを東西方向に横断）
# エリア: 137.067°〜137.167°E, 37.433°〜37.483°N
PROFILE_LINE = {
    "start": [137.075, 37.458],  # 西端（経度, 緯度）
    "end":   [137.158, 37.458],  # 東端
    "n_points": 500              # サンプル点数
}


def haversine_distance(lon1, lat1, lon2, lat2):
    """2点間の地表面距離をメートルで計算（Haversine公式）"""
    R = 6371000  # 地球半径（m）
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


def sample_dem(tif_path, lons, lats):
    """DEMファイルから指定座標の標高値をサンプリング"""
    ds = gdal.Open(tif_path)
    if ds is None:
        raise FileNotFoundError(f"ファイルが開けません: {tif_path}")

    gt = ds.GetGeoTransform()
    band = ds.GetRasterBand(1)
    nodata = band.GetNoDataValue()

    elevations = []
    for lon, lat in zip(lons, lats):
        # 地理座標 → ピクセル座標
        px = int((lon - gt[0]) / gt[1])
        py = int((lat - gt[3]) / gt[5])

        # 範囲外チェック
        if px < 0 or py < 0 or px >= ds.RasterXSize or py >= ds.RasterYSize:
            elevations.append(None)
            continue

        data = band.ReadAsArray(px, py, 1, 1)
        val = float(data[0][0])
        if nodata is not None and val == nodata:
            elevations.append(None)
        else:
            elevations.append(round(val, 2))

    ds = None
    return elevations


def generate_profile():
    """断面図データを生成してJSONに書き出す"""
    start_lon, start_lat = PROFILE_LINE["start"]
    end_lon, end_lat = PROFILE_LINE["end"]
    n = PROFILE_LINE["n_points"]

    # サンプル点の座標を生成
    lons = [start_lon + (end_lon - start_lon) * i / (n - 1) for i in range(n)]
    lats = [start_lat + (end_lat - start_lat) * i / (n - 1) for i in range(n)]

    # 距離軸（m）を計算
    total_dist = haversine_distance(start_lon, start_lat, end_lon, end_lat)
    distances = [round(total_dist * i / (n - 1), 1) for i in range(n)]

    # DEMから標高をサンプリング
    near_path = os.path.join(DATA_DIR, "dem_near.tif")
    bilinear_path = os.path.join(DATA_DIR, "dem_bilinear.tif")

    print(f"  near DEM からサンプリング中: {near_path}")
    elev_near = sample_dem(near_path, lons, lats)

    print(f"  bilinear DEM からサンプリング中: {bilinear_path}")
    elev_bilinear = sample_dem(bilinear_path, lons, lats)

    # 断面線の地理座標（地図表示用）
    profile_coords = [[lon, lat] for lon, lat in zip(lons, lats)]

    # JSON出力
    output = {
        "profile_line": {
            "start": PROFILE_LINE["start"],
            "end": PROFILE_LINE["end"],
            "coordinates": [PROFILE_LINE["start"], PROFILE_LINE["end"]]
        },
        "distances": distances,
        "elevations": {
            "near": elev_near,
            "bilinear": elev_bilinear
        },
        "total_distance_m": round(total_dist, 1)
    }

    out_path = os.path.join(DOCS_DIR, "profile_data.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, separators=(",", ":"))

    print(f"  完了: {out_path}")
    print(f"  断面長: {total_dist:.0f}m、サンプル点: {n}点")


if __name__ == "__main__":
    print("=== ステップ6: 断面図データ生成 ===")
    generate_profile()
    print("=== 断面図データ生成完了 ===")

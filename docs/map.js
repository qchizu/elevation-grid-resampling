/**
 * 比較マップの初期化（MapLibre GL JS + maplibre-gl-compare）
 *
 * 左: nearest リサンプリングの傾斜量タイル
 * 右: bilinear リサンプリングの傾斜量タイル
 */

// 対象エリアの中心座標と初期ズーム
const CENTER = [137.113, 37.457];
const INITIAL_ZOOM = 14;

// OSM タイルURL
const OSM_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

// タイル URL（GitHub Pages 相対パス）
const TILE_BASE = location.pathname.replace(/\/$/, "").replace(/\/index\.html$/, "");
const NEAR_TILE_URL = `${TILE_BASE}/tiles/near/{z}/{x}/{y}.png`;
const BILINEAR_TILE_URL = `${TILE_BASE}/tiles/bilinear/{z}/{x}/{y}.png`;

// タイルの有効範囲（4タイルエリア）
const TILE_BOUNDS = [137.067, 37.433, 137.167, 37.483];

/**
 * 共通のマップスタイルを生成する
 * @param {string} slopeTileUrl - 傾斜量タイルのURL
 * @returns {object} MapLibre スタイルオブジェクト
 */
function createMapStyle(slopeTileUrl) {
  return {
    version: 8,
    sources: {
      osm: {
        type: "raster",
        tiles: [OSM_TILE_URL],
        tileSize: 256,
        attribution: "© <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
        maxzoom: 19
      },
      slope: {
        type: "raster",
        tiles: [slopeTileUrl],
        tileSize: 256,
        bounds: TILE_BOUNDS,
        minzoom: 13,
        maxzoom: 17
      }
    },
    layers: [
      {
        id: "osm-layer",
        type: "raster",
        source: "osm",
        paint: { "raster-opacity": 1.0 }
      },
      {
        id: "slope-layer",
        type: "raster",
        source: "slope",
        paint: { "raster-opacity": 0.75 }
      }
    ]
  };
}

// ---- マップ初期化 ----
const mapBefore = new maplibregl.Map({
  container: "map-before",
  style: createMapStyle(NEAR_TILE_URL),
  center: CENTER,
  zoom: INITIAL_ZOOM,
  attributionControl: false
});

const mapAfter = new maplibregl.Map({
  container: "map-after",
  style: createMapStyle(BILINEAR_TILE_URL),
  center: CENTER,
  zoom: INITIAL_ZOOM,
  attributionControl: false
});

// ナビゲーションコントロール（右上）
mapBefore.addControl(new maplibregl.NavigationControl(), "top-right");

// 帰属表示（右下）
mapAfter.addControl(
  new maplibregl.AttributionControl({ compact: true }),
  "bottom-right"
);

// Compare スライダー初期化
const compare = new maplibregl.Compare(
  mapBefore,
  mapAfter,
  "#comparison-container",
  { mousemove: false }
);

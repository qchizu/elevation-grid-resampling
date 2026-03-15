/**
 * 断面図の描画（Chart.js）
 *
 * profile_data.json を読み込み、nearest と bilinear の
 * 標高プロファイルを重ねて表示する。
 * 地図の表示範囲（経度）を断面図上にハイライト表示する。
 */

(async function () {
  const statusEl = document.getElementById("profile-status");

  try {
    // データ読み込み
    const basePath = location.pathname.replace(/\/$/, "").replace(/\/index\.html$/, "");
    const res = await fetch(`${basePath}/profile_data.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    statusEl.style.display = "none";

    const distances = data.distances;
    const nearElev = data.elevations.near;
    const bilinearElev = data.elevations.bilinear;
    const startLon = data.profile_line.start[0];
    const endLon   = data.profile_line.end[0];
    const totalDist = data.total_distance_m;

    // 経度 → 断面距離（m）の変換
    function lonToDistance(lon) {
      return (lon - startLon) / (endLon - startLon) * totalDist;
    }

    // null を含む点はスキップしてデータセット作成
    const nearPoints = distances.map((d, i) =>
      nearElev[i] !== null ? { x: d, y: nearElev[i] } : null
    ).filter(Boolean);

    const bilinearPoints = distances.map((d, i) =>
      bilinearElev[i] !== null ? { x: d, y: bilinearElev[i] } : null
    ).filter(Boolean);

    // 地図表示範囲を断面図に描画するカスタムプラグイン
    const mapViewRangePlugin = {
      id: "mapViewRange",
      // 現在の表示範囲（断面距離）
      _xMin: null,
      _xMax: null,

      beforeDraw(chart) {
        if (this._xMin === null || this._xMax === null) return;
        const { ctx, chartArea, scales } = chart;
        const xScale = scales.x;
        const left  = Math.max(xScale.getPixelForValue(this._xMin), chartArea.left);
        const right = Math.min(xScale.getPixelForValue(this._xMax), chartArea.right);
        if (right <= left) return;

        ctx.save();
        // 薄い青でハイライト
        ctx.fillStyle = "rgba(80, 130, 220, 0.12)";
        ctx.fillRect(left, chartArea.top, right - left, chartArea.height);
        // 境界線
        ctx.strokeStyle = "rgba(80, 130, 220, 0.5)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(left, chartArea.top);
        ctx.lineTo(left, chartArea.bottom);
        ctx.moveTo(right, chartArea.top);
        ctx.lineTo(right, chartArea.bottom);
        ctx.stroke();
        ctx.restore();
      }
    };

    // Chart.js で描画
    const ctx = document.getElementById("profile-chart").getContext("2d");
    const chart = new Chart(ctx, {
      type: "line",
      plugins: [mapViewRangePlugin],
      data: {
        datasets: [
          {
            label: "nearest（最近傍）",
            data: nearPoints,
            borderColor: "rgba(220, 50, 50, 0.85)",
            backgroundColor: "rgba(220, 50, 50, 0.08)",
            borderWidth: 1.5,
            pointRadius: 0,
            tension: 0,
            fill: false
          },
          {
            label: "bilinear（双線形）",
            data: bilinearPoints,
            borderColor: "rgba(30, 100, 220, 0.85)",
            backgroundColor: "rgba(30, 100, 220, 0.08)",
            borderWidth: 1.5,
            pointRadius: 0,
            tension: 0,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false
        },
        plugins: {
          legend: {
            position: "top",
            labels: {
              font: { size: 13 },
              usePointStyle: true
            }
          },
          tooltip: {
            callbacks: {
              title: (items) => `距離: ${items[0].parsed.x.toFixed(0)} m`,
              label: (item) => `${item.dataset.label}: ${item.parsed.y.toFixed(1)} m`
            }
          }
        },
        scales: {
          x: {
            type: "linear",
            title: {
              display: true,
              text: "距離（m）",
              font: { size: 12 }
            },
            ticks: { font: { size: 11 } }
          },
          y: {
            title: {
              display: true,
              text: "標高（m）",
              font: { size: 12 }
            },
            ticks: { font: { size: 11 } }
          }
        }
      }
    });

    // 地図の表示範囲変更を受信して断面図を更新
    window.addEventListener("mapBoundsChanged", (e) => {
      const { west, east } = e.detail;
      mapViewRangePlugin._xMin = lonToDistance(west);
      mapViewRangePlugin._xMax = lonToDistance(east);
      chart.update("none");  // アニメーションなしで再描画
    });

    // 断面の説明文を補完
    const infoEl = document.createElement("p");
    infoEl.className = "profile-status";
    infoEl.style.cssText = "color:#555; font-size:0.82rem; text-align:center; margin-top:0.4rem;";
    infoEl.textContent =
      `断面線: 北緯 ${data.profile_line.start[1]}° / ` +
      `東経 ${startLon}°〜${endLon}° ` +
      `（全長 ${totalDist.toFixed(0)} m）　` +
      `青い帯: 地図の現在の表示範囲`;
    document.querySelector(".profile-section").appendChild(infoEl);

  } catch (err) {
    statusEl.textContent = `断面図データの読み込みに失敗しました（${err.message}）`;
    console.error("profile.js エラー:", err);
  }
})();

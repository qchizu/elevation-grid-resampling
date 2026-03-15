/**
 * 断面図の描画（Chart.js）
 *
 * profile_data.json を読み込み、nearest と bilinear の
 * 標高プロファイルを重ねて表示する。
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

    // 有効な点のみ抽出（nodata除去）
    const distances = data.distances;
    const nearElev = data.elevations.near;
    const bilinearElev = data.elevations.bilinear;

    // null を含む点はスキップしてデータセット作成
    const nearPoints = distances.map((d, i) =>
      nearElev[i] !== null ? { x: d, y: nearElev[i] } : null
    ).filter(Boolean);

    const bilinearPoints = distances.map((d, i) =>
      bilinearElev[i] !== null ? { x: d, y: bilinearElev[i] } : null
    ).filter(Boolean);

    // Chart.js で描画
    const ctx = document.getElementById("profile-chart").getContext("2d");
    new Chart(ctx, {
      type: "line",
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

    // 断面の説明文を補完
    const totalDist = data.total_distance_m;
    const infoEl = document.createElement("p");
    infoEl.className = "profile-status";
    infoEl.style.cssText = "color:#555; font-size:0.82rem; text-align:center; margin-top:0.4rem;";
    infoEl.textContent =
      `断面線: 北緯 ${data.profile_line.start[1]}° / ` +
      `東経 ${data.profile_line.start[0]}°〜${data.profile_line.end[0]}° ` +
      `（全長 ${totalDist.toFixed(0)} m）`;
    document.querySelector(".profile-section").appendChild(infoEl);

  } catch (err) {
    statusEl.textContent = `断面図データの読み込みに失敗しました（${err.message}）`;
    console.error("profile.js エラー:", err);
  }
})();

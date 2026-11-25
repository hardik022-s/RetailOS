/* ==========================================================================
   RetailOS - Charts (Chart.js Layer)
   Views call lineChart() / barChart() / sparkline() to get a <canvas> placeholder;
   mountCharts() turns every placeholder into a live chart.
   ========================================================================== */

const COLORS = {
  brand: '#0e6b56',
  brandDeep: '#0a4f40',
  brandSoft: '#e5f3ee',
  danger: '#c0432f',
  amber: '#c99a3e',
  amberSoft: '#f8f0dc',
  line: '#e6ebe8',
  subtle: '#8a958f',
  muted: '#5d6a64',
  ink: '#14201b',
};

const CH = { specs: new Map(), n: 0 };

if (window.Chart) {
  Chart.defaults.font.family = "'Inter', ui-sans-serif, system-ui, sans-serif";
  Chart.defaults.font.size = 11;
  Chart.defaults.color = COLORS.subtle;
}

const hexA = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
};

const tipStyle = {
  backgroundColor: COLORS.ink,
  titleColor: '#fff',
  bodyColor: '#fff',
  padding: 10,
  cornerRadius: 8,
  displayColors: false,
  titleFont: { weight: '600', size: 11 },
  bodyFont: { size: 11 },
};

function register(spec, wrapCls) {
  const id = `cv${++CH.n}`;
  CH.specs.set(id, spec);
  return `<div class="relative ${wrapCls}"><canvas id="${id}"></canvas></div>`;
}

/** Actual (solid) vs AI predicted (dashed) line chart. */
function lineChart({ labels, actual, predicted, format = (n) => String(Math.round(n)) }) {
  return register({ type: 'line', labels, actual, predicted, format }, 'h-52');
}

/** Bar chart. `predictedFrom` marks forecast bars, `highlight` marks one bar in amber. */
function barChart({ data, labels, highlight, predictedFrom, format = (n) => String(Math.round(n)) }) {
  return register({ type: 'bar', data, labels, highlight, predictedFrom, format }, 'h-28');
}

/** Minimal KPI sparkline. */
function sparkline(data, tone = 'brand') {
  return register({ type: 'spark', data, tone }, 'h-8 w-full');
}

function buildConfig(s, animate) {
  const animation = animate ? { duration: 700 } : false;

  if (s.type === 'line') {
    const vals = [...s.actual, ...s.predicted].filter((v) => v != null);
    const max = (Math.max(...vals, 1) || 1) * 1.15;
    return {
      type: 'line',
      data: {
        labels: s.labels,
        datasets: [
          {
            label: 'Actual',
            data: s.actual,
            borderColor: COLORS.brand,
            backgroundColor: hexA(COLORS.brand, 0.1),
            fill: 'origin',
            borderWidth: 2.4,
            tension: 0,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: COLORS.brand,
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
            spanGaps: false,
          },
          {
            label: 'AI',
            data: s.predicted,
            borderColor: COLORS.amber,
            borderDash: [5, 6],
            borderWidth: 2.4,
            tension: 0,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: COLORS.amber,
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
            spanGaps: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation,
        interaction: { mode: 'index', intersect: false },
        layout: { padding: { top: 4, right: 4 } },
        plugins: {
          legend: { display: false },
          tooltip: {
            ...tipStyle,
            callbacks: {
              label: (c) =>
                c.parsed.y == null ? '' : `${c.dataset.label === 'AI' ? 'AI' : 'Actual'} ${s.format(c.parsed.y)}`,
              labelTextColor: (c) => (c.dataset.label === 'AI' ? COLORS.amber : '#fff'),
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { color: COLORS.subtle, maxRotation: 0, autoSkip: false },
          },
          y: {
            min: 0,
            max,
            border: { display: false },
            ticks: { display: false, stepSize: max / 4 },
            grid: { color: COLORS.line, borderDash: [3, 5], drawTicks: false },
          },
        },
      },
    };
  }

  if (s.type === 'bar') {
    const bg = s.data.map((_, i) =>
      s.predictedFrom != null && i >= s.predictedFrom
        ? hexA(COLORS.amber, 0.25)
        : i === s.highlight
        ? COLORS.amber
        : hexA(COLORS.brand, 0.85)
    );
    const bd = s.data.map((_, i) =>
      s.predictedFrom != null && i >= s.predictedFrom ? COLORS.amber : 'transparent'
    );
    return {
      type: 'bar',
      data: {
        labels: s.labels,
        datasets: [
          {
            data: s.data,
            backgroundColor: bg,
            borderColor: bd,
            borderWidth: 1,
            borderRadius: { topLeft: 2, topRight: 2 },
            borderSkipped: 'bottom',
            minBarLength: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation,
        plugins: {
          legend: { display: false },
          tooltip: {
            ...tipStyle,
            callbacks: {
              title: () => '',
              label: (c) => s.format(c.parsed.y),
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { color: COLORS.subtle, maxRotation: 0, autoSkip: false },
          },
          y: { display: false, min: 0, grace: '5%' },
        },
      },
    };
  }

  // Sparkline
  const color = COLORS[s.tone] || COLORS.brand;
  return {
    type: 'line',
    data: {
      labels: s.data.map((_, i) => i),
      datasets: [
        {
          data: s.data,
          borderColor: color,
          backgroundColor: hexA(color, 0.08),
          fill: 'origin',
          borderWidth: 1.8,
          tension: 0,
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation,
      events: [],
      layout: { padding: { top: 2, bottom: 0 } },
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: { x: { display: false }, y: { display: false } },
    },
  };
}

/** Instantiates charts for new canvases and destroys charts whose canvas was removed from the DOM. */
function mountCharts(animate = false) {
  if (!window.Chart) return;
  if (Chart.instances) {
    Object.values(Chart.instances).forEach((c) => {
      if (c && c.canvas && !c.canvas.isConnected) c.destroy();
    });
  }
  document.querySelectorAll('canvas[id^="cv"]').forEach((cv) => {
    if (Chart.getChart(cv)) return;
    const spec = CH.specs.get(cv.id);
    if (spec) new Chart(cv, buildConfig(spec, animate));
  });
  for (const id of [...CH.specs.keys()]) {
    if (!document.getElementById(id)) CH.specs.delete(id);
  }
}

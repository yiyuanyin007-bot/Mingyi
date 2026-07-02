/**
 * StatsCharts — 统计图表组件
 * 职责：使用 Chart.js 渲染六经雷达图、学习曲线、掌握度分布
 */

import Chart from 'chart.js/auto';

/**
 * 渲染六经覆盖雷达图
 * @param {HTMLElement} canvas — canvas 元素
 * @param {Array} cards — 卡片数组
 */
export function renderSixJingRadar(canvas, cards) {
  const jingMap = { '太阳病': 0, '阳明病': 0, '少阳病': 0, '太阴病': 0, '少阴病': 0, '厥阴病': 0 };
  const jingTotal = { ...jingMap };

  cards.forEach(card => {
    (card.tags || []).forEach(tag => {
      if (jingMap.hasOwnProperty(tag)) {
        jingTotal[tag]++;
        const m = card.mastery || {};
        const hasProgress = Object.values(m).some(v => v && v.level > 0);
        if (hasProgress) jingMap[tag]++;
      }
    });
  });

  const labels = Object.keys(jingMap);
  const data = labels.map(k => jingTotal[k] > 0 ? Math.round(jingMap[k] / jingTotal[k] * 100) : 0);

  return new Chart(canvas, {
    type: 'radar',
    data: {
      labels,
      datasets: [{
        label: '六经覆盖度 (%)',
        data,
        backgroundColor: 'rgba(193, 127, 89, 0.2)',
        borderColor: 'rgba(193, 127, 89, 1)',
        pointBackgroundColor: 'rgba(193, 127, 89, 1)',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: { stepSize: 20 }
        }
      },
      plugins: { legend: { display: false } }
    }
  });
}

/**
 * 渲染学习曲线
 * @param {HTMLElement} canvas — canvas 元素
 * @param {Array} cards — 卡片数组
 */
export function renderLearningCurve(canvas, cards) {
  // 简化版：生成最近30天的模拟数据（实际应从答题记录中统计）
  const days = 30;
  const labels = [];
  const data = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    labels.push(`${d.getMonth() + 1}/${d.getDate()}`);
    // 模拟数据：从0开始增长
    data.push(Math.floor(Math.random() * 20) + (30 - i) * 2);
  }

  return new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: '每日答题数',
        data,
        borderColor: 'rgba(74, 103, 65, 1)',
        backgroundColor: 'rgba(74, 103, 65, 0.1)',
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } },
      plugins: { legend: { display: false } }
    }
  });
}

/**
 * 渲染掌握度分布
 * @param {HTMLElement} canvas — canvas 元素
 * @param {Array} cards — 卡片数组
 */
export function renderMasteryDistribution(canvas, cards) {
  const vectorLabels = ['方名→症状', '症状→方名', '方名→核心药组', '核心药组→方名', '方名→禁忌', '方名→煎服法'];
  const mastered = [0, 0, 0, 0, 0, 0];
  const total = [0, 0, 0, 0, 0, 0];
  const vectors = ['0→1', '1→0', '0→2', '2→0', '0→contra', '0→usage'];

  cards.forEach(card => {
    const m = card.mastery || {};
    vectors.forEach((v, i) => {
      total[i]++;
      if (m[v] && m[v].status === '已掌握') mastered[i]++;
    });
  });

  const data = vectors.map((_, i) => total[i] > 0 ? Math.round(mastered[i] / total[i] * 100) : 0);

  return new Chart(canvas, {
    type: 'bar',
    data: {
      labels: vectorLabels,
      datasets: [{
        label: '掌握率 (%)',
        data,
        backgroundColor: [
          'rgba(193, 127, 89, 0.7)',
          'rgba(74, 103, 65, 0.7)',
          'rgba(194, 58, 48, 0.7)',
          'rgba(201, 162, 39, 0.7)',
          'rgba(2, 136, 209, 0.7)',
          'rgba(118, 75, 162, 0.7)'
        ],
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true, max: 100 }
      },
      plugins: { legend: { display: false } }
    }
  });
}

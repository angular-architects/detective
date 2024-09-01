import { Chart, ArcElement, Tooltip, Legend, Title, DoughnutController } from 'chart.js';

import { TeamAlignmentResult } from './team-alignment-result';
import { lastSegments } from '../utils/segments';

Chart.register(ArcElement, Tooltip, Legend, Title, DoughnutController);

export type TeamAlignmentChart = Chart<'doughnut', number[], string>;

export function drawAlignmentCharts(
  result: TeamAlignmentResult,
  placeholder: HTMLElement,
  colors: string[]
): TeamAlignmentChart[] {
  const charts: TeamAlignmentChart[] = [];

  const moduleNames = Object.keys(result.modules);
  const teams = result.teams;

  for (const moduleName of moduleNames) {
    const module = result.modules[moduleName];

    const label = lastSegments(moduleName, 3);

    const container = document.createElement('div');
    container.classList.add('ta-container');
    placeholder.appendChild(container);

    const canvas = document.createElement('canvas');
    canvas.classList.add('ta-diagram');
    container.appendChild(canvas);

    const data = teams.map((t) => module.changes[t]);
    const sum = data.reduce((acc, curr) => acc + (curr || 0), 0);

    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: teams,
        datasets: [
          {
            data,
            borderWidth: 1,
            backgroundColor: colors,
          },
        ],
      },
      options: {
        responsive: false,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: label,
            font: {
              size: 16,
            },
          },
          tooltip: {
            callbacks: {
              title: () => moduleName,
              label: function (context) {
                let label = ' ' + context.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.raw !== null) {
                  label +=
                    (((context.raw as number) / sum) * 100).toFixed(2) + '%';
                }
                return label;
              },
            },
          },
        },
      },
    });

    charts.push(chart);
  }
  return charts;
}

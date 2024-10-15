import 'chartjs-chart-treemap';

import { ChartEvent, InteractionItem } from 'chart.js';

import { AggregatedHotspot } from '../../model/hotspot-result';
import { TreeMapChartConfig } from '../../ui/treemap/treemap.component';

export type ScoreType = 'hotspot' | 'warning' | 'fine';
export type AggregatedHotspotWithType = AggregatedHotspot & {
  type: ScoreType;
};

export function toTreeMapConfig(
  aggregated: AggregatedHotspot[]
): TreeMapChartConfig {
  const values = aggregated.flatMap((v) => [
    { ...v, count: v.countHotspot, type: 'hotspot' },
    { ...v, count: v.countWarning, type: 'warning' },
    { ...v, count: v.countOk, type: 'fine' },
  ]);

  const options = {
    onHover: (event: ChartEvent, elements: InteractionItem[]) => {
      const chartElement = event.native?.target as HTMLCanvasElement;
      if (elements.length >= 2) {
        chartElement.style.cursor = 'pointer';
      } else {
        chartElement.style.cursor = 'default';
      }
    },
    plugins: {
      title: {
        display: true,
        text: 'Hotspots',
      },
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title() {
            return 'File Count';
          },
        },
      },
    },
  };

  const config: TreeMapChartConfig = {
    type: 'treemap',
    data: {
      datasets: [
        {
          data: values,
          key: 'count',
          groups: ['parent', 'module', 'type'],
          spacing: 1,
          borderWidth: 0.5,
          borderColor: '#EFEFEF',
          backgroundColor: (ctx) => {
            if (typeof ctx.raw?.l !== 'undefined' && ctx.raw?.l < 2) {
              return '#EFEFEF';
            }
            return getScoreTypeColor(ctx.raw?.g as ScoreType);
          },
          captions: {
            align: 'center',
            display: true,
            color: 'black',
            font: {
              size: 14,
            },
            hoverFont: {
              size: 16,
              weight: 'bold',
            },
            padding: 5,
          },
          labels: {
            display: false,
            overflow: 'hidden',
          },
        },
      ],
    },
    options: options,
  };

  return config;
}

export function getScoreTypeColor(scoreType: ScoreType) {
  switch (scoreType) {
    case 'hotspot':
      return '#E74C3C';
    case 'warning':
      return '#F1C40F';
    case 'fine':
      return '#2ECC71';
  }
}

import 'chartjs-chart-treemap';

import { ChartEvent, InteractionItem } from 'chart.js';

import { AggregatedHotspot } from '../../model/hotspot-result';
import { TreeMapChartConfig } from '../../ui/treemap/treemap.component';

type HotspotDataSet = {
  tree: AggregatedHotspot[];
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
    onClick: (_event: ChartEvent, elements: InteractionItem[]) => {
      if (elements.length > 0) {
        const element = elements[elements.length - 1];
        const dataIndex = element.index;
        const dataset = config.data.datasets[0] as unknown as HotspotDataSet;
        const tree = dataset.tree;
        const item = tree[dataIndex];
        console.log('item', item);
      }
    },
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
          // backgroundColor: 'rgba(220,230,220,0.3)',
          backgroundColor: (ctx) => {
            if (typeof ctx.raw?.l !== 'undefined' && ctx.raw?.l < 2) {
              return '#EFEFEF';
            }

            switch (ctx.raw?.g) {
              case 'hotspot':
                return '#E74C3C';
              case 'warning':
                return '#F1C40F';
              case 'fine':
                return '#2ECC71';
            }

            return 'gray';
          },
          // hoverBackgroundColor: 'rgba(220,230,220,0.5)',
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

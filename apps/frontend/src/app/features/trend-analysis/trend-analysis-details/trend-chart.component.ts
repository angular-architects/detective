import {
  Component,
  ElementRef,
  input,
  viewChild,
  effect,
  computed,
  afterNextRender,
  DestroyRef,
  inject,
} from '@angular/core';
import * as echarts from 'echarts';

import { FileTrend } from '../../../model/trend-analysis-result';

export interface TrendChartData {
  date: string;
  value: number;
  commit: string;
  label?: string; // For custom labels like "Complexity" or "Lines"
}

export interface FolderTrendData {
  complexityTrend: { date: string; complexity: number; commit: string }[];
  sizeTrend: { date: string; lines: number; commit: string }[];
  fileCount: number;
}

export type ChartType =
  | 'complexity'
  | 'size'
  | 'folder-complexity'
  | 'folder-size';

@Component({
  selector: 'app-trend-chart',
  standalone: true,
  template: `
    <div class="chart-container" [class.folder-chart]="isFolderChart()">
      @if (title()) {
      <h4>{{ title() }}</h4>
      } @if (description()) {
      <p class="chart-description">{{ description() }}</p>
      }
      <div #chartElement class="chart" [style.height.px]="height()"></div>
    </div>
  `,
  styles: [
    `
      .chart-container {
        margin-bottom: 24px;
      }

      .chart-container h4 {
        margin: 0 0 12px 0;
        font-size: 14px;
        font-weight: 500;
      }

      .chart-container.folder-chart {
        border: 2px solid #e8f5e8;
        background: linear-gradient(135deg, #f8fffe 0%, #f0fff4 100%);
        border-radius: 8px;
        padding: 16px;
      }

      .chart-container.folder-chart h4 {
        color: #2e7d2e;
        font-size: 16px;
        margin-bottom: 4px;
      }

      .chart-description {
        font-size: 12px;
        color: #666;
        margin: 0 0 12px 0;
        font-style: italic;
      }

      .chart {
        width: 100%;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
      }
    `,
  ],
})
export class TrendChartComponent {
  // Inputs
  chartType = input.required<ChartType>();
  fileTrend = input<FileTrend>();
  folderTrendData = input<FolderTrendData>();

  title = input<string>();
  description = input<string>();
  height = input<number>(300);
  folderFileCount = input<number>();

  // Template reference
  chartElement = viewChild.required<ElementRef>('chartElement');

  // Computed signal to map raw data to chart data format
  chartData = computed(() => {
    const chartType = this.chartType();
    const fileData = this.fileTrend();
    const folderData = this.folderTrendData();

    // Map file trend data based on chart type
    if (fileData) {
      switch (chartType) {
        case 'complexity':
          return (
            fileData.complexityTrend?.map((t) => ({
              date: t.date,
              value: t.complexity || 0,
              commit: t.commit,
            })) || []
          );
        case 'size':
          return (
            fileData.sizeTrend?.map((t) => ({
              date: t.date,
              value: t.lines || 0,
              commit: t.commit,
            })) || []
          );
      }
    }

    // Map folder trend data based on chart type
    if (folderData) {
      switch (chartType) {
        case 'folder-complexity':
          return (
            folderData.complexityTrend?.map((t) => ({
              date: t.date,
              value: t.complexity || 0,
              commit: t.commit,
            })) || []
          );
        case 'folder-size':
          return (
            folderData.sizeTrend?.map((t) => ({
              date: t.date,
              value: t.lines || 0,
              commit: t.commit,
            })) || []
          );
      }
    }

    return [];
  });

  isFolderChart = () => this.chartType().startsWith('folder-');

  private chart: echarts.ECharts | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      const data = this.chartData();
      const chartEl = this.chartElement();

      if (chartEl && data?.length) {
        this.updateChart();
      }
    });

    afterNextRender(() => {
      this.setupResizeObserver();
    });

    this.destroyRef.onDestroy(() => {
      if (this.chart) {
        this.chart.dispose();
        this.chart = null;
      }
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
        this.resizeObserver = null;
      }
    });
  }

  private setupResizeObserver(): void {
    const chartElement = this.chartElement();
    if (!chartElement?.nativeElement) return;

    this.resizeObserver = new ResizeObserver(() => {
      if (this.chart) {
        this.chart.resize();
      }
    });

    this.resizeObserver.observe(chartElement.nativeElement);
  }

  private updateChart(): void {
    const chartElement = this.chartElement();
    if (!chartElement) return;

    if (!this.chart) {
      this.chart = echarts.init(chartElement.nativeElement);
    }

    const chartType = this.chartType();
    const data = this.chartData();

    const configs = {
      complexity: {
        label: 'Complexity',
        yAxisName: 'Complexity',
        color: '#ff9800',
        colorLight: 'rgba(255, 152, 0, 0.3)',
        colorFade: 'rgba(255, 152, 0, 0.1)',
        symbolSize: 6,
        lineWidth: 2,
      },
      size: {
        label: 'Lines',
        yAxisName: 'Lines of Code',
        color: '#2196f3',
        colorLight: 'rgba(33, 150, 243, 0.3)',
        colorFade: 'rgba(33, 150, 243, 0.1)',
        symbolSize: 6,
        lineWidth: 2,
      },
      'folder-complexity': {
        label: 'Avg Complexity',
        yAxisName: 'Avg Complexity',
        color: '#4caf50',
        colorLight: 'rgba(76, 175, 80, 0.3)',
        colorFade: 'rgba(76, 175, 80, 0.1)',
        symbolSize: 8,
        lineWidth: 3,
        extraTooltip: `Files: ${this.folderFileCount() || 0}`,
      },
      'folder-size': {
        label: 'Total Lines',
        yAxisName: 'Total Lines of Code',
        color: '#9c27b0',
        colorLight: 'rgba(156, 39, 176, 0.3)',
        colorFade: 'rgba(156, 39, 176, 0.1)',
        symbolSize: 8,
        lineWidth: 3,
        extraTooltip: `Files: ${this.folderFileCount() || 0}`,
      },
    };

    const config = configs[chartType];
    if (config) {
      this.renderChart(data, config);
    }
  }

  private renderChart(
    data: TrendChartData[],
    config: {
      label: string;
      yAxisName: string;
      color: string;
      colorLight: string;
      colorFade: string;
      symbolSize: number;
      lineWidth: number;
      extraTooltip?: string;
    }
  ): void {
    if (!this.chart) return;

    const dates = data.map((d) => new Date(d.date).toLocaleDateString());
    const values = data.map((d) => d.value);

    type TooltipParam = {
      name: string;
      value: number | string;
      dataIndex: number;
    };

    const option = {
      title: { show: false },
      tooltip: {
        trigger: 'axis',
        formatter: (params: TooltipParam[]) => {
          const point = params[0];
          const dataPoint = data[point.dataIndex];
          return `
            <div><strong>${point.name}</strong></div>
            <div>${config.label}: ${point.value}</div>
            <div>Commit: ${dataPoint.commit}</div>
            ${config.extraTooltip ? `<div>${config.extraTooltip}</div>` : ''}
          `;
        },
      },
      grid: { left: '10%', right: '10%', bottom: '15%', top: '10%' },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: { rotate: 45, fontSize: 10 },
      },
      yAxis: {
        type: 'value',
        name: config.yAxisName,
        nameLocation: 'middle',
        nameGap: 40,
      },
      series: [
        {
          name: config.label,
          type: 'line',
          data: values,
          smooth: true,
          symbol: 'circle',
          symbolSize: config.symbolSize,
          lineStyle: { color: config.color, width: config.lineWidth },
          itemStyle: { color: config.color },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: config.colorLight },
                { offset: 1, color: config.colorFade },
              ],
            },
          },
        },
      ],
    };

    this.chart.setOption(option);
  }
}

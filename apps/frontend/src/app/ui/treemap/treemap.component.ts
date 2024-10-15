import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  input,
  OnChanges,
  OnDestroy,
  output,
  SimpleChanges,
  viewChild,
} from '@angular/core';
import {
  CategoryScale,
  Chart,
  ChartConfiguration,
  ChartEvent,
  InteractionItem,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import { TreemapController, TreemapElement } from 'chartjs-chart-treemap';

export type TreeMapChartConfig = ChartConfiguration<
  'treemap',
  object[],
  string
>;

type TreeMapChart = Chart<'treemap', object[], string>;

type Item = {
  _data: {
    children: unknown[];
  };
};

export type TreeMapEvent = {
  entry: unknown;
};

Chart.register(
  TreemapElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Title,
  TreemapController
);

@Component({
  selector: 'app-treemap',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './treemap.component.html',
  styleUrl: './treemap.component.css',
})
export class TreeMapComponent implements OnChanges, OnDestroy {
  canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  chartConfig = input.required<TreeMapChartConfig>();

  elementSelected = output<TreeMapEvent>();

  private chart: TreeMapChart | undefined;

  ngOnChanges(_changes: SimpleChanges): void {
    const canvasRef = this.canvasRef();
    const canvas = canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    const config = this.chartConfig();

    if (config.data.datasets[0].data.length === 0) {
      return;
    }

    if (!ctx) {
      throw new Error('2d context not found');
    }

    console.log('config', config);

    this.chart?.destroy();

    config.options = config.options ?? {};
    config.options.onClick = (
      _event: ChartEvent,
      elements: InteractionItem[]
    ) => {
      if (elements.length > 2) {
        const element = elements[elements.length - 1];
        const dataIndex = element.index;
        const dataset = config.data.datasets[0];
        const data = dataset.data;
        const item = data[dataIndex] as Item;
        const entry = item._data.children[0];
        this.elementSelected.emit({ entry });
      }
    };
    this.chart = new Chart(ctx, config);
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}

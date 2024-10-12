import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  viewChild,
} from '@angular/core';
import {
  CategoryScale,
  Chart,
  ChartConfiguration,
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

  private chart: TreeMapChart | undefined;

  ngOnChanges(_changes: SimpleChanges): void {
    const canvasRef = this.canvasRef();
    const canvas = canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    const config = this.chartConfig();

    if (!ctx) {
      throw new Error('2d context not found');
    }

    this.chart?.destroy();

    this.chart = new Chart(ctx, config);
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}

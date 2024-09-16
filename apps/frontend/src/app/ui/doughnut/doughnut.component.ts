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
  ArcElement,
  Chart,
  ChartConfiguration,
  DoughnutController,
  Legend,
  Title,
  Tooltip,
} from 'chart.js';

Chart.register(ArcElement, Tooltip, Legend, Title, DoughnutController);

export type DoughnutChartConfig = ChartConfiguration<
  'doughnut',
  number[],
  string
>;
type DoughnutChart = Chart<'doughnut', number[], string>;

@Component({
  selector: 'app-doughnut',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doughnut.component.html',
  styleUrl: './doughnut.component.css',
})
export class DoughnutComponent implements OnChanges, OnDestroy {
  canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  chartConfig = input.required<DoughnutChartConfig>();

  private chart: DoughnutChart | undefined;

  ngOnChanges(_changes: SimpleChanges): void {
    const canvasRef = this.canvasRef();
    const canvas = canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    const config = this.chartConfig();

    if (!ctx) {
      throw new Error('2d context not found');
    }

    this.chart = new Chart(ctx, config);
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}

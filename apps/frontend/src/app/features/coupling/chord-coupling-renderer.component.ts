import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  input,
  OnDestroy,
  viewChild,
  afterNextRender,
  effect,
} from '@angular/core';
import * as echarts from 'echarts';

import { CouplingResult } from '../../model/coupling-result';
import { GraphType } from '../../model/graph-type';

@Component({
  selector: 'app-chord-coupling-renderer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chord-coupling-renderer.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
    `
      .chord-container {
        width: 100%;
        height: 75vh;
        min-height: 300px;
      }
    `,
  ],
})
export class ChordCouplingRendererComponent implements OnDestroy {
  result = input.required<CouplingResult>();
  type = input.required<GraphType>();
  minConnections = input.required<number>();

  containerRef = viewChild.required<ElementRef<HTMLDivElement>>('container');

  private chart: echarts.ECharts | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private zoomScale = 2.0; // start at max zoom
  private readonly baseInnerRadiusPct = 40;
  private readonly baseOuterRadiusPct = 58;

  constructor() {
    afterNextRender(() => this.ensureChartInitialized());

    effect(() => {
      // react to input changes
      this.result();
      this.type();
      this.minConnections();

      if (this.chart) {
        this.chart.setOption(this.createOption());
        this.chart.resize();
      }
    });
  }

  private ensureChartInitialized(): void {
    const container = this.containerRef().nativeElement;
    if (container.clientWidth === 0 || container.clientHeight === 0) {
      this.observeUntilVisible(container);
      return;
    }
    if (!this.chart) {
      this.chart = echarts.init(container);
      window.addEventListener('resize', this.onResize);
      this.chart.setOption(this.createOption());
      this.chart.resize();
    }
  }

  private onResize = () => {
    if (this.chart) {
      this.chart.resize();
    }
  };

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onResize);
    // nothing to clean on container anymore (no listeners)
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.chart) {
      this.chart.dispose();
      this.chart = null;
    }
  }

  private observeUntilVisible(container: HTMLDivElement): void {
    if (this.resizeObserver) {
      return;
    }
    this.resizeObserver = new ResizeObserver(() => {
      if (container.clientWidth > 0 && container.clientHeight > 0) {
        this.resizeObserver?.disconnect();
        this.resizeObserver = null;
        this.chart = echarts.init(container);
        window.addEventListener('resize', this.onResize);
        this.chart.setOption(this.createOption());
        this.chart.resize();
      }
    });
    this.resizeObserver.observe(container);
  }

  private createOption(): echarts.EChartsOption {
    const result = this.result();
    const type = this.type();
    const minConnections = this.minConnections();

    const links: Array<{ source: string; target: string; value: number }> = [];
    const hasConnection: boolean[] = new Array(result.dimensions.length).fill(
      false
    );
    const delimiter = type === 'structure' ? '→' : '↔';

    for (let i = 0; i < result.matrix.length; i++) {
      for (let j = 0; j < result.matrix.length; j++) {
        const value = result.matrix[i][j];
        if (i !== j && value >= minConnections) {
          links.push({
            source: result.dimensions[i],
            target: result.dimensions[j],
            value,
          });
          hasConnection[i] = true;
          hasConnection[j] = true;
        }
      }
    }

    const data = result.dimensions
      .filter((_, idx) => hasConnection[idx])
      .map((dimension) => ({ name: dimension }));

    const [inner, outer] = this.computeRadii();
    const chordSeries = {
      type: 'chord',
      radius: [`${inner}%`, `${outer}%`],
      center: ['50%', '50%'],
      padding: 3,
      data,
      links,
      lineStyle: {
        color: 'gradient',
        width: 1,
      },
      emphasis: {
        lineStyle: { width: 2 },
      },
      label: {
        show: true,
        formatter: (item: { name: string }) => lastSegment(item.name),
      },
    } as echarts.SeriesOption;

    const formatterFn = (params: unknown): string => {
      if (Array.isArray(params)) {
        return '';
      }
      const p = params as {
        dataType?: string;
        name?: string;
        data?: { source?: string; target?: string; value?: number };
      };
      if (p.dataType === 'node' && typeof p.name === 'string') {
        const idx = result.dimensions.indexOf(p.name);
        const label = p.name;
        const soc = Array.isArray(result.sumOfCoupling)
          ? (result.sumOfCoupling[idx] as number | undefined)
          : undefined;
        const relSoc =
          soc !== undefined
            ? Math.round(((soc as number) / result.fileCount[idx]) * 100)
            : undefined;
        return type === 'structure'
          ? `${label}<br/><br/>${result.fileCount[idx]} source files` +
              `<br/>Cohesion: ${result.cohesion[idx]}%` +
              `<br/>Outgoing Deps: ${sumRow(result.matrix, idx)}` +
              `<br/>Incoming Deps: ${sumCol(result.matrix, idx)}`
          : `${label}<br/><br/>${result.fileCount[idx]} commits` +
              `<br/>Sum of Coupling (SoC): ${soc ?? '-'} ` +
              `<br/>SoC per Commit: ${relSoc ?? '-'}%`;
      }
      if (p.dataType === 'edge' && p.data) {
        const d = p.data as {
          source?: string;
          target?: string;
          value?: number;
        };
        const s = d.source ?? '';
        const t = d.target ?? '';
        const v = d.value ?? 0;
        return `${lastSegment(s)} ${delimiter} ${lastSegment(
          t
        )}<br/><br/>${v} connections`;
      }
      return '';
    };

    return {
      tooltip: {
        trigger: 'item',
        formatter: formatterFn as never,
      },
      animation: true,
      series: [chordSeries],
    } satisfies echarts.EChartsOption;
  }

  private computeRadii(): [number, number] {
    const inner = this.baseInnerRadiusPct * this.zoomScale;
    const outer = this.baseOuterRadiusPct * this.zoomScale;
    const clamp = (n: number, lo: number, hi: number) =>
      Math.max(lo, Math.min(hi, n));
    const ci = clamp(Number(inner.toFixed(2)), 6, 92);
    const co = clamp(Number(outer.toFixed(2)), 10, 96);
    const adjustedOuter = Math.max(co, ci + 6);
    return [ci, adjustedOuter];
  }
}

function lastSegment(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 1] || path;
}

function sumRow(matrix: number[][], nodeIndex: number): number {
  let sum = 0;
  for (let i = 0; i < matrix.length; i++) {
    if (i !== nodeIndex) {
      sum += matrix[nodeIndex][i];
    }
  }
  return sum;
}

function sumCol(matrix: number[][], nodeIndex: number): number {
  let sum = 0;
  for (let i = 0; i < matrix.length; i++) {
    if (i !== nodeIndex) {
      sum += matrix[i][nodeIndex];
    }
  }
  return sum;
}

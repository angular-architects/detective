import { Component, input, computed } from '@angular/core';

import { FileTrend } from '../../../model/trend-analysis-result';

export interface MetricData {
  label: string;
  value: string | number;
}

export interface FolderMetricsData {
  fileCount: number;
  avgComplexity: number;
  minComplexity: number;
  maxComplexity: number;
  avgSize: number;
  totalChanges: number;
  avgChangeFreq: number;
  folderName?: string;
  folderPath?: string;
  files?: FileTrend[];
  complexityTrend?: Array<{ date: string; complexity: number; commit: string }>;
  sizeTrend?: Array<{ date: string; lines: number; commit: string }>;
}

@Component({
  selector: 'app-trend-metrics-card',
  standalone: true,
  template: `
    <div class="trend-metrics">
      @for (metric of displayMetrics(); track metric.label) {
      <div class="metric-card">
        <span class="metric-label">{{ metric.label }}</span>
        <span class="metric-value">{{ metric.value }}</span>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .trend-metrics {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin: 16px 0;
      }

      .metric-card {
        display: flex;
        flex-direction: column;
        padding: 16px;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        background: #fafafa;
      }

      .metric-label {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.6);
        margin-bottom: 4px;
        font-weight: 500;
      }

      .metric-value {
        font-size: 18px;
        font-weight: 600;
        color: #333;
      }
    `,
  ],
})
export class TrendMetricsCardComponent {
  // Input for backward compatibility with existing MetricData[]
  metrics = input<MetricData[]>();

  // New inputs for raw data that will be mapped internally
  fileTrend = input<FileTrend>();
  folderMetrics = input<FolderMetricsData>();

  // Computed signal to map raw data to MetricData format
  displayMetrics = computed(() => {
    // If metrics are provided directly, use them
    const directMetrics = this.metrics();
    if (directMetrics?.length) {
      return directMetrics;
    }

    // If fileTrend is provided, map it to metrics
    const fileData = this.fileTrend();
    if (fileData) {
      return [
        { label: 'Change Frequency', value: fileData.changeFrequency },
        { label: 'Avg Complexity', value: fileData.averageComplexity },
        { label: 'Avg Size', value: `${fileData.averageSize} lines` },
        { label: 'Total Changes', value: fileData.totalChanges },
      ];
    }

    // If folderMetrics is provided, map it to metrics
    const folderData = this.folderMetrics();
    if (folderData) {
      return [
        { label: 'Files in Folder', value: folderData.fileCount || 0 },
        { label: 'Avg Complexity', value: folderData.avgComplexity || 0 },
        {
          label: 'Complexity Range',
          value: `${folderData.minComplexity || 0} - ${
            folderData.maxComplexity || 0
          }`,
        },
        { label: 'Avg File Size', value: `${folderData.avgSize || 0} lines` },
        { label: 'Total Changes', value: folderData.totalChanges || 0 },
        { label: 'Avg Change Freq', value: folderData.avgChangeFreq || 0 },
      ];
    }

    // Fallback to empty array
    return [];
  });
}

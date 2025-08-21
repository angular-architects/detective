import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { FileTrend } from '../../../model/trend-analysis-result';
import { FileIconPipe } from '../../../ui/file-icon.pipe';
import { FileNamePipe } from '../../../ui/file-name.pipe';

@Component({
  selector: 'app-folder-file-item',
  standalone: true,
  imports: [MatIconModule, FileIconPipe, FileNamePipe],
  template: `
    <div class="folder-file-item" (click)="fileClick.emit(file().filePath)">
      <mat-icon class="file-icon">{{ file().filePath | fileIcon }}</mat-icon>
      <span class="file-name">{{ file().filePath | fileName }}</span>
      <div class="file-metrics">
        <span class="change-freq">{{ file().changeFrequency }}×</span>
        <span class="complexity">C: {{ file().averageComplexity }}</span>
      </div>
    </div>
  `,
  styles: [
    `
      .folder-file-item {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        border-bottom: 1px solid #f0f0f0;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .folder-file-item:last-child {
        border-bottom: none;
      }

      .folder-file-item:hover {
        background: #f5f5f5;
      }

      .file-icon {
        margin-right: 8px;
        font-size: 16px;
        width: 16px;
        height: 16px;
        color: #666;
      }

      .file-name {
        flex: 1;
        font-size: 13px;
        margin-right: 8px;
      }

      .file-metrics {
        display: flex;
        gap: 8px;
        font-size: 11px;
      }

      .change-freq {
        color: #2196f3;
        font-weight: 500;
      }

      .complexity {
        color: #ff9800;
        font-weight: 500;
      }
    `,
  ],
})
export class FolderFileItemComponent {
  file = input.required<FileTrend>();

  fileClick = output<string>();
}

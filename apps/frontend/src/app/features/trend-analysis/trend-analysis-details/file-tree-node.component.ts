import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { FileIconPipe } from '../../../ui/file-icon.pipe';

export interface FileNodeData {
  name: string;
  fullPath?: string;
  isFile: boolean;
  changeFreq?: number;
  avgComplexity?: number;
  fileCount?: number;
}

@Component({
  selector: 'app-file-tree-node',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, FileIconPipe],
  template: `
    <div
      class="file-node"
      [class.selected]="isSelected()"
      (click)="nodeClick.emit(nodeData())"
    >
      <mat-icon class="file-icon">{{ nodeData().name | fileIcon }}</mat-icon>
      <span class="file-name">{{ nodeData().name }}</span>
      <div class="file-metrics">
        <span class="change-freq">{{ nodeData().changeFreq }}×</span>
        <span class="complexity">C: {{ nodeData().avgComplexity }}</span>
      </div>
    </div>
  `,
  styles: [
    `
      .file-node {
        display: flex;
        align-items: center;
        padding: 4px 8px;
        cursor: pointer;
        border-radius: 4px;
        transition: background-color 0.2s;
      }

      .file-node:hover {
        background-color: rgba(0, 0, 0, 0.04);
      }

      .file-node.selected {
        background-color: rgba(63, 81, 181, 0.1);
        color: #3f51b5;
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
        margin-left: 8px;
      }

      .change-freq,
      .complexity {
        font-size: 11px;
        padding: 2px 6px;
        border-radius: 10px;
        background: rgba(0, 0, 0, 0.1);
        color: rgba(0, 0, 0, 0.7);
        font-weight: 500;
      }

      .change-freq {
        background: rgba(255, 152, 0, 0.2);
        color: #f57c00;
      }

      .complexity {
        background: rgba(76, 175, 80, 0.2);
        color: #388e3c;
      }
    `,
  ],
})
export class FileTreeNodeComponent {
  nodeData = input.required<FileNodeData>();
  isSelected = input<boolean>(false);

  nodeClick = output<FileNodeData>();
}

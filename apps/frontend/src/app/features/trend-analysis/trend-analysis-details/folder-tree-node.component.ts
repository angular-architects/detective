import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface FolderNodeData {
  name: string;
  fullPath?: string;
  isFile: boolean;
  fileCount?: number;
  isExpanded?: boolean;
}

@Component({
  selector: 'app-folder-tree-node',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  template: `
    <button
      mat-icon-button
      (click)="toggleClick.emit(nodeData())"
      [attr.aria-label]="'Toggle ' + nodeData().name"
    >
      <mat-icon class="mat-icon-rtl-mirror">
        {{ nodeData().isExpanded ? 'expand_more' : 'chevron_right' }}
      </mat-icon>
    </button>
    <div
      class="folder-node"
      [class.folder-selected]="isSelected()"
      (click)="nodeClick.emit(nodeData())"
    >
      <mat-icon class="folder-icon">folder</mat-icon>
      <span class="folder-name">{{ nodeData().name }}</span>
      <span class="file-count">({{ nodeData().fileCount }})</span>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        align-items: center;
      }

      .folder-node {
        display: flex;
        align-items: center;
        padding: 4px 8px;
        cursor: pointer;
        border-radius: 4px;
        transition: background-color 0.2s;
        flex: 1;
      }

      .folder-node:hover {
        background-color: rgba(0, 0, 0, 0.04);
      }

      .folder-node.folder-selected {
        background-color: rgba(76, 175, 80, 0.1);
        color: #4caf50;
      }

      .folder-icon {
        margin-right: 8px;
        color: #ffb74d;
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      .folder-name {
        flex: 1;
        font-size: 13px;
        font-weight: 500;
        margin-right: 8px;
      }

      .file-count {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.6);
        margin-left: 4px;
      }
    `,
  ],
})
export class FolderTreeNodeComponent {
  nodeData = input.required<FolderNodeData>();
  isSelected = input<boolean>(false);

  nodeClick = output<FolderNodeData>();
  toggleClick = output<FolderNodeData>();
}

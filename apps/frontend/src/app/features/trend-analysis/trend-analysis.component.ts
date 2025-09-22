import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';

import { FileNamePipe } from '../../ui/file-name.pipe';
import { ResizerComponent } from '../../ui/resizer/resizer.component';

import { FlatFileTreeNode, FileTreeNode } from './file-tree-node.model';
import { FileTreeStore } from './file-tree.store';
import { HotspotsDialogComponent } from './hotspots/hotspots-dialog.component';
import { FileTreeNodeComponent } from './trend-analysis-details/file-tree-node.component';
import { FolderFileItemComponent } from './trend-analysis-details/folder-file-item.component';
import { FolderTreeNodeComponent } from './trend-analysis-details/folder-tree-node.component';
import { RecentCommitsTableComponent } from './trend-analysis-details/recent-commits-table.component';
import { TrendChartComponent } from './trend-analysis-details/trend-chart.component';
import { TrendMetricsCardComponent } from './trend-analysis-details/trend-metrics-card.component';
import { XRayDialogComponent } from './x-ray/x-ray-dialog.component';

@Component({
  selector: 'app-trend-analysis',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatSliderModule,
    MatToolbarModule,
    MatTreeModule,
    MatTabsModule,
    MatIconModule,
    MatExpansionModule,
    MatSelectModule,
    MatTooltipModule,
    ResizerComponent,
    FileTreeNodeComponent,
    FolderTreeNodeComponent,
    TrendChartComponent,
    TrendMetricsCardComponent,
    RecentCommitsTableComponent,
    FolderFileItemComponent,
    FileNamePipe,
  ],
  templateUrl: './trend-analysis.component.html',
  styleUrl: './trend-analysis.component.css',
})
export class TrendAnalysisComponent {
  protected fileTreeStore = inject(FileTreeStore);
  private dialog = inject(MatDialog);

  leftPanelWidth = signal(350);
  showLeftPanel = signal(true);

  levelAccessor = (node: FlatFileTreeNode): number => {
    return node?.level || 0;
  };

  trackByNode = (index: number, node: FlatFileTreeNode): string => {
    return node?.fullPath || node?.name || `${index}`;
  };

  isExpandable = (node: FileTreeNode): boolean => {
    return !!node?.children && node.children.length > 0;
  };

  isExpanded = (node: FileTreeNode): boolean => {
    const fullPath = node?.fullPath || node?.name;
    const expanded = this.fileTreeStore.expandedNodes();
    return expanded.has(fullPath);
  };

  // Tree node predicates
  isFile = (_index: number, node: FileTreeNode): boolean => {
    return node?.isFile === true;
  };

  isFolder = (_index: number, node: FileTreeNode): boolean => {
    return node?.isFile === false;
  };

  selectNode(node: FileTreeNode): void {
    if (node.isFile) {
      this.fileTreeStore.selectFile(node.fullPath || node.name);
    } else {
      this.fileTreeStore.selectFolder(node.fullPath || node.name);
    }
  }

  selectFileFromPath(path: string): void {
    this.fileTreeStore.expandPathToFile(path);
    this.fileTreeStore.selectFile(path);
  }

  clearSelection(): void {
    this.fileTreeStore.clearSelections();
  }

  openXRayDialog(): void {
    const filePath = this.fileTreeStore.selectedFile();
    if (filePath) {
      this.dialog.open(XRayDialogComponent, {
        data: { filePath },
        width: '90vw',
        maxWidth: '900px',
        maxHeight: '80vh',
        autoFocus: false,
      });
    }
  }

  openHotspotsDialog(): void {
    this.dialog.open(HotspotsDialogComponent, {
      width: '90vw',
      maxWidth: '900px',
      maxHeight: '80vh',
      autoFocus: false,
    });
  }

  toggleLeftPanel(): void {
    this.showLeftPanel.update((visible) => !visible);
  }
}

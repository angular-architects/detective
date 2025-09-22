import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogModule,
  MatDialogRef,
  MatDialog,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

import { FileTreeStore } from '../file-tree.store';
import { XRayDialogComponent } from '../x-ray/x-ray-dialog.component';

@Component({
  selector: 'app-hotspots-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
  ],
  template: `
    <div class="hotspots-dialog">
      <div mat-dialog-title class="dialog-header">
        <div class="title-content">
          <mat-icon>whatshot</mat-icon>
          <span>Top 10 Complexity Spikes</span>
        </div>
        <button mat-icon-button (click)="close()" class="close-button">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div mat-dialog-content class="dialog-content">
        <mat-tab-group>
          <mat-tab label="Complexity">
            <div class="list">
              <div class="row header">
                <div class="cell path">File</div>
                <div class="cell delta">Δ Complexity</div>
              </div>
              @for (item of topComplexity(); track item.filePath) {
              <div class="row clickable" (click)="openXRay(item.filePath)">
                <div class="cell path" [title]="item.filePath">
                  {{ item.filePath }}
                </div>
                <div class="cell delta">
                  {{ item.delta | number : '1.0-2' }}
                </div>
              </div>
              }
            </div>
          </mat-tab>
          <mat-tab label="LOC">
            <div class="list">
              <div class="row header">
                <div class="cell path">File</div>
                <div class="cell delta">Δ LOC</div>
              </div>
              @for (item of topSize(); track item.filePath) {
              <div class="row clickable" (click)="openXRay(item.filePath)">
                <div class="cell path" [title]="item.filePath">
                  {{ item.filePath }}
                </div>
                <div class="cell delta">{{ item.delta | number }}</div>
              </div>
              }
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [
    `
      .hotspots-dialog {
        width: 100%;
        max-width: 900px;
        max-height: 80vh;
      }

      .dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 0;
        padding: 16px 24px;
        border-bottom: 1px solid #e0e0e0;
      }

      .title-content {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 18px;
        font-weight: 500;
      }

      .close-button {
        margin-left: auto;
      }

      .dialog-content {
        padding: 16px 0 0 0;
        margin: 0;
        max-height: 70vh;
        overflow-y: auto;
      }

      .list {
        display: grid;
        grid-template-columns: 1fr;
        gap: 8px;
        padding: 16px;
      }

      .row {
        display: grid;
        grid-template-columns: 1fr 140px;
        align-items: center;
        gap: 16px;
        padding: 8px 12px;
        border-bottom: 1px solid #eee;
      }

      .row.clickable {
        cursor: pointer;
      }

      .row.header {
        position: sticky;
        top: 0;
        background: #fafafa;
        border-bottom: 1px solid #e0e0e0;
        font-weight: 600;
        z-index: 1;
      }

      .cell.path {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
          'Liberation Mono', 'Courier New', monospace;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .cell.delta {
        text-align: right;
      }
    `,
  ],
})
export class HotspotsDialogComponent {
  private dialogRef = inject(MatDialogRef<HotspotsDialogComponent>);
  private dialog = inject(MatDialog);
  protected fileTreeStore = inject(FileTreeStore);

  protected topComplexity = computed(() =>
    this.fileTreeStore.topComplexityIncreases()
  );
  protected topSize = computed(() => this.fileTreeStore.topSizeIncreases());

  close(): void {
    this.dialogRef.close();
  }

  openXRay(filePath: string): void {
    if (!filePath) return;
    this.dialog.open(XRayDialogComponent, {
      data: { filePath },
      width: '90vw',
      maxWidth: '900px',
      maxHeight: '80vh',
      autoFocus: false,
    });
    this.close();
  }
}

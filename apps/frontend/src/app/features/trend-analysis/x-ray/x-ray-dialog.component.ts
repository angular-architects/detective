import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { FileNamePipe } from '../../../ui/file-name.pipe';

import { XRayComponent } from './x-ray.component';
import { XRayStore } from './x-ray.store';

@Component({
  selector: 'app-x-ray-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    FileNamePipe,
    XRayComponent,
  ],
  providers: [XRayStore],
  template: `
    <div class="x-ray-dialog">
      <div mat-dialog-title class="dialog-header">
        <div class="title-content">
          <mat-icon>analytics</mat-icon>
          <span>X-Ray Code Analysis</span>
          <span class="file-name" [title]="data.filePath">{{
            data.filePath | fileName
          }}</span>
        </div>
        <button mat-icon-button (click)="close()" class="close-button">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div mat-dialog-content class="dialog-content">
        <app-x-ray [filePath]="data.filePath"></app-x-ray>
      </div>
    </div>
  `,
  styles: [
    `
      .x-ray-dialog {
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

      .file-name {
        font-size: 14px;
        font-weight: 400;
        color: rgba(0, 0, 0, 0.6);
        margin-left: 8px;
      }

      .close-button {
        margin-left: auto;
      }

      .dialog-content {
        padding: 0;
        margin: 0;
        max-height: 70vh;
        overflow-y: auto;
      }
    `,
  ],
})
export class XRayDialogComponent {
  private dialogRef = inject(MatDialogRef<XRayDialogComponent>);
  protected data = inject<{ filePath: string }>(MAT_DIALOG_DATA);

  close(): void {
    this.dialogRef.close();
  }
}

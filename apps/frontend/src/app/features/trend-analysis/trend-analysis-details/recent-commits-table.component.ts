import { Component, input, computed } from '@angular/core';
import { MatTableModule } from '@angular/material/table';

import { CommitMetric } from '../../../model/trend-analysis-result';

export interface CommitData {
  commitHash: string;
  date: string;
  author: string;
  message: string;
  linesAdded: number;
  linesRemoved: number;
  complexity: number;
  totalLines: number;
}

@Component({
  selector: 'app-recent-commits-table',
  standalone: true,
  imports: [MatTableModule],
  template: `
    <div class="commits-section">
      <h4>Recent Commits</h4>
      <div class="commits-table">
        <mat-table [dataSource]="displayCommits()" class="commits-table">
          <ng-container matColumnDef="commit">
            <mat-header-cell *matHeaderCellDef>Commit</mat-header-cell>
            <mat-cell *matCellDef="let commit">{{
              commit.commitHash
            }}</mat-cell>
          </ng-container>

          <ng-container matColumnDef="date">
            <mat-header-cell *matHeaderCellDef>Date</mat-header-cell>
            <mat-cell *matCellDef="let commit">{{
              formatDate(commit.date)
            }}</mat-cell>
          </ng-container>

          <ng-container matColumnDef="author">
            <mat-header-cell *matHeaderCellDef>Author</mat-header-cell>
            <mat-cell *matCellDef="let commit">{{ commit.author }}</mat-cell>
          </ng-container>

          <ng-container matColumnDef="message">
            <mat-header-cell *matHeaderCellDef>Message</mat-header-cell>
            <mat-cell *matCellDef="let commit" class="message-cell">
              <span class="commit-message" [title]="commit.message">{{
                commit.message
              }}</span>
            </mat-cell>
          </ng-container>

          <ng-container matColumnDef="changes">
            <mat-header-cell *matHeaderCellDef>Changes</mat-header-cell>
            <mat-cell *matCellDef="let commit">
              <span class="added">+{{ commit.linesAdded }}</span>
              <span class="removed">-{{ commit.linesRemoved }}</span>
            </mat-cell>
          </ng-container>

          <ng-container matColumnDef="complexity">
            <mat-header-cell *matHeaderCellDef>Complexity</mat-header-cell>
            <mat-cell *matCellDef="let commit">{{
              commit.complexity
            }}</mat-cell>
          </ng-container>

          <ng-container matColumnDef="lines">
            <mat-header-cell *matHeaderCellDef>Lines</mat-header-cell>
            <mat-cell *matCellDef="let commit">{{
              commit.totalLines
            }}</mat-cell>
          </ng-container>

          <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
          <mat-row *matRowDef="let row; columns: displayedColumns"></mat-row>
        </mat-table>
      </div>
    </div>
  `,
  styles: [
    `
      .commits-section {
        margin-top: 32px;
      }

      .commits-section h4 {
        margin-bottom: 16px;
        font-size: 16px;
        font-weight: 600;
      }

      .commits-table {
        max-height: 400px;
        overflow: auto;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
      }

      .message-cell {
        max-width: 300px;
      }

      .commit-message {
        display: block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .added {
        color: #4caf50;
        margin-right: 8px;
      }

      .removed {
        color: #f44336;
      }
    `,
  ],
})
export class RecentCommitsTableComponent {
  commitMetrics = input<CommitMetric[]>();

  displayedColumns = [
    'commit',
    'date',
    'author',
    'message',
    'changes',
    'complexity',
    'lines',
  ];

  // Computed signal to handle different input types
  displayCommits = computed(() => {
    const rawMetrics = this.commitMetrics();
    if (rawMetrics?.length) {
      return rawMetrics;
    }

    return [];
  });

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString();
  }
}

import { Clipboard } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  untracked,
  viewChild,
} from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator } from '@angular/material/paginator';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { FlatHotspot } from '../../../model/hotspot-result';
import { getScoreTypeColor } from '../hotspot-adapter';
import { HotspotStore } from '../hotspot.store';

@Component({
  selector: 'app-hotspot-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatPaginator,
    MatProgressBar,
    MatDialogModule,
    MatIconModule,
  ],
  templateUrl: './hotspot-detail.component.html',
  styleUrl: './hotspot-detail.component.css',
})
export class HotspotDetailComponent {
  private hotspotStore = inject(HotspotStore);

  private clipboard = inject(Clipboard);
  private snackBar = inject(MatSnackBar);

  module = this.hotspotStore.filter.module;
  color = computed(() => getScoreTypeColor(this.hotspotStore.scoreType()));

  paginator = viewChild(MatPaginator);
  detailDataSource = new MatTableDataSource<FlatHotspot>();
  detailColumns = ['fileName', 'commits', 'complexity', 'score'];

  loadingAggregated = this.hotspotStore.loadingAggregated;
  loadingHotspots = this.hotspotStore.loadingHotspots;

  aggregatedResult = this.hotspotStore.aggregatedResult;
  hotspots = this.hotspotStore.hotspotsInRange;

  formattedHotspots = computed(() =>
    formatHotspots(
      this.hotspots(),
      untracked(() => this.hotspotStore.filter.module())
    )
  );

  constructor() {
    effect(() => {
      const hotspots = this.formattedHotspots();
      this.detailDataSource.data = hotspots;
    });

    effect(() => {
      const paginator = this.paginator();
      if (paginator) {
        this.detailDataSource.paginator = paginator;
      }
    });
  }

  copy(fileName: string) {
    if (this.clipboard.copy(fileName)) {
      this.snackBar.open('Filename copied to clipboard', 'Ok', {
        duration: 3000,
      });
    } else {
      console.log('Error writing to clipboard');
      this.snackBar.open(
        'Writing the filename to the clipboard did not work',
        'Ok'
      );
    }
  }
}

function formatHotspots(
  hotspot: FlatHotspot[],
  selectedModule: string
): FlatHotspot[] {
  return hotspot.map((hs) => ({
    ...hs,
    fileName: trimSegments(hs.fileName, selectedModule),
  }));
}

function trimSegments(fileName: string, prefix: string): string {
  if (fileName.startsWith(prefix)) {
    return fileName.substring(prefix.length + 1);
  }
  return fileName;
}

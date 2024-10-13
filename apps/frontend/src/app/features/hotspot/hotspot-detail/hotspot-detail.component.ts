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
import { MatPaginator } from '@angular/material/paginator';
import { MatProgressBar } from '@angular/material/progress-bar';
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
  ],
  templateUrl: './hotspot-detail.component.html',
  styleUrl: './hotspot-detail.component.css',
})
export class HotspotDetailComponent {
  private hotspotStore = inject(HotspotStore);

  module = this.hotspotStore.filter.module;
  color = computed(() => getScoreTypeColor(this.hotspotStore.scoreType()));

  paginator = viewChild(MatPaginator);
  detailDataSource = new MatTableDataSource<FlatHotspot>();
  detailColumns = ['fileName', 'commits', 'complexity', 'score'];

  loadingAggregated = this.hotspotStore.loadingAggregated;
  loadingHotspots = this.hotspotStore.loadingHotspots;

  aggregatedResult = this.hotspotStore.aggregatedResult;
  hotspotResult = this.hotspotStore.hotspotResult;

  formattedHotspots = computed(() =>
    formatHotspots(
      this.hotspotResult().hotspots,
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

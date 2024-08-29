import { Component, inject, OnInit } from '@angular/core';
import { HotspotService } from './hotspot.service';
import {
  AggregatedHotspot,
  AggregatedHotspotsResult,
  FlatHotspot,
  HotspotResult,
} from './hotspot-result';
import { MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { lastSegments } from '../utils/segments';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, debounceTime, map, startWith } from 'rxjs';
import { EventService } from '../event.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-hotspot',
  standalone: true,
  imports: [
    MatTableModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './hotspot.component.html',
  styleUrl: './hotspot.component.css',
})
export class HotspotComponent {
  private hotspotService = inject(HotspotService);
  private eventService = inject(EventService);

  minScoreControl = new FormControl(10);

  aggregatedResult: AggregatedHotspotsResult;
  dataSource = new MatTableDataSource<AggregatedHotspot>();
  detailDataSource = new MatTableDataSource<FlatHotspot>();

  hotspotResult: HotspotResult;
  selectedRow: AggregatedHotspot;
  columnsToDisplay = ['module', 'count'];
  detailColumns = ['fileName', 'commits', 'complexity', 'score'];

  selectedModule = '';

  constructor() {
    combineLatest([
      this.eventService.filterChanged.pipe(startWith(null)),
      this.minScoreControl.valueChanges.pipe(startWith(this.minScoreControl.value), debounceTime(300)),
    ])
    .pipe(takeUntilDestroyed())
    .subscribe(() => {
      console.log('changed')
      this.loadAggregated();
      if (this.selectedModule) {
        this.loadHotspots();
      }
    });
  }

  selectRow(row: AggregatedHotspot, index: number) {
    this.selectedRow = row;
    this.selectedModule = this.aggregatedResult.aggregated[index].module;

    this.loadHotspots();
  }

  formatAggregated(hotspot: AggregatedHotspot[]): AggregatedHotspot[] {
    return hotspot.map((hs) => ({
      ...hs,
      module: lastSegments(hs.module, 3),
    }));
  }

  formatHotspots(hotspot: FlatHotspot[]): FlatHotspot[] {
    return hotspot.map((hs) => ({
      ...hs,
      fileName: trimSegments(hs.fileName, this.selectedRow.module),
    }));
  }

  private loadAggregated() {
    this.hotspotService
      .loadAggregated(this.minScoreControl.value)
      .subscribe((aggregatedResult) => {
        this.aggregatedResult = aggregatedResult;
        this.dataSource.data = this.formatAggregated(
          aggregatedResult.aggregated
        );
      });
  }

  private loadHotspots() {
    this.hotspotService
      .load(this.minScoreControl.value, this.selectedModule)
      .subscribe((hotspotResult) => {
        this.hotspotResult = hotspotResult;
        this.detailDataSource.data = this.formatHotspots(
          hotspotResult.hotspots
        );
      });
  }
}

function trimSegments(fileName: string, prefix: string): string {
  if (fileName.startsWith(prefix)) {
    return fileName.substring(prefix.length + 1);
  }
  return fileName;
}
import { Component, effect, inject, signal, viewChild } from '@angular/core';
import { HotspotService } from './hotspot.service';
import {
  AggregatedHotspot,
  AggregatedHotspotsResult,
  ComplexityMetric,
  FlatHotspot,
  HotspotCriteria,
  HotspotResult,
} from './hotspot-result';
import { MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { lastSegments } from '../utils/segments';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, debounceTime, startWith } from 'rxjs';
import { EventService } from '../event.service';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { LimitsComponent } from '../ui/limits/limits.component';
import { initLimits } from '../model/limits';
import { MatSelectModule } from '@angular/material/select';
import { StatusStore } from '../data/status.store';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

type Option = {
  id: ComplexityMetric;
  label: string;
};

@Component({
  selector: 'app-hotspot',
  standalone: true,
  imports: [
    MatTableModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressBarModule,
    MatPaginatorModule,
    ReactiveFormsModule,
    LimitsComponent,
    FormsModule,
  ],
  templateUrl: './hotspot.component.html',
  styleUrl: './hotspot.component.css',
})
export class HotspotComponent {
  private hotspotService = inject(HotspotService);
  private eventService = inject(EventService);

  private statusStore = inject(StatusStore);
  totalCommits = this.statusStore.commits;

  minScoreControl = new FormControl(10);

  aggregatedResult: AggregatedHotspotsResult;
  dataSource = new MatTableDataSource<AggregatedHotspot>();
  detailDataSource = new MatTableDataSource<FlatHotspot>();

  hotspotResult: HotspotResult;
  selectedRow: AggregatedHotspot;
  columnsToDisplay = ['module', 'count'];
  detailColumns = ['fileName', 'commits', 'complexity', 'score'];

  selectedModule = '';

  limits = signal(initLimits);
  metric = signal<ComplexityMetric>('Length');

  metricOptions: Option[] = [
    { id: 'Length', label: 'File Length' },
    { id: 'McCabe', label: 'Cyclomatic Complexity' },
  ];

  loadingAggregated = signal(false);
  loadingHotspots = signal(false);

  paginator = viewChild(MatPaginator);

  constructor() {
    effect(() => {
      this.detailDataSource.paginator = this.paginator();
    });

    combineLatest([
      this.eventService.filterChanged.pipe(startWith(null)),
      this.minScoreControl.valueChanges.pipe(
        startWith(this.minScoreControl.value),
        debounceTime(300)
      ),
      toObservable(this.limits),
      toObservable(this.metric),
    ])
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
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
    const criteria: HotspotCriteria = {
      metric: this.metric(),
      minScore: this.minScoreControl.value,
      module: '',
    };

    this.loadingAggregated.set(true);

    this.hotspotService.loadAggregated(criteria, this.limits()).subscribe({
      next: (aggregatedResult) => {
        this.aggregatedResult = aggregatedResult;
        this.dataSource.data = this.formatAggregated(
          aggregatedResult.aggregated
        );
      },
      complete: () => {
        this.loadingAggregated.set(false);
      },
    });
  }

  private loadHotspots() {
    const criteria: HotspotCriteria = {
      metric: this.metric(),
      minScore: this.minScoreControl.value,
      module: this.selectedModule,
    };

    this.loadingHotspots.set(true);

    this.hotspotService.load(criteria, this.limits()).subscribe({
      next: (hotspotResult) => {
        this.hotspotResult = hotspotResult;
        this.detailDataSource.data = this.formatHotspots(
          hotspotResult.hotspots
        );
      },
      complete: () => {
        this.loadingHotspots.set(false);
      },
    });
  }
}

function trimSegments(fileName: string, prefix: string): string {
  if (fileName.startsWith(prefix)) {
    return fileName.substring(prefix.length + 1);
  }
  return fileName;
}

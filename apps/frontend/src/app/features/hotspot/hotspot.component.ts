import { Component, computed, inject } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { combineLatest, startWith } from 'rxjs';

import { LimitsStore } from '../../data/limits.store';
import { StatusStore } from '../../data/status.store';
import {
  AggregatedHotspot,
  ComplexityMetric,
} from '../../model/hotspot-result';
import { Limits } from '../../model/limits';
import { LimitsComponent } from '../../ui/limits/limits.component';
import {
  TreeMapComponent,
  TreeMapEvent,
} from '../../ui/treemap/treemap.component';
import { debounceTimeSkipFirst } from '../../utils/debounce';
import { EventService } from '../../utils/event.service';
import { lastSegments } from '../../utils/segments';
import { mirror } from '../../utils/signal-helpers';

import {
  AggregatedHotspotVM,
  ScoreType,
  toTreeMapConfig,
} from './hotspot-adapter';
import { HotspotDetailComponent } from './hotspot-detail/hotspot-detail.component';
import { HotspotStore } from './hotspot.store';

interface Option {
  id: ComplexityMetric;
  label: string;
}

@Component({
  selector: 'app-hotspot',
  standalone: true,
  imports: [
    MatTableModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    MatProgressBarModule,
    MatPaginatorModule,
    MatDialogModule,
    LimitsComponent,
    FormsModule,
    MatIconModule,
    MatTooltipModule,
    TreeMapComponent,
    MatButtonModule,
  ],
  templateUrl: './hotspot.component.html',
  styleUrl: './hotspot.component.css',
})
export class HotspotComponent {
  private statusStore = inject(StatusStore);
  private limitsStore = inject(LimitsStore);
  private hotspotStore = inject(HotspotStore);

  private eventService = inject(EventService);

  private dialog = inject(MatDialog);

  columnsToDisplay = ['module', 'count'];

  metricOptions: Option[] = [
    { id: 'Length', label: 'File Length' },
    { id: 'McCabe', label: 'Cyclomatic Complexity' },
  ];

  totalCommits = this.statusStore.commits;
  limits = this.limitsStore.limits;

  minScore = mirror(this.hotspotStore.filter.minScore);
  metric = mirror(this.hotspotStore.filter.metric);

  loadingAggregated = this.hotspotStore.loadingAggregated;
  aggregatedResult = this.hotspotStore.aggregatedResult;

  formattedAggregated = computed(() =>
    formatAggregated(this.aggregatedResult().aggregated)
  );

  treeMapConfig = computed(() => toTreeMapConfig(this.formattedAggregated()));

  constructor() {
    this.hotspotStore.resetResults();

    const loadAggregatedEvents = {
      filterChanged: this.eventService.filterChanged.pipe(startWith(null)),
      minScore: toObservable(this.minScore().value).pipe(
        debounceTimeSkipFirst(300)
      ),
      limits: toObservable(this.limits).pipe(debounceTimeSkipFirst(300)),
      metric: toObservable(this.metric().value),
    };

    const loadAggregatedOptions$ = combineLatest(loadAggregatedEvents).pipe(
      takeUntilDestroyed()
    );

    this.hotspotStore.rxLoadAggregated(loadAggregatedOptions$);
  }

  updateLimits(limits: Limits): void {
    this.limitsStore.updateLimits(limits);
  }

  selectModule(event: TreeMapEvent): void {
    const selected = event.entry as AggregatedHotspotVM;
    const selectedModule = [selected.parent, selected.module].join('/');
    const scoreRange = this.getScoreRange(selected);

    this.hotspotStore.rxLoadHotspots({
      limits: this.limits(),
      metric: this.metric().value(),
      selectedModule,
      scoreRange,
      scoreType: selected.type,
    });

    this.dialog.open(HotspotDetailComponent, {
      width: '95%',
      height: '700px',
    });
  }

  private getScoreRange(selected: AggregatedHotspotVM) {
    const range = this.getScoreBoundaries();
    const index = getScoreIndex(selected.type);

    const scoreRange = {
      from: range[index],
      to: range[index + 1],
    };
    return scoreRange;
  }

  private getScoreBoundaries() {
    const result = this.aggregatedResult();
    const range = [
      0,
      result.warningBoundary,
      result.hotspotBoundary,
      result.maxScore + 1,
    ];
    return range;
  }
}

function getScoreIndex(type: ScoreType) {
  let index = 0;
  switch (type) {
    case 'fine':
      index = 0;
      break;
    case 'warning':
      index = 1;
      break;
    case 'hotspot':
      index = 2;
      break;
  }
  return index;
}

function formatAggregated(hotspot: AggregatedHotspot[]): AggregatedHotspot[] {
  return hotspot.map((hs) => ({
    ...hs,
    module: lastSegments(hs.module, 1),
  }));
}

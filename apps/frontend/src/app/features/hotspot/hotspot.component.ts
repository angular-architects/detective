import {
  Component,
  effect,
  inject,
  Signal,
  signal,
  viewChild,
} from '@angular/core';
import { HotspotService } from '../../data/hotspot.service';
import {
  AggregatedHotspot,
  AggregatedHotspotsResult,
  ComplexityMetric,
  FlatHotspot,
  HotspotCriteria,
  HotspotResult,
  initAggregatedHotspotsResult,
  initHotspotResult,
} from '../../model/hotspot-result';
import { MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { lastSegments } from '../../utils/segments';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import {
  catchError,
  combineLatest,
  filter,
  Observable,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { EventService } from '../../utils/event.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { LimitsComponent } from '../../ui/limits/limits.component';
import { initLimits, Limits } from '../../model/limits';
import { MatSelectModule } from '@angular/material/select';
import { StatusStore } from '../../data/status.store';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { debounceTimeSkipFirst } from '../../utils/debounce';
import { injectShowError } from '../../utils/error-handler';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

interface Option {
  id: ComplexityMetric;
  label: string;
}

type LoadAggregateOptions = {
  minScore: number;
  limits: Limits;
  metric: ComplexityMetric;
};

type LoadHotspotOptions = LoadAggregateOptions & {
  selectedModule: string;
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
    LimitsComponent,
    FormsModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './hotspot.component.html',
  styleUrl: './hotspot.component.css',
})
export class HotspotComponent {
  private hotspotService = inject(HotspotService);
  private eventService = inject(EventService);

  private statusStore = inject(StatusStore);
  private showError = injectShowError();

  dataSource = new MatTableDataSource<AggregatedHotspot>();
  detailDataSource = new MatTableDataSource<FlatHotspot>();

  hotspotResult: Signal<HotspotResult>;
  aggregatedResult: Signal<AggregatedHotspotsResult>;
  selectedRow: AggregatedHotspot | null = null;

  columnsToDisplay = ['module', 'count'];
  detailColumns = ['fileName', 'commits', 'complexity', 'score'];

  totalCommits = this.statusStore.commits;
  minScoreControl = signal(10);
  limits = signal(initLimits);
  metric = signal<ComplexityMetric>('Length');

  metricOptions: Option[] = [
    { id: 'Length', label: 'File Length' },
    { id: 'McCabe', label: 'Cyclomatic Complexity' },
  ];

  selectedModule = signal('');
  loadingAggregated = signal(false);
  loadingHotspots = signal(false);

  paginator = viewChild(MatPaginator);

  constructor() {
    const loadAggregatedEvents = {
      filterChanged: this.eventService.filterChanged.pipe(startWith(null)),
      minScore: toObservable(this.minScoreControl).pipe(
        debounceTimeSkipFirst(300)
      ),
      limits: toObservable(this.limits).pipe(debounceTimeSkipFirst(300)),
      metric: toObservable(this.metric),
    };

    const loadHotspotEvent = {
      ...loadAggregatedEvents,
      selectedModule: toObservable(this.selectedModule),
    };

    const aggregated$ = combineLatest(loadAggregatedEvents).pipe(
      switchMap((combi) => this.loadAggregated(combi))
    );

    const hotspots$ = combineLatest(loadHotspotEvent).pipe(
      filter((combi) => !!combi.selectedModule),
      switchMap((combi) => this.loadHotspots(combi))
    );

    this.aggregatedResult = toSignal(aggregated$, {
      initialValue: initAggregatedHotspotsResult,
    });

    this.hotspotResult = toSignal(hotspots$, {
      initialValue: initHotspotResult,
    });

    effect(() => {
      const result = this.aggregatedResult();
      this.dataSource.data = this.formatAggregated(result.aggregated);
    });

    effect(() => {
      const result = this.hotspotResult();
      this.detailDataSource.data = this.formatHotspots(result.hotspots);
    });

    effect(() => {
      const paginator = this.paginator();
      if (paginator) {
        this.detailDataSource.paginator = paginator;
      }
    });
  }

  selectRow(row: AggregatedHotspot, index: number) {
    const selectModule = this.aggregatedResult().aggregated[index].module;
    this.selectedRow = row;
    this.selectedModule.set(selectModule);
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
      fileName: trimSegments(hs.fileName, this.selectedRow?.module || ''),
    }));
  }

  private loadAggregated(
    options: LoadAggregateOptions
  ): Observable<AggregatedHotspotsResult> {
    const criteria: HotspotCriteria = {
      metric: options.metric,
      minScore: options.minScore,
      module: '',
    };

    this.loadingAggregated.set(true);
    return this.hotspotService.loadAggregated(criteria, options.limits).pipe(
      tap(() => {
        this.loadingAggregated.set(false);
      }),
      catchError((err) => {
        this.loadingAggregated.set(false);
        this.showError(err);
        return of(initAggregatedHotspotsResult);
      })
    );
  }

  private loadHotspots(options: LoadHotspotOptions): Observable<HotspotResult> {
    const criteria: HotspotCriteria = {
      metric: options.metric,
      minScore: options.minScore,
      module: options.selectedModule,
    };

    this.loadingHotspots.set(true);

    return this.hotspotService.load(criteria, options.limits).pipe(
      tap(() => {
        this.loadingHotspots.set(false);
      }),
      catchError((err) => {
        this.loadingHotspots.set(false);
        this.showError(err);
        return of(initHotspotResult);
      })
    );
  }
}

function trimSegments(fileName: string, prefix: string): string {
  if (fileName.startsWith(prefix)) {
    return fileName.substring(prefix.length + 1);
  }
  return fileName;
}

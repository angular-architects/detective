import {
  Component,
  computed,
  effect,
  inject,
  Injector,
  Signal,
  untracked,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { combineLatest, startWith } from 'rxjs';

import { LimitsStore } from '../../data/limits.store';
import { StatusStore } from '../../data/status.store';
import {
  AggregatedHotspot,
  ComplexityMetric,
  FlatHotspot,
} from '../../model/hotspot-result';
import { Limits } from '../../model/limits';
import { LimitsComponent } from '../../ui/limits/limits.component';
import { debounceTimeSkipFirst } from '../../utils/debounce';
import { EventService } from '../../utils/event.service';
import { lastSegments } from '../../utils/segments';
import { mirror } from '../../utils/signal-helpers';

import { HotspotStore } from './hotspot.store';

interface Option {
  id: ComplexityMetric;
  label: string;
}

export type ReactiveDataSourceOptions<P extends MatPaginator> = {
  paginator?: Signal<P | undefined>;
  sort?: Signal<MatSort>;
  injector?: Injector;
};

export class ReactiveDataSource<
  T,
  P extends MatPaginator = MatPaginator
> extends MatTableDataSource<T, P> {
  constructor(source: Signal<T[]>, options?: ReactiveDataSourceOptions<P>) {
    super(source());

    let first = true;

    // TODO: Check if we need a separate effect per data, paginator, and sort
    effect(
      () => {
        const data = source();
        const paginator = options?.paginator?.();
        const sort = options?.sort?.();

        if (!first) {
          super.data = data;
        }

        if (paginator) {
          super.paginator = paginator;
        }

        if (sort) {
          super.sort = sort;
        }

        first = false;
      },
      { injector: options?.injector }
    );
  }
}

export type Action = () => void;

export function skipFirst(action: Action): Action {
  let first = true;
  return () => {
    if (!first) {
      action();
    }
    first = false;
  };
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
  private statusStore = inject(StatusStore);
  private limitsStore = inject(LimitsStore);
  private hotspotStore = inject(HotspotStore);

  private eventService = inject(EventService);

  paginator = viewChild(MatPaginator);

  columnsToDisplay = ['module', 'count'];
  detailColumns = ['fileName', 'commits', 'complexity', 'score'];

  metricOptions: Option[] = [
    { id: 'Length', label: 'File Length' },
    { id: 'McCabe', label: 'Cyclomatic Complexity' },
  ];

  totalCommits = this.statusStore.commits;
  limits = this.limitsStore.limits;

  minScore = mirror(this.hotspotStore.filter.minScore);
  metric = mirror(this.hotspotStore.filter.metric);
  selectedModule = mirror(this.hotspotStore.filter.module);

  loadingAggregated = this.hotspotStore.loadingAggregated;
  loadingHotspots = this.hotspotStore.loadingHotspots;

  aggregatedResult = this.hotspotStore.aggregatedResult;
  hotspotResult = this.hotspotStore.hotspotResult;

  formattedAggregated = computed(() =>
    formatAggregated(this.aggregatedResult().aggregated)
  );

  formattedHotspots = computed(() =>
    formatHotspots(
      this.hotspotResult().hotspots,
      untracked(() => this.selectedModule().value())
    )
  );

  detailDataSource = new ReactiveDataSource<FlatHotspot>(
    this.formattedHotspots,
    {
      paginator: this.paginator,
    }
  );

  constructor() {
    const loadAggregatedEvents = {
      filterChanged: this.eventService.filterChanged.pipe(startWith(null)),
      minScore: toObservable(this.minScore().value).pipe(
        debounceTimeSkipFirst(300)
      ),
      limits: toObservable(this.limits).pipe(debounceTimeSkipFirst(300)),
      metric: toObservable(this.metric().value),
    };

    const loadHotspotEvent = {
      ...loadAggregatedEvents,
      selectedModule: toObservable(this.selectedModule().value),
    };

    const loadAggregatedOptions$ = combineLatest(loadAggregatedEvents).pipe(
      takeUntilDestroyed()
    );

    const loadHotspotOptions$ = combineLatest(loadHotspotEvent).pipe(
      takeUntilDestroyed()
    );

    this.hotspotStore.rxLoadAggregated(loadAggregatedOptions$);
    this.hotspotStore.rxLoadHotspots(loadHotspotOptions$);

    //
    // Thanks to the ReactiveDataSource, we can get rid of these effects here:
    //
    // effect(() => {
    //   const hotspots = this.formattedHotspots();
    //   this.detailDataSource.data = hotspots;
    // });

    // effect(() => {
    //   const paginator = this.paginator();
    //   if (paginator) {
    //     this.detailDataSource.paginator = paginator;
    //   }
    // });
  }

  updateLimits(limits: Limits): void {
    this.limitsStore.updateLimits(limits);
  }

  selectRow(row: AggregatedHotspot, index: number) {
    const selectedModule = this.aggregatedResult().aggregated[index].module;
    this.selectedModule().value.set(selectedModule);
  }

  isSelected(index: number) {
    const module = this.aggregatedResult().aggregated[index].module;
    const result = module === this.selectedModule().value();
    return result;
  }
}

function formatAggregated(hotspot: AggregatedHotspot[]): AggregatedHotspot[] {
  return hotspot.map((hs) => ({
    ...hs,
    module: lastSegments(hs.module, 3),
  }));
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

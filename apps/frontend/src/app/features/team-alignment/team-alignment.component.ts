import { Component, inject, computed } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { quantize, interpolateRainbow } from 'd3';
import { combineLatest, startWith } from 'rxjs';

import { LimitsStore } from '../../data/limits.store';
import { StatusStore } from '../../data/status.store';
import { Limits } from '../../model/limits';
import { DoughnutComponent } from '../../ui/doughnut/doughnut.component';
import { LimitsComponent } from '../../ui/limits/limits.component';
import { debounceTimeSkipFirst } from '../../utils/debounce';
import { EventService } from '../../utils/event.service';

import { toAlignmentChartConfigs } from './team-alignment-chart-adapter';
import { TeamAlignmentStore } from './team-alignment.store';

@Component({
  selector: 'app-team-alignment',
  standalone: true,
  imports: [
    LimitsComponent,
    MatCheckboxModule,
    FormsModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    DoughnutComponent,
  ],
  templateUrl: './team-alignment.component.html',
  styleUrl: './team-alignment.component.css',
})
export class TeamAlignmentComponent {
  private limitsStore = inject(LimitsStore);
  private statusStore = inject(StatusStore);
  private taStore = inject(TeamAlignmentStore);

  private eventService = inject(EventService);

  totalCommits = this.statusStore.commits;
  limits = this.limitsStore.limits;
  byUser = this.taStore.filter.byUser;

  teamAlignmentResult = this.taStore.result;

  teams = this.taStore.result.teams;
  colors = computed(() => this.toColors(this.teams().length));

  loadOptions$ = combineLatest({
    limits: toObservable(this.limits).pipe(debounceTimeSkipFirst(300)),
    byUser: toObservable(this.byUser),
    filterChanged: this.eventService.filterChanged.pipe(startWith(null)),
  }).pipe(takeUntilDestroyed());

  chartConfigs = computed(() =>
    toAlignmentChartConfigs(this.teamAlignmentResult(), this.colors())
  );

  constructor() {
    this.taStore.rxLoad(this.loadOptions$);
  }

  updateLimits(limits: Limits): void {
    this.limitsStore.updateLimits(limits);
  }

  updateFilter(byUser: boolean): void {
    this.taStore.updateFilter(byUser);
  }

  private toColors(count: number): string[] {
    return quantize(interpolateRainbow, count + 1);
  }
}

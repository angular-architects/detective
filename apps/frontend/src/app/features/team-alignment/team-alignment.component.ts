import { Component, inject, signal, computed } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { quantize, interpolateRainbow } from 'd3';
import {
  combineLatest,
  startWith,
  switchMap,
  Observable,
  catchError,
  of,
} from 'rxjs';

import { StatusStore } from '../../data/status.store';
import { TeamAlignmentService } from '../../data/team-alignment.service';
import { initLimits, Limits } from '../../model/limits';
import {
  initTeamAlignmentResult,
  TeamAlignmentResult,
} from '../../model/team-alignment-result';
import { DoughnutComponent } from '../../ui/doughnut/doughnut.component';
import { LimitsComponent } from '../../ui/limits/limits.component';
import { debounceTimeSkipFirst } from '../../utils/debounce';
import { injectShowError } from '../../utils/error-handler';
import { EventService } from '../../utils/event.service';

import { toAlignmentChartConfigs } from './team-alignment-chart-adapter';

type LoadTeamAlignmentOptions = {
  limits: Limits;
  byUser: boolean;
};

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
  private taService = inject(TeamAlignmentService);
  private eventService = inject(EventService);
  private statusStore = inject(StatusStore);
  private showError = injectShowError();

  totalCommits = this.statusStore.commits;
  limits = signal(initLimits);
  byUser = signal(false);

  alignment$ = combineLatest({
    limits: toObservable(this.limits).pipe(debounceTimeSkipFirst(300)),
    byUser: toObservable(this.byUser),
    filterChanged: this.eventService.filterChanged.pipe(startWith(null)),
  }).pipe(switchMap((combi) => this.loadTeamAlignment(combi)));

  teamAlignmentResult = toSignal(this.alignment$, {
    initialValue: initTeamAlignmentResult,
  });

  teams = computed(() => this.teamAlignmentResult().teams);
  colors = computed(() => this.toColors(this.teams().length));
  chartConfigs = computed(() =>
    toAlignmentChartConfigs(this.teamAlignmentResult(), this.colors())
  );

  private toColors(count: number): string[] {
    return quantize(interpolateRainbow, count + 1);
  }

  private loadTeamAlignment(
    options: LoadTeamAlignmentOptions
  ): Observable<TeamAlignmentResult> {
    return this.taService.load(options.byUser, options.limits).pipe(
      catchError((err) => {
        this.showError(err);
        return of(initTeamAlignmentResult);
      })
    );
  }
}

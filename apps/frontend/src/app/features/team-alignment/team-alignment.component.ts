import {
  Component,
  inject,
  viewChild,
  ElementRef,
  signal,
  computed,
  effect,
  Signal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
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
import { LimitsComponent } from '../../ui/limits/limits.component';
import { debounceTimeSkipFirst } from '../../utils/debounce';
import { EventService } from '../../utils/event.service';
import {
  TeamAlignmentChart,
  drawAlignmentCharts,
} from './team-alignment-chart';
import { injectShowError } from '../../utils/error-handler';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

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
  ],
  templateUrl: './team-alignment.component.html',
  styleUrl: './team-alignment.component.css',
})
export class TeamAlignmentComponent {
  private taService = inject(TeamAlignmentService);
  private eventService = inject(EventService);
  private statusStore = inject(StatusStore);
  private showError = injectShowError();

  private containerRef = viewChild.required('container', { read: ElementRef });

  charts: TeamAlignmentChart[] = [];

  totalCommits = this.statusStore.commits;
  limits = signal(initLimits);
  byUser = signal(false);

  teamAlignmentResult: Signal<TeamAlignmentResult>;

  teams = computed(() => this.teamAlignmentResult().teams);
  colors = computed(() => this.toColors(this.teams().length));

  constructor() {
    const alignment$ = combineLatest({
      limits: toObservable(this.limits).pipe(debounceTimeSkipFirst(300)),
      byUser: toObservable(this.byUser),
      filterChanged: this.eventService.filterChanged.pipe(startWith(null)),
    }).pipe(switchMap((combi) => this.loadTeamAlignment(combi)));

    this.teamAlignmentResult = toSignal(alignment$, {
      initialValue: initTeamAlignmentResult
    });

    effect(() => {
      const result = this.teamAlignmentResult();
      const colors = this.colors();
      const containerRef = this.containerRef();
      const placeholder = containerRef.nativeElement;
      if (result) {
        this.removeCharts();
        this.charts = drawAlignmentCharts(result, placeholder, colors);
      }
    });
  }

  private toColors(count: number): string[] {
    return quantize(interpolateRainbow, count + 1);
  }

  private removeCharts(): void {
    const containerRef = this.containerRef();
    const container = containerRef.nativeElement;
    container.innerHTML = '';
    this.charts.forEach((c) => c.destroy());
  }

  private loadTeamAlignment(options: LoadTeamAlignmentOptions): Observable<TeamAlignmentResult> {
    return this.taService.load(options.byUser, options.limits).pipe(
      catchError((err) => {
        this.showError(err);
        return of(initTeamAlignmentResult);
      })
    );
  }
}

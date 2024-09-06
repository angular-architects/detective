import {
  Component,
  inject,
  viewChild,
  ElementRef,
  signal,
  computed,
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
import { explicitEffect } from '../../utils/effects';
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

  colors = signal<string[]>([]);
  teams = signal<string[]>([]);

  constructor() {
    const alignment$ = combineLatest({
      filterChanged: this.eventService.filterChanged.pipe(startWith(null)),
      limits: toObservable(this.limits).pipe(debounceTimeSkipFirst(300)),
      byUser: toObservable(this.byUser),
    }).pipe(switchMap((combi) => this.loadTeamAlignment(combi)));

    const alignmentResult = toSignal(alignment$);

    const trigger = computed(() => ({
      result: alignmentResult(),
      containerRef: this.containerRef(),
    }));

    explicitEffect(trigger, (combi) => {
      const result = combi.result;
      const placeholder = combi.containerRef.nativeElement;
      if (result) {
        const colors = quantize(interpolateRainbow, result.teams.length + 1);
        this.colors.set(colors);
        this.teams.set(result.teams);
        this.removeCharts();
        this.charts = drawAlignmentCharts(result, placeholder, colors);
      }
    });
  }

  removeCharts() {
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

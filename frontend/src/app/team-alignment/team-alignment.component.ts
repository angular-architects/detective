import {
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { TeamAlignmentService } from './team-alignment.service';
import { TeamAlignmentResult } from './team-alignment-result';
import { quantize, interpolateRainbow } from 'd3';
import { EventService } from '../event.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { LimitsComponent } from '../ui/limits/limits.component';
import { initLimits } from '../model/limits';
import { combineLatest, Observable, startWith, switchMap } from 'rxjs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { StatusStore } from '../data/status.store';
import { explicitEffect } from '../utils/explicit-effect';
import {
  drawAlignmentCharts,
  TeamAlignmentChart,
} from './team-alignment-chart';
import { debounceTimeSkipFirst } from '../utils/debounce';

@Component({
  selector: 'app-team-alignment',
  standalone: true,
  imports: [LimitsComponent, MatCheckboxModule, FormsModule],
  templateUrl: './team-alignment.component.html',
  styleUrl: './team-alignment.component.css',
})
export class TeamAlignmentComponent {
  private taService = inject(TeamAlignmentService);
  private eventService = inject(EventService);

  private statusStore = inject(StatusStore);
  private containerRef = viewChild('container', { read: ElementRef });

  charts: TeamAlignmentChart[] = [];

  totalCommits = this.statusStore.commits;
  limits = signal(initLimits);
  byUser = signal(false);

  colors = signal<string[]>([]);
  teams = signal<string[]>([]);

  constructor() {
    const alignment$ = combineLatest([
      this.eventService.filterChanged.pipe(startWith(null)),
      toObservable(this.limits).pipe(debounceTimeSkipFirst(300)),
      toObservable(this.byUser),
    ]).pipe(switchMap(() => this.loadTeamAlignment()));

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

  private loadTeamAlignment(): Observable<TeamAlignmentResult> {
    return this.taService.load(this.byUser(), this.limits());
  }
}

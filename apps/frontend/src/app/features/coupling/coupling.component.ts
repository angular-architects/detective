import { Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  catchError,
  combineLatest,
  Observable,
  of,
  startWith,
  switchMap,
} from 'rxjs';

import { CouplingService } from '../../data/coupling.service';
import { LimitsStore } from '../../data/limits.store';
import { StatusStore } from '../../data/status.store';
import {
  CouplingResult,
  initCouplingResult,
} from '../../model/coupling-result';
import { GraphType } from '../../model/graph-type';
import { initLimits, Limits, LimitType } from '../../model/limits';
import { Graph, CouplingNodeDefinition } from '../../ui/graph/graph';
import { GraphComponent } from '../../ui/graph/graph.component';
import { LimitsComponent } from '../../ui/limits/limits.component';
import { debounceTimeSkipFirst } from '../../utils/debounce';
import { injectShowError } from '../../utils/error-handler';
import { EventService } from '../../utils/event.service';

import { createGroups, createNodes, createEdges } from './graph.adapter';

const STRUCTURE_TIP =
  'Select the modules in the tree on the left to visualize them and the depencencies of their files.';
const COUPLING_TIP =
  'Change Coupling shows which files and modules have been changed together, indicating a non-obvious type of coupling.';

@Component({
  selector: 'app-coupling',
  standalone: true,
  imports: [
    MatCheckboxModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    LimitsComponent,
    MatIconModule,
    MatTooltipModule,
    GraphComponent,
  ],
  templateUrl: './coupling.component.html',
  styleUrl: './coupling.component.css',
})
export class CouplingComponent {
  private limitsStore = inject(LimitsStore);

  private couplingService = inject(CouplingService);
  private eventService = inject(EventService);
  private statusStore = inject(StatusStore);
  private showError = injectShowError();

  type = input<GraphType>('structure');
  toolTip = computed(() =>
    this.type() === 'structure' ? STRUCTURE_TIP : COUPLING_TIP
  );

  totalCommits = this.statusStore.commits;
  groupByFolder = signal(false);

  limits = this.limitsStore.limits;
  minConnections = signal(1);

  couplingResult$ = combineLatest({
    limits: toObservable(this.limits).pipe(debounceTimeSkipFirst(300)),
    filterChanged: this.eventService.filterChanged.pipe(startWith(null)),
    type: toObservable(this.type),
  }).pipe(switchMap((combi) => this.loadCoupling(combi)));

  couplingResult = toSignal(this.couplingResult$, {
    initialValue: initCouplingResult,
  });

  graph = computed(() => this.toGraph(this.couplingResult()));

  private loadCoupling(combi: {
    limits: Limits;
    filterChanged: void | null;
    type: GraphType;
  }): Observable<CouplingResult> {
    return this.couplingService.load(combi.type, combi.limits).pipe(
      catchError((err) => {
        this.showError(err);
        return of(initCouplingResult);
      })
    );
  }

  updateLimits(limits: Limits): void {
    this.limitsStore.updateLimits(limits);
  }

  toGraph(result: CouplingResult): Graph {
    result.matrix = clearSelfLinks(result.matrix);

    console.log('result', result);

    const groupNodes: CouplingNodeDefinition[] = this.groupByFolder()
      ? createGroups(result.dimensions)
      : [];

    const leafNodes = createNodes(result, groupNodes, this.type());
    const edges = createEdges(result, this.type(), this.minConnections());
    const directed = this.type() === 'structure';

    const graph: Graph = {
      nodes: [...groupNodes, ...leafNodes],
      edges,
      directed,
      groupByFolder: this.groupByFolder(),
    };

    return graph;
  }
}

function clearSelfLinks(matrix: number[][]): number[][] {
  for (let i = 0; i < matrix.length; i++) {
    matrix[i][i] = 0;
  }
  return matrix;
}

import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { CouplingService } from '../../data/coupling.service';
import { EventService } from '../../utils/event.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { GraphType } from '../../model/graph-type';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  catchError,
  combineLatest,
  Observable,
  of,
  startWith,
  switchMap,
} from 'rxjs';
import { initLimits, Limits } from '../../model/limits';
import { LimitsComponent } from '../../ui/limits/limits.component';
import { StatusStore } from '../../data/status.store';
import {
  CouplingResult,
  initCouplingResult,
} from '../../model/coupling-result';
import { drawGraph, Graph, CouplingNodeDefinition } from './graph';
import { createGroups, createNodes, createEdges } from './graph.adapter';
import { debounceTimeSkipFirst } from '../../utils/debounce';
import { injectShowError } from '../../utils/error-handler';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

const STRUCTURE_TIP =
  'Select the modules in the tree on the left to visualize them and the depencencies of their files.';
const COUPLING_TIP =
  'Change Coupling shows which files and modules have been changed together, indicating a non-obvious type of coupling.';

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [
    MatCheckboxModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    LimitsComponent,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './graph.component.html',
  styleUrl: './graph.component.css',
})
export class GraphComponent {
  private couplingService = inject(CouplingService);
  private eventService = inject(EventService);
  private statusStore = inject(StatusStore);
  private showError = injectShowError();

  private containerRef = viewChild.required('graph', { read: ElementRef });

  type = input<GraphType>('structure');
  toolTip = computed(() =>
    this.type() === 'structure' ? STRUCTURE_TIP : COUPLING_TIP
  );

  totalCommits = this.statusStore.commits;
  groupByFolder = signal(false);
  limits = signal(initLimits);
  minConnections = signal(1);

  constructor() {
    const couplingResult$ = combineLatest({
      limits: toObservable(this.limits).pipe(debounceTimeSkipFirst(300)),
      filterChanged: this.eventService.filterChanged.pipe(startWith(null)),
      type: toObservable(this.type),
    }).pipe(switchMap((combi) => this.loadCoupling(combi)));

    const couplingResult = toSignal(couplingResult$, {
      initialValue: initCouplingResult,
    });

    effect(() => {
      const result = couplingResult();
      const graph = this.toGraph(result);
      const containerRef = this.containerRef();
      const container = containerRef.nativeElement;
      drawGraph(graph, container);
    });
  }

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

  toGraph(result: CouplingResult): Graph {
    result.matrix = this.clearSelfLinks(result.matrix);

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

  private clearSelfLinks(matrix: number[][]): number[][] {
    for (let i = 0; i < matrix.length; i++) {
      matrix[i][i] = 0;
    }
    return matrix;
  }
}

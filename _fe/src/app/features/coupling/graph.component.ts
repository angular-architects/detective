import {
  Component,
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
import { combineLatest, startWith, switchMap } from 'rxjs';
import { initLimits } from '../../model/limits';
import { LimitsComponent } from '../../ui/limits/limits.component';
import { StatusStore } from '../../data/status.store';
import { CouplingResult } from '../../model/coupling-result';
import { drawGraph, Graph, CouplingNodeDefinition } from './graph';
import { createGroups, createNodes, createEdges } from './graph.adapter';
import { debounceTimeSkipFirst } from '../../utils/debounce';

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [
    MatCheckboxModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    LimitsComponent,
  ],
  templateUrl: './graph.component.html',
  styleUrl: './graph.component.css',
})
export class GraphComponent {
  private couplingService = inject(CouplingService);
  private eventService = inject(EventService);
  private statusStore = inject(StatusStore);

  private containerRef = viewChild.required('graph', { read: ElementRef });

  type = input<GraphType>('structure');

  totalCommits = this.statusStore.commits;
  groupByFolder = signal(false);
  limits = signal(initLimits);
  minConnections = signal(1);

  constructor() {
    const couplingResult$ = combineLatest({
      limits: toObservable(this.limits).pipe(debounceTimeSkipFirst(300)),
      filterChanged: this.eventService.filterChanged.pipe(startWith(null)),
      type: toObservable(this.type),
    }).pipe(
      switchMap((combi) => this.couplingService.load(combi.type, combi.limits)),
    );

    const couplingResult = toSignal(couplingResult$);

    effect(() => {
      const result = couplingResult();
      if (result) {
        const graph = this.toGraph(result);
        const containerRef = this.containerRef();
        const container = containerRef.nativeElement;
        drawGraph(graph, container);
      }
    });
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

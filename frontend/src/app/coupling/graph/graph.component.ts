import { Component, inject, input, signal } from '@angular/core';
import { CouplingService } from '../coupling.service';
import { EventService } from '../../event.service';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';

import {
  MatCheckboxModule,
} from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { GraphType } from './graph-type';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { combineLatest, startWith, switchMap } from 'rxjs';
import { initLimits } from '../../model/limits';
import { LimitsComponent } from '../../ui/limits/limits.component';
import { StatusStore } from '../../data/status.store';
import { CouplingResult } from '../coupling-result';
import { drawGraph, Graph, CustomNodeDefinition } from './graph';
import { createGroups, createNodes, createEdges } from './graph.adapter';

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
  totalCommits = this.statusStore.commits;

  type = input<GraphType>('structure');

  groupByFolder = signal(false);
  limits = signal(initLimits);
  minConnections = signal(1);

  constructor() {
    const couplingResult$ = combineLatest({
      limits: toObservable(this.limits),
      filterChanged: this.eventService.filterChanged.pipe(startWith(null)),
      type: toObservable(this.type),
    }).pipe(
      switchMap((combi) => this.couplingService.load(combi.type, combi.limits))
    );

    const localFilter$ = combineLatest({
      groupByFolder: toObservable(this.groupByFolder),
      minConnections: toObservable(this.minConnections),
    });

    combineLatest({
      couplingResult: couplingResult$,
      localFilter: localFilter$,
    })
      .pipe(takeUntilDestroyed())
      .subscribe((combi) => {
        const graph = this.toGraph(combi.couplingResult);
        const container = document.getElementById('cy');
        drawGraph(graph, container);
      });
  }

  toGraph(result: CouplingResult): Graph {
    result.matrix = this.clearSelfLinks(result.matrix);

    const groupNodes: CustomNodeDefinition[] = this.groupByFolder()
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

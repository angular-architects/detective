import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, startWith } from 'rxjs';

import { LimitsStore } from '../../data/limits.store';
import { StatusStore } from '../../data/status.store';
import { CouplingResult } from '../../model/coupling-result';
import { GraphType } from '../../model/graph-type';
import { Limits } from '../../model/limits';
import { Graph, CouplingNodeDefinition } from '../../ui/graph/graph';
import { GraphComponent } from '../../ui/graph/graph.component';
import { LimitsComponent } from '../../ui/limits/limits.component';
import { debounceTimeSkipFirst } from '../../utils/debounce';
import { EventService } from '../../utils/event.service';

import { ChordCouplingRendererComponent } from './chord-coupling-renderer.component';
import { CouplingFilter, CouplingStore } from './coupling.store';
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
    ChordCouplingRendererComponent,
  ],
  templateUrl: './coupling.component.html',
  styleUrl: './coupling.component.css',
})
export class CouplingComponent {
  showChordDiagram = signal(false);

  private previousType: GraphType | null = null;
  private statusStore = inject(StatusStore);
  private limitsStore = inject(LimitsStore);
  private couplingStore = inject(CouplingStore);

  private eventService = inject(EventService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  type = input<GraphType>('structure');

  totalCommits = this.statusStore.commits;
  limits = this.limitsStore.limits;

  groupByFolder = this.couplingStore.filter.groupByFolder;
  minConnections = this.couplingStore.filter.minConnections;

  couplingResult = this.couplingStore.couplingResult;
  graph = computed(() => this.toGraph(this.couplingResult()));

  toolTip = computed(() =>
    this.type() === 'structure' ? STRUCTURE_TIP : COUPLING_TIP
  );

  loadOptions$ = combineLatest({
    limits: toObservable(this.limits).pipe(debounceTimeSkipFirst(300)),
    filterChanged: this.eventService.filterChanged.pipe(startWith(null)),
    type: toObservable(this.type),
  }).pipe(takeUntilDestroyed());

  constructor() {
    this.couplingStore.rxLoad(this.loadOptions$);

    const qp = this.route.snapshot.queryParamMap;
    const view = qp.get('view');
    if (view === 'chord') {
      this.showChordDiagram.set(true);
    } else if (view === 'graph') {
      this.showChordDiagram.set(false);
    }
    effect(
      () => {
        const currentType = this.type();
        if (currentType !== this.previousType) {
          this.showChordDiagram.set(currentType === 'changes');
          this.previousType = currentType;
        }
      },
      { allowSignalWrites: true }
    );
  }

  onToggleView(showChord: boolean): void {
    this.showChordDiagram.set(showChord);
    const queryParams = { view: showChord ? 'chord' : 'graph' };
    this.router.navigate([], { queryParams, queryParamsHandling: 'merge' });
  }

  updateFilter(filter: Partial<CouplingFilter>) {
    this.couplingStore.updateFilter(filter);
  }

  updateLimits(limits: Limits): void {
    this.limitsStore.updateLimits(limits);
  }

  toGraph(result: CouplingResult): Graph {
    result.matrix = clearSelfLinks(result.matrix);

    const groupNodes: CouplingNodeDefinition[] = this.groupByFolder()
      ? createGroups(result.dimensions)
      : [];

    const type = this.type();
    const leafNodes = createNodes(result, groupNodes, type);
    const edges = createEdges(result, type, this.minConnections());
    const directed = type === 'structure';

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

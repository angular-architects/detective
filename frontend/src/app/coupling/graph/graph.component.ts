import { Component, inject, OnInit } from '@angular/core';
import { CouplingService } from '../coupling.service';
import { EventService } from '../../event.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import cytoscape, {
  Core,
  EdgeDefinition,
  LayoutOptions,
  NodeDefinition,
} from 'cytoscape';
import cola from 'cytoscape-cola';
import qtip from 'cytoscape-qtip';

import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';

interface CustomNodeDefinition extends NodeDefinition {
  data: {
    id: string;
    label: string;
    parent?: string;
    tooltip: string;
    dimension: string;
  };
  classes?: string;
}

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [MatCheckboxModule, FormsModule],
  templateUrl: './graph.component.html',
  styleUrl: './graph.component.css',
})
export class GraphComponent implements OnInit {
  private couplingService = inject(CouplingService);
  private eventService = inject(EventService);

  private matrix: number[][] = [[]];
  private labels: string[] = [];
  private groups: string[] = [];

  groupByFolder = false;
  fileCount: number[];
  cohesion: number[];

  constructor() {
    this.eventService.filterChanged.pipe(takeUntilDestroyed()).subscribe(() => {
      this.load();
    });
  }

  ngOnInit(): void {
    this.load();
  }

  groupByFolderChanged(event: MatCheckboxChange): void {
    this.draw();
  }

  private load() {
    this.couplingService.load().subscribe((r) => {
      this.matrix = r.matrix;
      this.clearSelfLinks();

      this.fileCount = r.fileCount;
      this.cohesion = r.cohesion;

      this.labels = r.dimensions;
      this.groups = r.groups;

      this.draw();
    });
  }

  private draw() {
    const groups: CustomNodeDefinition[] = this.groupByFolder
      ? this.createGroups()
      : [];
    const nodes: CustomNodeDefinition[] = this.createNodes(groups);
    const edges = this.createEdges();

    drawGraph([...groups, ...nodes], edges);
  }

  private createEdges() {
    const edges = [];
    for (let i = 0; i < this.matrix.length; i++) {
      for (let j = 0; j < this.matrix.length; j++) {
        if (this.matrix[i][j] > 0) {
          edges.push({
            data: {
              source: '' + i,
              target: '' + j,
              weight: this.matrix[i][j],
              tooltip: `${this.labels[i].split('/').at(-1)} → ${this.labels[j].split('/').at(-1)}<br><br>${this.matrix[i][j]} connections`,
            },
          });
        }
      }
    }
    return edges;
  }

  private createNodes(groups: CustomNodeDefinition[]) {
    const nodes: CustomNodeDefinition[] = [];

    for (let i = 0; i < this.labels.length; i++) {
      const label = this.labels[i];

      const node: CustomNodeDefinition = {
        data: {
          id: '' + i,
          label: label.split('/').at(-1),
          tooltip: `${label}
<br><br>${this.fileCount[i]} source files
<br>Cohesion: ${this.cohesion[i]}%
<br>Outgoing Deps: ${sumRow(this.matrix, i)}
<br>Incoming Deps: ${sumCol(this.matrix, i)}
`,
          dimension: label,
        },
      };

      let parent = findParent(groups, label);

      if (parent) {
        node.data.parent = parent.data.id;
      }

      nodes.push(node);
    }
    return nodes;
  }

  private createGroups() {
    const groups: CustomNodeDefinition[] = [];

    this.groups.sort();

    for (let i = 0; i < this.groups.length; i++) {
      const label = this.groups[i];

      const node: CustomNodeDefinition = {
        data: {
          id: 'G' + i,
          label: label.split('/').at(-1),
          tooltip: label,
          dimension: label,
        },
        classes: 'group',
      };

      let parent = findParent(groups, label);

      if (parent) {
        node.data.parent = parent.data.id;
      }

      groups.push(node);
    }
    return groups;
  }

  private clearSelfLinks() {
    for (let i = 0; i < this.matrix.length; i++) {
      this.matrix[i][i] = 0;
    }
  }

  prepareDimensions(dimensions: string[]): string[] {
    return dimensions.map((d) => d.split('/').at(-1));
  }
}

function findParent(groups: CustomNodeDefinition[], label: string) {
  let parent = null;
  const candParents = groups.filter((cp) =>
    label.startsWith(cp.data.dimension)
  );
  console.log('candParents', candParents);
  if (candParents.length > 0) {
    parent = candParents.reduce(
      (prev, curr) =>
        curr.data.dimension.length > prev.data.dimension.length ? curr : prev,
      candParents[0]
    );
  }
  return parent;
}

function getMinMaxWeight(cy: cytoscape.Core): [number, number] {
  const edges = cy.edges();
  const min = edges.min((e) => e.data('weight'));
  const max = edges.max((e) => e.data('weight'));
  return [min.value, max.value];
}

function drawGraph(nodes: NodeDefinition[], edges: EdgeDefinition[]) {
  cytoscape.use(cola);
  cytoscape.use(qtip);

  // Erstelle eine Instanz von Cytoscape
  const cy: Core = cytoscape({
    container: document.getElementById('cy'), // Hier muss das HTML-Element angegeben werden, in dem der Graph dargestellt wird.

    layout: {
      name: 'cola',
      padding: 10,
      nodeSpacing: 30,
      avoidOverlap: true,
      flow: { axis: 'x', minSeparation: 20 },
      fit: false,
      animate: false,
    } as LayoutOptions,

    style: [
      {
        selector: 'node',
        style: {
          shape: 'round-rectangle',
          label: 'data(label)',
          'text-valign': 'center',
          'text-halign': 'center',
          height: '20px',
          width: 'label',
          padding: '10px',
          'background-color': '#60a3bc',
          'border-color': '#1e272e',
          'border-width': 1,
          color: '#ffffff',
          'font-size': '16px',
          'min-zoomed-font-size': 8,
          'text-wrap': 'wrap',
          'text-max-width': '100px',
        },
      },
      {
        selector: 'edge',
        style: {
          width: 1,
          'line-color': '#1e272e',
          'target-arrow-color': '#1e272e',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
        },
      },
      {
        selector: '.group',
        style: {
          shape: 'round-rectangle',
          'background-color': 'rgba(255,255,255,0.5)',
          'border-color': '#1e272e',
          'border-width': 1,
          padding: '20px',
          label: 'data(label)',
          'text-valign': 'top',
          'text-halign': 'center',
          'font-size': '14px',
          'font-weight': 'bold',
          color: 'black',
        },
      },
    ],

    elements: {
      nodes,
      edges,
      //   nodes: [
      //       { data: { id: 'a', label: 'Node-A-123-456-789-100', tooltip: 'AAAA' } },
      //       { data: { id: 'b', label: 'Node B', tooltip: 'BBBB' } },
      //       { data: { id: 'group1', label: 'Group 1' }, classes: 'group' }, // Gruppe
      //       { data: { id: 'd', label: 'Node D', parent: 'group1' } }, // Knoten in Gruppe
      //       { data: { id: 'e', label: 'Node E', parent: 'group1' } }, // Knoten in Gruppe
      //       { data: { id: 'group2', label: 'Group 2' }, classes: 'group' }, // Gruppe
      //       { data: { id: 'g', label: 'Node G', parent: 'group2' } }, // Knoten in Gruppe
      //       { data: { id: 'h', label: 'Node H', parent: 'group2' } },  // Knoten in Gruppe
      //       { data: { id: 'group2-1', label: 'Group 2.1', parent:'group2' }, classes: 'group' }, // Gruppe
      //       { data: { id: 'j', label: 'Node J', parent: 'group2-1' } },  // Knoten in Gruppe
      //       { data: { id: 'k', label: 'Node K', parent: 'group2-1' } }  // Knoten in Gruppe
      //     ] as NodeDefinition[],
      //   edges: [
      //       { data: { source: 'a', target: 'b', weight: 5, tooltip: '' } },
      //       { data: { source: 'b', target: 'd', weight: 1 } },
      //       { data: { source: 'd', target: 'e', weight: 2 } },
      //       { data: { source: 'e', target: 'a', weight: 2 } },
      //       { data: { source: 'j', target: 'k', weight: 4 } },
      //       { data: { source: 'a', target: 'j', weight: 12 } },
      //       { data: { source: 'g', target: 'h', weight: 2 } },
      //   ] as EdgeDefinition[]
    },

    wheelSensitivity: 0.2,
    zoomingEnabled: true,
    userZoomingEnabled: true,
    panningEnabled: true,
    userPanningEnabled: true,
  } as any);

  cy.ready(() => {
    cy.nodes().forEach((node) => {
      const label = node.data('label');
      node.style('width', `${label.length * 10}px`); // Breite basierend auf der Beschriftung
    });

    const [min, max] = getMinMaxWeight(cy);
    const step = (max - min) / 3;
    const border1 = min + step;
    const border2 = max - step;

    cy.style()
      .selector('edge')
      .style({
        width: function (edge) {
          if (edge.data('weight') <= border1) return '1px';
          if (edge.data('weight') >= border2) return '3px';
          return '2px';
        },
      })
      .update();

    var minY = Infinity;

    var minY = Infinity;

    // Durchlaufen Sie alle Knoten und Compound Nodes (Gruppen)
    cy.nodes().forEach(function (node) {
      var position = node.boundingBox({
        includeNodes: true,
        includeEdges: false,
        includeLabels: false,
      });

      // Überprüfen Sie die obere Grenze (y1) der Bounding-Box
      if (position.y1 < minY) {
        minY = position.y1;
      }
    });

    // Den Graphen nach oben verschieben, sodass der obere Rand sichtbar ist
    cy.pan({ x: 0, y: -minY + 20 }); // Verschiebt den Graphen nach oben, +20 Pixel für zusätzlichen Puffer
  });

  cy.nodes().forEach((node: any) => {
    const tooltip = node.data('tooltip');

    if (!tooltip) return;

    node.qtip({
      content: tooltip,
      position: {
        my: 'top center',
        at: 'bottom center',
      },
      style: {
        classes: 'qtip-bootstrap',
        tip: {
          corner: true,
          mimic: 'center',
          width: 10,
          height: 10,
        },
        'z-index': 1, // Setze den z-index für den Tooltip
      },
      hide: {
        event: 'mouseout',
      },
    });
  });

  cy.edges().forEach((edge: any) => {
    const tooltip = edge.data('tooltip');

    if (!tooltip) return;

    edge.qtip({
      content: tooltip,
      position: {
        my: 'top center',
        at: 'bottom center',
      },
      style: {
        classes: 'qtip-bootstrap',
        tip: {
          corner: true,
          mimic: 'center',
          width: 10,
          height: 10,
        },
        'z-index': 1, // Setze den z-index für den Tooltip
      },
      hide: {
        event: 'mouseout',
      },
    });
  });

  //   cy.on('click', 'node', (event) => {
  //     const node = event.target;
  //     console.log(`Clicked on node with id: ${node.id()}`);
  //     alert(`You clicked on ${node.data('label')}`);
  // });
}

function sumRow(matrix: number[][], nodeIndex: number): number {
  let sum = 0;
  for (let i = 0; i < matrix.length; i++) {
    if (i !== nodeIndex) {
      sum += matrix[nodeIndex][i];
    }
  }
  return sum;
}

function sumCol(matrix: number[][], nodeIndex: number): number {
  let sum = 0;
  for (let i = 0; i < matrix.length; i++) {
    if (i !== nodeIndex) {
      sum += matrix[i][nodeIndex];
    }
  }
  return sum;
}
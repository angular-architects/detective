import { Component, inject, OnInit } from '@angular/core';
import { CouplingService } from '../coupling.service';
import { EventService } from '../../event.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import cytoscape, {
  Core,
  EdgeDefinition,
  ElementDefinition,
  LayoutOptions,
  NodeDefinition,
} from 'cytoscape';
import cola from 'cytoscape-cola';
import { MatButtonModule } from '@angular/material/button';
import { zoom } from 'd3';
import qtip from 'cytoscape-qtip';
import 'qtip2/dist/jquery.qtip.min.css'; // qTip2 CSS importieren

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './graph.component.html',
  styleUrl: './graph.component.css',
})
export class GraphComponent implements OnInit {
  private couplingService = inject(CouplingService);
  private eventService = inject(EventService);

  private matrix: number[][] = [[]];
  private labels: string[] = [];
  // private groups: string[] = [];

  ngOnInit(): void {
    this.load();
  }

  private load() {
    this.couplingService.load().subscribe((r) => {
      this.matrix = r.matrix;
      this.clearSelfLinks();

      this.labels = r.dimensions;

      const nodes = this.labels.map((label, idx) => ({
        data: {
          id: '' + idx,
          label: label.split('/').at(-1),
          tooltip: label,
        },
      }));

      console.log('nodex', nodes);

      const edges = [];
      for (let i = 0; i < this.matrix.length; i++) {
        for (let j = 0; j < this.matrix.length; j++) {
          if (this.matrix[i][j] > 0) {
            edges.push({
              data: {
                source: '' + i,
                target: '' + j,
                weight: this.matrix[i][j],
                tooltip: `${this.labels[i]} → ${this.labels[i]}`,
              },
            });
          }
        }
      }

      draw(nodes, edges);
    });
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

function getMinMaxWeight(cy: cytoscape.Core): [number, number] {
  const edges = cy.edges();
  const min = edges.min((e) => e.data('weight'));
  const max = edges.max((e) => e.data('weight'));
  return [min.value, max.value];
}

// Typdefinitionen für Nodes und Edges anpassen, um erweiterte Daten zuzulassen
interface NodeData {
  id: string;
  label: string;
  parent?: string; // Optional, da nicht alle Knoten ein Elternteil haben
}

function draw(nodes: NodeDefinition[], edges: EdgeDefinition[]) {
  cytoscape.use(cola);
  cytoscape.use(qtip);

  // Erstelle eine Instanz von Cytoscape
  const cy: Core = cytoscape({
    container: document.getElementById('cy'), // Hier muss das HTML-Element angegeben werden, in dem der Graph dargestellt wird.

    layout: {
      name: 'cola',
      padding: 10,
      nodeSpacing: 50,
      avoidOverlap: true,
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
      // nodes: [
      //     { data: { id: 'a', label: 'Node-A-123-456-789-100', tooltip: 'AAAA' } },
      //     { data: { id: 'b', label: 'Node B', tooltip: 'BBBB' } },
      //     { data: { id: 'group1', label: 'Group 1' }, classes: 'group' }, // Gruppe
      //     { data: { id: 'd', label: 'Node D', parent: 'group1' } }, // Knoten in Gruppe
      //     { data: { id: 'e', label: 'Node E', parent: 'group1' } }, // Knoten in Gruppe
      //     { data: { id: 'group2', label: 'Group 2' }, classes: 'group' }, // Gruppe
      //     { data: { id: 'g', label: 'Node G', parent: 'group2' } }, // Knoten in Gruppe
      //     { data: { id: 'h', label: 'Node H', parent: 'group2' } },  // Knoten in Gruppe
      //     { data: { id: 'group2-1', label: 'Group 2.1', parent:'group2' }, classes: 'group' }, // Gruppe
      //     { data: { id: 'j', label: 'Node J', parent: 'group2-1' } },  // Knoten in Gruppe
      //     { data: { id: 'k', label: 'Node K', parent: 'group2-1' } }  // Knoten in Gruppe
      //   ] as NodeDefinition[],
      // edges: [
      //     { data: { source: 'a', target: 'b', weight: 5, tooltip: '' } },
      //     { data: { source: 'b', target: 'd', weight: 1 } },
      //     { data: { source: 'd', target: 'e', weight: 2 } },
      //     { data: { source: 'e', target: 'a', weight: 2 } },
      //     { data: { source: 'j', target: 'k', weight: 4 } },
      //     { data: { source: 'a', target: 'j', weight: 12 } },
      //     { data: { source: 'g', target: 'h', weight: 2 } },
      // ] as EdgeDefinition[]
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
          console.log('weight', edge.data('weight'));
          console.log('border1', border1);
          console.log('border2', border2);

          //return edge.data('weight') > avgWeight ? '2px' : '1px';
          if (edge.data('weight') <= border1) return '1px';
          if (edge.data('weight') >= border2) return '3px';
          return '2px';
        },
      })
      .update();
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

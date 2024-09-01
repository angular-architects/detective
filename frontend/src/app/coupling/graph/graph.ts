import cytoscape, {
  Core,
  EdgeDefinition,
  LayoutOptions,
  NodeDefinition,
} from 'cytoscape';

import cola from 'cytoscape-cola';
import qtip from 'cytoscape-qtip';
import dagre from 'cytoscape-dagre';

import { GraphType } from './graph-type';
import { CouplingResult } from '../coupling-result';

cytoscape.use(dagre);
cytoscape.use(cola);
cytoscape.use(qtip);

export interface CustomNodeDefinition extends NodeDefinition {
  data: {
    id: string;
    label: string;
    parent?: string;
    tooltip: string;
    dimension: string;
  };
  classes?: string;
}

export type Graph = {
  nodes: CustomNodeDefinition[];
  edges: EdgeDefinition[];
  groupByFolder: boolean;
  directed: boolean;
};

export function drawGraph(graph: Graph, container: HTMLElement) {
  const cy: Core = cytoscape({
    container,

    layout: {
      name: 'dagre',
      padding: 30,
      nodeSpacing: 40,
      nodeSep: 80,
      avoidOverlap: true,
      flow: { axis: 'x', minSeparation: 50 },
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
          'target-arrow-shape': graph.directed ? 'triangle' : 'none',
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
      nodes: graph.nodes,
      edges: graph.edges,
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
        'z-index': 1,
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
        'z-index': 1,
      },
      hide: {
        event: 'mouseout',
      },
    });
  });

  centerAllNodes(cy);
}

function getMinMaxWeight(cy: cytoscape.Core): [number, number] {
  const edges = cy.edges();
  const min = edges.min((e) => e.data('weight'));
  const max = edges.max((e) => e.data('weight'));
  return [min.value, max.value];
}

function centerAllNodes(cy) {
  const boundingBox = cy.elements().boundingBox();
  const container = cy.container();

  const containerCenterX = container.clientWidth / 2;
  const containerCenterY = container.clientHeight / 2;

  const graphCenterX = (boundingBox.x1 + boundingBox.x2) / 2;
  const graphCenterY = (boundingBox.y1 + boundingBox.y2) / 2;

  const shiftX = containerCenterX - graphCenterX;
  const shiftY = containerCenterY - graphCenterY;

  cy.panBy({ x: shiftX, y: Math.max(0, shiftY - 200) });
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

import { Component, inject, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { CouplingService } from '../coupling.service';
import { EventService } from '../../event.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import * as cola from 'webcola';

interface Node {
  id: number;
  label: string;
  group: number;
  connections: number; // Anzahl der Verbindungen für den Knoten
  x?: number;
  y?: number;
}

interface Link {
  source: number;
  target: number;
  weight: number;
}

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [],
  templateUrl: './graph.component.html',
  styleUrl: './graph.component.css',
})
export class GraphComponent {
  private couplingService = inject(CouplingService);
  private eventService = inject(EventService);

  private matrix: number[][] = [[]];
  private labels: string[] = [];

  private load() {
    this.couplingService.load().subscribe((r) => {
      this.matrix = r.matrix;

      this.clearSelfLinks();

      this.labels = [...this.prepareDimensions(r.dimensions)];
      this.render();
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

  constructor() {
    this.load();

    this.eventService.filterChanged.pipe(takeUntilDestroyed()).subscribe(() => {
      d3.select('#network svg').remove();
      this.load();
    });
  }

  private render() {
    const adjMatrix = this.matrix;

    // Beispiel-Node-Bezeichnungen und Gruppenzugehörigkeiten
    const nodeLabels: string[] = this.labels;
    const nodeGroups: number[] = nodeLabels.map((_, idx) => idx);

    // Node- und Link-Interfaces

    // Nodes und Links aus den Daten erstellen
    const nodes: Node[] = nodeLabels.map((label, index) => ({
      id: index,
      label,
      group: nodeGroups[index],
      connections: 0, // Initialisierung
    }));

    const links: Link[] = [];

    // Fülle die Links und zähle die Verbindungen
    adjMatrix.forEach((row, i) => {
      row.forEach((weight, j) => {
        if (weight > 0) {
          links.push({ source: i, target: j, weight });
          nodes[i].connections++;
          nodes[j].connections++;
        }
      });
    });

    // Farben basierend auf Gruppen definieren
    const svg = innerRender(nodes, links, dragstarted, dragged, dragended);

    // Anpassung bei Größenänderung
    window.addEventListener('resize', () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      svg.attr('viewBox', `0 0 ${width} ${height}`);
      // simulation.force('center', d3.forceCenter(width / 2, height / 2));
      // simulation.alpha(1).restart();
    });

    // Dragging-Funktionen
    function dragstarted(event: any, d: any) {
      // if (!event.active) colaSimulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      // if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  }
}
function _innerRender(
  nodes: Node[],
  links: Link[],
  dragstarted: (event: any, d: any) => void,
  dragged: (event: any, d: any) => void,
  dragended: (event: any, d: any) => void
) {
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  const width = window.innerWidth;
  const height = window.innerHeight;

  // Responsive SVG-Setup
  const svg = d3
    .select('#network')
    .append('svg')
    // .attr("width", "100%")
    // .attr("height", "100%")
    .attr('viewBox', `0 0 ${width} ${height}`) // Basis-ViewBox festlegen
    .attr('preserveAspectRatio', 'xMidYMid meet');

  // Definiere die Marker für Pfeile
  svg
    .append('defs')
    .append('marker')
    .attr('id', 'arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 25) // Position des Pfeils weiter nach hinten verschoben, um den Knotenradius zu berücksichtigen
    .attr('refY', 0)
    .attr('markerWidth', 6) // Markergröße
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5') // Pfeilform
    .attr('fill', 'lack');

  // Simulation erstellen
  var colaSimulation = cola
    .d3adaptor(d3)

    .linkDistance(100)
    .size([width, height]);

  colaSimulation
    .nodes(nodes)
    .links(links)
    .jaccardLinkLengths(120) // Optional: Abstand basierend auf Jaccard-Index

    .flowLayout('y', 50) // Top-Down-Anordnung (entlang der y-Achse)
    .handleDisconnected(true)
    .avoidOverlaps(true) // Vermeidet Überlappungen
    .start();

  // Links (Kanten) hinzufügen
  const link = svg
    .append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(links)
    .enter()
    .append('line')
    .attr('stroke-width', '1px') // Kantendicke basierend auf den Verbindungen
    .attr('stroke', 'black')
    .attr('marker-end', 'url(#arrow)') // Pfeil an das Ende der Kante setzen
    .on('mouseover', function (event, d) {
      d3.select(this).attr('stroke', 'orange'); // Kante hervorheben
      tooltip.transition().duration(200).style('opacity', 0.9);
      tooltip
        .html(`${d.weight} connections`)
        .style('left', `${event.pageX}px`)
        .style('top', `${event.pageY - 28}px`);
    })
    .on('mouseout', function () {
      d3.select(this).attr('stroke', 'black'); // Hervorhebung entfernen
      tooltip.transition().duration(500).style('opacity', 0);
    });

  // Nodes (Knoten) hinzufügen
  const node = svg
    .append('g')
    .attr('class', 'nodes')
    .selectAll('circle')
    .data(nodes)
    .enter()
    .append('circle')
    .attr('r', 10)
    .attr('fill', (d) => color(d.group.toString())) // Farbe basierend auf der Gruppe
    .call(
      d3
        .drag() // Knoten bewegbar machen
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
    )
    .on('mouseover', function (event, d) {
      tooltip.transition().duration(200).style('opacity', 0.9);
      tooltip
        .html(d.label)
        .style('left', `${event.pageX}px`)
        .style('top', `${event.pageY - 28}px`);
    })
    .on('mouseout', function () {
      tooltip.transition().duration(500).style('opacity', 0);
    });

  // Node-Bezeichnungen hinzufügen
  const labels = svg
    .append('g')
    .attr('class', 'labels')
    .selectAll('text')
    .data(nodes)
    .enter()
    .append('text')
    .attr('dy', -15)
    .attr('dx', 15)
    .style('font-size', '12px')
    .text((d) => d.label);

  svg.attr('transform', 'scale(1.5)'); // Vergrößert die Ansicht um 20%

  // Tooltips
  const tooltip = d3
    .select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('z-index', 1)
    .style('text-align', 'center')
    .style('width', '60px')
    .style('height', '28px')
    .style('padding', '2px')
    .style('font', '12px sans-serif')
    .style('background', 'lightsteelblue')
    .style('border', '0px')
    .style('border-radius', '8px')
    .style('pointer-events', 'none')
    .style('opacity', 0);

  // Mit d3-cola
  colaSimulation.on('tick', () => {
    link
      .attr('x1', (d: any) => d.source.x)
      .attr('y1', (d: any) => d.source.y)
      .attr('y1', (d: any) => d.source.y)
      .attr('x2', (d: any) => d.target.x)
      .attr('y2', (d: any) => d.target.y);

    node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);

    labels.attr('x', (d) => d.x).attr('y', (d) => d.y);
  });

  return svg;
}

function innerRender(nodes, links, dragstarted, dragged, dragended) {
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  const container = d3.select('#network');

  const width = parseInt(container.style('width'));
  const height = window.innerHeight * 0.8;

  const svg = d3
    .select('#network')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .call(
      d3.zoom().on('zoom', (event) => {
        g.attr('transform', event.transform);
      })
    )
    .append('g')
    .attr(
      'transform',
      `translate(${-width * 0.25},${-height * 0.25}) scale(1.5)`
    );

  svg
    .append('defs')
    .append('marker')
    .attr('id', 'arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 10)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', 'black');

  svg
    .append('defs')
    .append('marker')
    .attr('id', 'arrow-hover')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 10)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', 'orange');

  const constraints = [];

  var colaSimulation = cola
    .d3adaptor(d3)
    .linkDistance(120)
    .handleDisconnected(true)
    .avoidOverlaps(true)
    .size([width, height]);

  colaSimulation.nodes(nodes).links(links).flowLayout('y', 80);

  // Start Cola-Simulation, dann explizit alle Ticks ausführen, um die Endpositionen zu berechnen
  colaSimulation.nodes(nodes).links(links).start();

  // for (let i = 0; i < 1000; i++) {  // Genügend Ticks, um die Simulation zur Ruhe zu bringen
  //   (colaSimulation as any).tick();
  // }

  // colaSimulation.stop();  // Simulation beenden

  const g = svg.append('g');

  // Knoten nach Gruppe gruppieren
  const groups = d3.groups(nodes, (d: any) => d.group);

  const groupContainers = g
    .selectAll('.group-container')
    .data(groups)
    .enter()
    .append('g')
    .attr('class', 'group-container');

  const link = g
    .append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(links)
    .enter()
    .append('line')
    .attr('stroke-width', '1px')
    .attr('stroke', 'black')
    .attr('marker-end', 'url(#arrow)')
    .on('mouseover', function (event, d: any) {
      tooltip.transition().duration(200).style('opacity', 0.9);
      tooltip
        .html(`Source: ${d.source.label}<br>Target: ${d.target.label}`)
        .style('left', `${event.pageX}px`)
        .style('top', `${event.pageY - 28}px`);

      d3.select(this)
        .attr('stroke', 'orange')
        .attr('marker-end', 'url(#arrow-hover)');
    })
    .on('mouseout', function () {
      tooltip.transition().duration(500).style('opacity', 0);

      d3.select(this).attr('stroke', 'black').attr('marker-end', 'url(#arrow)');
    });

  const node = g
    .append('g')
    .attr('class', 'nodes')
    .selectAll('g')
    .data(nodes)
    .enter()
    .append('g')
    .call(
      d3
        .drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
    );

  node
    .append('rect')
    .attr('width', (d: any) => d.label.length * 8) // Dynamische Breite basierend auf Label-Länge
    .attr('height', 30)
    .attr('x', (d: any) => -((d.label.length * 8) / 2)) // Zentrierung des Rechtecks
    .attr('y', -15)
    .attr('fill', '#D3D3D3')
    .attr('rx', 10)
    .attr('ry', 10);

  node
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '.35em')
    .style('font-size', '12px')
    .text((d: any) => d.label);

  const tooltip = d3
    .select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('z-index', 1)
    .style('text-align', 'center')
    .style('width', 'auto')
    .style('height', 'auto')
    .style('padding', '2px')
    .style('font', '12px sans-serif')
    .style('background', 'lightsteelblue')
    .style('border', '0px')
    .style('border-radius', '8px')
    .style('pointer-events', 'none')
    .style('opacity', 0);

  node
    .on('mouseover', function (event, d: any) {
      tooltip.transition().duration(200).style('opacity', 0.9);
      tooltip
        .html(d.label)
        .style('left', `${event.pageX}px`)
        .style('top', `${event.pageY - 28}px`);
    })
    .on('mouseout', function () {
      tooltip.transition().duration(500).style('opacity', 0);
    });

  // Umrahmende Rechtecke und Beschriftungen hinzufügen
  groupContainers.each(function ([group, nodes]) {
    const groupContainer = d3.select(this);

    // Berechne die Bounding-Box unter Berücksichtigung der Knotenbreiten
    const minX = d3.min(nodes, (d) => d.x - d.label.length * 4) - 20;
    const maxX = d3.max(nodes, (d) => d.x + d.label.length * 4) + 20;
    const minY = d3.min(nodes, (d) => d.y - 15) - 20;
    const maxY = d3.max(nodes, (d) => d.y + 15) + 20;

    // Rechteck für die Gruppe hinzufügen
    groupContainer
      .append('rect')
      .attr('x', minX)
      .attr('y', minY)
      .attr('width', maxX - minX)
      .attr('height', maxY - minY)
      .attr('fill', 'none')
      .attr('stroke', 'silver')
      .attr('stroke-width', 1);

    // Gruppennummer als Beschriftung hinzufügen
    groupContainer
      .append('text')
      .attr('x', minX + 5)
      .attr('y', minY + 15)
      .text(`Group ${group}`)
      .style('font-size', '9px')
      .style('fill', 'black');
  });

  colaSimulation.on('tick', () => {
    nodes.forEach((nodeA, i) => {
      nodes.slice(i + 1).forEach((nodeB) => {
        const dx = nodeB.x - nodeA.x;
        const dy = nodeB.y - nodeA.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const desiredDistance = 100;

        if (distance < desiredDistance) {
          const diff = (desiredDistance - distance) / distance;
          const moveX = (dx * diff) / 2;
          const moveY = (dy * diff) / 2;

          nodeA.x -= moveX;
          nodeA.y -= moveY;
          nodeB.x += moveX;
          nodeB.y += moveY;
        }
      });
    });

    link
      .attr('x1', (d: any) => d.source.x)
      .attr('y1', (d: any) => d.source.y)
      .attr('x2', (d: any) => d.target.x)
      .attr('y2', (d: any) => d.target.y - 15);

    node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);

    // Aktualisiere die Position der umschließenden Rechtecke bei jedem Ticker-Ereignis
    groupContainers.each(function ([group, nodes]) {
      const groupContainer = d3.select(this);

      const minX = d3.min(nodes, (d) => d.x - d.label.length * 4) - 20;
      const maxX = d3.max(nodes, (d) => d.x + d.label.length * 4) + 20;
      const minY = d3.min(nodes, (d) => d.y - 15) - 20;
      const maxY = d3.max(nodes, (d) => d.y + 15) + 20;

      groupContainer
        .select('rect')
        .attr('x', minX)
        .attr('y', minY)
        .attr('width', maxX - minX)
        .attr('height', maxY - minY);

      groupContainer
        .select('text')
        .attr('x', minX + 5)
        .attr('y', minY + 15);
    });
  });

  return svg;
}

function ___innerRender(nodes, links, dragstarted, dragged, dragended) {
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  const container = d3.select('#network');

  const width = parseInt(container.style('width'));
  const height = window.innerHeight * 0.8;

  const svg = d3
    .select('#network')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr(
      'transform',
      `translate(${-width * 0.25},${-height * 0.25}) scale(1.5)`
    );

  svg
    .append('defs')
    .append('marker')
    .attr('id', 'arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 10)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', 'black');

  svg
    .append('defs')
    .append('marker')
    .attr('id', 'arrow-hover')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 10)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', 'orange');

  var colaSimulation = cola
    .d3adaptor(d3)
    .size([width, height])
    .nodes(nodes)
    .links(links)
    .handleDisconnected(true)
    .avoidOverlaps(true)
    .linkDistance(250)

    .start();

  // Jetzt die Knoten und Links direkt darstellen basierend auf den finalen Positionen
  const g = svg.append('g');

  const link = g
    .append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(links)
    .enter()
    .append('line')
    .attr('stroke-width', '1px')
    .attr('stroke', 'black')
    .attr('marker-end', 'url(#arrow)')
    .attr('x1', (d: any) => d.source.x)
    .attr('y1', (d: any) => d.source.y)
    .attr('x2', (d: any) => d.target.x)
    .attr('y2', (d: any) => d.target.y);

  const node = g
    .append('g')
    .attr('class', 'nodes')
    .selectAll('g')
    .data(nodes)
    .enter()
    .append('g')
    .attr('transform', (d: any) => `translate(${d.x},${d.y})`)
    .call(
      d3
        .drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
    );

  node
    .append('rect')
    .attr('width', (d: any) => d.label.length * 8)
    .attr('height', 30)
    .attr('x', (d: any) => -((d.label.length * 8) / 2))
    .attr('y', -15)
    .attr('fill', '#D3D3D3')
    .attr('rx', 10)
    .attr('ry', 10);

  node
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '.35em')
    .style('font-size', '12px')
    .text((d: any) => d.label);

  const tooltip = d3
    .select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('z-index', 1)
    .style('text-align', 'center')
    .style('width', 'auto')
    .style('height', 'auto')
    .style('padding', '2px')
    .style('font', '12px sans-serif')
    .style('background', 'lightsteelblue')
    .style('border', '0px')
    .style('border-radius', '8px')
    .style('pointer-events', 'none')
    .style('opacity', 0);

  node
    .on('mouseover', function (event, d: any) {
      tooltip.transition().duration(200).style('opacity', 0.9);
      tooltip
        .html(d.label)
        .style('left', `${event.pageX}px`)
        .style('top', `${event.pageY - 28}px`);
    })
    .on('mouseout', function () {
      tooltip.transition().duration(500).style('opacity', 0);
    });

  // Umrahmende Rechtecke und Beschriftungen hinzufügen
  const groupContainers = g
    .selectAll('.group-container')
    .data(d3.groups(nodes, (d: any) => d.group))
    .enter()
    .append('g')
    .attr('class', 'group-container');

  groupContainers.each(function ([group, nodes]) {
    const groupContainer = d3.select(this);

    const minX = d3.min(nodes, (d: any) => d.x - d.label.length * 4) - 20;
    const maxX = d3.max(nodes, (d: any) => d.x + d.label.length * 4) + 20;
    const minY = d3.min(nodes, (d: any) => d.y - 15) - 20;
    const maxY = d3.max(nodes, (d: any) => d.y + 15) + 20;

    groupContainer
      .append('rect')
      .attr('x', minX)
      .attr('y', minY)
      .attr('width', maxX - minX)
      .attr('height', maxY - minY)
      .attr('fill', 'none')
      .attr('stroke', 'silver')
      .attr('stroke-width', 1);

    groupContainer
      .append('text')
      .attr('x', minX + 5)
      .attr('y', minY + 15)
      .text(`Group ${group}`)
      .style('font-size', '9px')
      .style('fill', 'black');
  });

  return svg;
}

function __innerRender(nodes, links, dragstarted, dragged, dragended) {
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  const container = d3.select('#network');

  const width = parseInt(container.style('width'));
  const height = window.innerHeight * 0.8;

  const svg = d3
    .select('#network')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .call(
      d3.zoom().on('zoom', (event) => {
        g.attr('transform', event.transform);
      })
    ) // Zoom-Ereignis wieder aktivieren
    .append('g')
    .attr(
      'transform',
      `translate(${-width * 0.25},${-height * 0.25}) scale(1.5)`
    );

  svg
    .append('defs')
    .append('marker')
    .attr('id', 'arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 10)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', 'black');

  svg
    .append('defs')
    .append('marker')
    .attr('id', 'arrow-hover')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 10)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', 'orange');

  var colaSimulation = cola
    .d3adaptor(d3)
    .linkDistance(150)
    .handleDisconnected(true)
    .avoidOverlaps(true)
    .size([width, height]);

  // Start Cola-Simulation, einmalige Berechnung der Positionen
  colaSimulation.nodes(nodes).links(links).start(10, 15, 20).stop();

  // Falls du D3-Forces verwenden möchtest, stoppe auch diese Simulation
  const simulation = d3
    .forceSimulation(nodes)
    .force('charge', d3.forceManyBody().strength(-500))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force(
      'collision',
      d3.forceCollide().radius((d: any) => d.label.length * 4 + 30)
    )
    .stop(); // Sofortige Stop, keine Animation

  // Jetzt die Knoten und Links direkt darstellen basierend auf den finalen Positionen
  const g = svg.append('g'); // Gruppe, die vom Zoom transformiert wird

  const link = g
    .append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(links)
    .enter()
    .append('line')
    .attr('stroke-width', '1px')
    .attr('stroke', 'black')
    .attr('marker-end', 'url(#arrow)')
    .attr('x1', (d: any) => d.source.x)
    .attr('y1', (d: any) => d.source.y)
    .attr('x2', (d: any) => d.target.x)
    .attr('y2', (d: any) => d.target.y)
    .on('mouseover', function (event, d: any) {
      tooltip.transition().duration(200).style('opacity', 0.9);
      tooltip
        .html(`Source: ${d.source.label}<br>Target: ${d.target.label}`)
        .style('left', `${event.pageX}px`)
        .style('top', `${event.pageY - 28}px`);

      d3.select(this)
        .attr('stroke', 'orange')
        .attr('marker-end', 'url(#arrow-hover)');
    })
    .on('mouseout', function () {
      tooltip.transition().duration(500).style('opacity', 0);

      d3.select(this).attr('stroke', 'black').attr('marker-end', 'url(#arrow)');
    });

  const node = g
    .append('g')
    .attr('class', 'nodes')
    .selectAll('g')
    .data(nodes)
    .enter()
    .append('g')
    .attr('transform', (d: any) => `translate(${d.x},${d.y})`)
    .call(
      d3
        .drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
    );

  node
    .append('rect')
    .attr('width', (d: any) => d.label.length * 8)
    .attr('height', 30)
    .attr('x', (d: any) => -((d.label.length * 8) / 2))
    .attr('y', -15)
    .attr('fill', '#D3D3D3')
    .attr('rx', 10)
    .attr('ry', 10);

  node
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '.35em')
    .style('font-size', '12px')
    .text((d: any) => d.label);

  const tooltip = d3
    .select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('z-index', 1)
    .style('text-align', 'center')
    .style('width', 'auto')
    .style('height', 'auto')
    .style('padding', '2px')
    .style('font', '12px sans-serif')
    .style('background', 'lightsteelblue')
    .style('border', '0px')
    .style('border-radius', '8px')
    .style('pointer-events', 'none')
    .style('opacity', 0);

  node
    .on('mouseover', function (event, d: any) {
      tooltip.transition().duration(200).style('opacity', 0.9);
      tooltip
        .html(d.label)
        .style('left', `${event.pageX}px`)
        .style('top', `${event.pageY - 28}px`);
    })
    .on('mouseout', function () {
      tooltip.transition().duration(500).style('opacity', 0);
    });

  // Umrahmende Rechtecke und Beschriftungen hinzufügen
  const groupContainers = g
    .selectAll('.group-container')
    .data(d3.groups(nodes, (d: any) => d.group))
    .enter()
    .append('g')
    .attr('class', 'group-container');

  groupContainers.each(function ([group, nodes]) {
    const groupContainer = d3.select(this);

    const minX = d3.min(nodes, (d: any) => d.x - d.label.length * 4) - 20;
    const maxX = d3.max(nodes, (d: any) => d.x + d.label.length * 4) + 20;
    const minY = d3.min(nodes, (d: any) => d.y - 15) - 20;
    const maxY = d3.max(nodes, (d: any) => d.y + 15) + 20;

    groupContainer
      .append('rect')
      .attr('x', minX)
      .attr('y', minY)
      .attr('width', maxX - minX)
      .attr('height', maxY - minY)
      .attr('fill', 'none')
      .attr('stroke', 'silver')
      .attr('stroke-width', 1);

    groupContainer
      .append('text')
      .attr('x', minX + 5)
      .attr('y', minY + 15)
      .text(`Group ${group}`)
      .style('font-size', '9px')
      .style('fill', 'black');
  });

  return svg;
}

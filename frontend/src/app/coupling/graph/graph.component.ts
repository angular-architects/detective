import { Component, inject, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { CouplingService } from '../coupling.service';
import { EventService } from '../../event.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';


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

    // Nodes und Links aus den Daten erstellen
    const nodes: Node[] = nodeLabels.map((label, index) => ({
      id: index,
      label,
      group: nodeGroups[index],
      connections: 0 // Initialisierung
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

    // Berechne den Durchschnitt und die Schwellenwerte
    const totalConnections = nodes.reduce((sum, node) => sum + node.connections, 0);
    const averageConnections = totalConnections / nodes.length;
    const lowerThreshold = averageConnections * 0.7;
    const upperThreshold = averageConnections * 1.3;

    // Funktion, um die Kantendicke basierend auf den Verbindungen zu bestimmen
    function getStrokeWidth(sourceConnections: number, targetConnections: number): number {
      const total = sourceConnections + targetConnections;
      if (total < lowerThreshold) {
        return 1; // Unterdurchschnittlich
      } else if (total > upperThreshold) {
        return 3; // Überdurchschnittlich
      } else {
        return 2; // Durchschnittlich
      }
    }

    // Farben basierend auf Gruppen definieren
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const width = window.innerWidth;
    const height = window.innerHeight;


    // Responsive SVG-Setup
    const svg = d3.select("#network").append("svg")
      // .attr("width", "100%")
      // .attr("height", "100%")
      .attr("viewBox", `0 0 ${width} ${height}`) // Basis-ViewBox festlegen
      .attr("preserveAspectRatio", "xMidYMid meet");

    // Definiere die Marker für Pfeile
    svg.append("defs").append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 25) // Position des Pfeils weiter nach hinten verschoben, um den Knotenradius zu berücksichtigen
      .attr("refY", 0)
      .attr("markerWidth", 6) // Markergröße
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5") // Pfeilform
      .attr("fill", "black");


    // Simulation erstellen
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(200))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2)); // Mittelpunkt auf Basis der ViewBox


    // Links (Kanten) hinzufügen
    const link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke-width", "1px") // Kantendicke basierend auf den Verbindungen
      .attr("stroke", "black")
      .attr("marker-end", "url(#arrow)") // Pfeil an das Ende der Kante setzen
      .on("mouseover", function (event, d) {
        d3.select(this).attr("stroke", "orange"); // Kante hervorheben
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.html(`Gewicht: ${d.weight}`)
          .style("left", `${event.pageX}px`)
          .style("top", `${event.pageY - 28}px`);
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke", "black"); // Hervorhebung entfernen
        tooltip.transition().duration(500).style("opacity", 0);
      });

    // Nodes (Knoten) hinzufügen
    const node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .attr("r", 10)
      .attr("fill", d => color(d.group.toString())) // Farbe basierend auf der Gruppe
      .call(d3.drag() // Knoten bewegbar machen
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))
      .on("mouseover", function (event, d) {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.html(d.label)
          .style("left", `${event.pageX}px`)
          .style("top", `${event.pageY - 28}px`);
      })
      .on("mouseout", function () {
        tooltip.transition().duration(500).style("opacity", 0);
      });

    // Node-Bezeichnungen hinzufügen
    const labels = svg.append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(nodes)
      .enter().append("text")
      .attr("dy", -15)
      .attr("dx", 15)
      .text(d => d.label);

    svg.attr("transform", "scale(1.5)"); // Vergrößert die Ansicht um 20%



    // Tooltips
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style('z-index', 1)
      .style("text-align", "center")
      .style("width", "60px")
      .style("height", "28px")
      .style("padding", "2px")
      .style("font", "12px sans-serif")
      .style("background", "lightsteelblue")
      .style("border", "0px")
      .style("border-radius", "8px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    // Simulation-Update
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => (d.source as Node).x)
        .attr("y1", (d: any) => (d.source as Node).y)
        .attr("x2", (d: any) => (d.target as Node).x)
        .attr("y2", (d: any) => (d.target as Node).y);

      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

      labels
        .attr("x", d => d.x)
        .attr("y", d => d.y);
    });

    // Anpassung bei Größenänderung
    window.addEventListener('resize', () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      svg.attr("viewBox", `0 0 ${width} ${height}`);
      simulation.force("center", d3.forceCenter(width / 2, height / 2));
      simulation.alpha(1).restart();
    });

    // Dragging-Funktionen
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  }
}

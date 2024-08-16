import { Component, inject, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { CouplingService } from './coupling.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-coupling',
  standalone: true,
  imports: [],
  templateUrl: './coupling.component.html',
  styleUrl: './coupling.component.css',
})
export class CouplingComponent implements OnInit {
  private width = 800;
  private height = 800;
  private innerRadius = Math.min(this.width, this.height) * 0.5 - 100;
  private outerRadius = this.innerRadius + 10;
  private svg: any;

  private couplingService = inject(CouplingService);

  private matrix: number[][] = [[]];
  private labels: string[] = [];

  constructor() {}

  ngOnInit(): void {
    this.couplingService.load().subscribe((r) => {
      this.matrix = r.matrix;
      this.labels = [...this.prepareDimensions(r.dimensions), ''];
      this.createSvg();
      this.createChordDiagram();
      window.addEventListener('resize', this.resize);
    });
  }

  prepareDimensions(dimensions: string[]): string[] {
    return dimensions.map((d) => d.split('/').at(-1));
  }
  prepareMatrix(matrix: number[][]): number[][] {
    for (let i = 0; i < matrix.length; i++) {
      matrix[i][i] = 0;
    }
    return matrix;
  }

  private createSvg(): void {
    const container = document.getElementById('chordDiagram');
    this.width = container.clientWidth;
    console.log('w,h', container.clientWidth, container.clientHeight);
    this.svg = d3
      .select('#chordDiagram')
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .classed('svg-content-responsive', true)
      .append('g')
      .attr(
        'transform',
        'translate(' + this.width / 2 + ',' + this.height / 2 + ')'
      );
  }

  private createChordDiagram(): void {
    const chord = d3.chord().padAngle(0.05).sortSubgroups(d3.descending);

    const arc = d3
      .arc()
      .innerRadius(this.innerRadius)
      .outerRadius(this.outerRadius);

    const ribbon = d3
      .ribbonArrow() // Verwende d3.ribbonArrow für Pfeileffekt
      .radius(this.innerRadius - 10); // Passe die Radius-Einstellung an

    // Verwende d3.quantize und d3.interpolateRainbow für die Farbskala
    const colors = d3.quantize(d3.interpolateRainbow, this.labels.length);
    // const color = d3.scaleOrdinal<string>()
    //   .domain(this.labels)
    //   .range(colors);

    const chords = chord(this.matrix);

    // Tooltip-Element für die Anzeige von Details
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background', '#fff')
      .style('border', '1px solid #ccc')
      .style('padding', '10px')
      .style('border-radius', '4px')
      .style('box-shadow', '0px 2px 4px rgba(0, 0, 0, 0.2)');

    const group = this.svg
      .append('g')
      .selectAll('g')
      .data(chords.groups)
      .enter()
      .append('g');

    group
      .append('path')
      .style('fill', (d, i) => colors[d.index]) // Wendet die Farbskala an
      .attr('d', arc)
      .on('click', (event, d) => {
        console.log('Knoten-Index:', d.index);
      })
      .on('mouseover', (event, d) => {
        tooltip
          .style('visibility', 'visible')
          .text(`Knoten: ${this.labels[d.index]}`);
      })
      .on('mousemove', (event) => {
        tooltip
          .style('top', event.pageY - 10 + 'px')
          .style('left', event.pageX + 10 + 'px');
      })
      .on('mouseout', () => {
        tooltip.style('visibility', 'hidden');
      });

    group
      .append('text')
      .each((d) => {
        d.angle = (d.startAngle + d.endAngle) / 2;
      })
      .attr('dy', '.35em')
      .attr(
        'transform',
        (d) => `
        rotate(${(d.angle * 180) / Math.PI - 90})
        translate(${this.outerRadius + 10})
        ${d.angle > Math.PI ? 'rotate(180)' : ''}
      `
      )
      .attr('text-anchor', (d) => (d.angle > Math.PI ? 'end' : null))
      .text((d, i) => this.labels[i]);

    //     group.append("text")
    // .each(d => { d.angle = (d.startAngle + d.endAngle) / 2; })
    // .attr("dy", ".35em")
    // .attr("x", d => Math.cos(d.angle) * (this.outerRadius + 20))
    // .attr("y", d => Math.sin(d.angle) * (this.outerRadius + 20))
    // .attr("text-anchor", d => d.angle > Math.PI / 2 && d.angle < 3 * Math.PI / 2 ? "end" : "start")
    // .style("font-size", "12px")
    // .text((d, i) => this.labels[i]);

    // group.append("text")
    // .each(d => { d.angle = (d.startAngle + d.endAngle) / 2; })
    // .attr("dy", ".35em")
    // .attr("transform", d => {
    //   // Berechne die x- und y-Positionen der Beschriftung
    //   const x = Math.cos(d.angle) * (this.outerRadius + 10);
    //   const y = Math.sin(d.angle) * (this.outerRadius + 10);
    //   return `translate(${x}, ${y})`; // Keine Rotation, nur Translation
    // })
    // .attr("text-anchor", d => {
    //   // Setze den Textanker je nach Position im Kreis
    //   return d.angle > Math.PI ? "end" : "start";
    // })
    // .style("alignment-baseline", "middle") // Mittige Ausrichtung der Texte
    // .style("font-size", "12px")
    // .text((d, i) => this.labels[i]);

    // Zeichne die Bänder (ribbons) mit Pfeileffekt
    this.svg
      .append('g')
      .attr('fill-opacity', 0.67)
      .selectAll('path')
      .data(chords)
      .enter()
      .append('path')
      .attr('d', ribbon)
      .attr('fill', (d) => colors[d.target.index])
      // .style("stroke", d => d3.rgb(color(this.labels[d.target.index])).darker())
      .on('click', (event, d) => {
        console.log(
          'Quelle-Index:',
          d.source.index,
          'Ziel-Index:',
          d.target.index
        );
        this.showContextMenu(event, d);
      })
      .on('mouseover', (event, d) => {
        d3.select(event.currentTarget)
          .style('fill-opacity', 1) // Erhöhe die Deckkraft
          .style('stroke-width', '3px') // Vergrößere die Linienbreite
          .style('cursor', 'pointer'); // Zeige einen Zeiger an

        tooltip
          .style('visibility', 'visible')
          .text(
            `From: ${this.labels[d.source.index]}, To: ${
              this.labels[d.target.index]
            }, Amount: ${this.matrix[d.source.index][d.target.index]}`
          );
      })
      .on('mousemove', (event) => {
        tooltip
          .style('top', event.pageY - 10 + 'px')
          .style('left', event.pageX + 10 + 'px');
      })
      .on('mouseout', (event) => {
        d3.select(event.currentTarget)
          .style('fill-opacity', 0.67) // Setze die Deckkraft zurück
          .style('stroke-width', '1px'); // Setze die Linienbreite zurück
        tooltip.style('visibility', 'hidden');
      });

    // Gewichtsbeschriftungen an den Kanten (manuell Zentroid berechnet)
    // this.svg
    //   .append('g')
    //   .selectAll('text')
    //   .data(chords)
    //   .enter()
    //   .append('text')
    //   .attr(
    //     'x',
    //     (d) =>
    //       ((d.source.endAngle + d.source.startAngle) / 2) * this.innerRadius
    //   )
    //   .attr(
    //     'y',
    //     (d) =>
    //       ((d.target.endAngle + d.target.startAngle) / 2) * this.innerRadius
    //   )
    //   .attr('dy', '.35em')
    //   .attr('text-anchor', 'middle')
    //   .style('fill', 'black')
    //   .text((d) => this.matrix[d.source.index][d.target.index]);
  }

  private showContextMenu(event: any, d: any): void {
    const contextMenu = d3.select('#context-menu');

    contextMenu
      .style('display', 'block')
      .style('left', `${event.pageX}px`)
      .style('top', `${event.pageY}px`);

    // Speichern von Informationen der geklickten Kante, wenn nötig
    contextMenu.datum(d);
  }

  private hideContextMenu(): void {
    d3.select('#context-menu').style('display', 'none');
  }

  private resize = () => {
    // Entferne das bestehende SVG
    d3.select('#chordDiagram').select('svg').remove();

    // Erstelle das SVG und das Diagramm neu
    this.createSvg();
    this.createChordDiagram();
  };
}

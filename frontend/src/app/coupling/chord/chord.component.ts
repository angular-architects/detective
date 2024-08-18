import { Component, inject, OnInit, ViewChild, viewChild } from '@angular/core';
import * as d3 from 'd3';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CouplingService } from '../coupling.service';
import { EventService } from '../../event.service';

@Component({
  selector: 'app-chord',
  standalone: true,
  imports: [],
  templateUrl: './chord.component.html',
  styleUrl: './chord.component.css',
})
export class ChordComponent {
  private width = 800;
  private height = 800;
  private innerRadius = Math.min(this.width, this.height) * 0.5 - 100;
  private outerRadius = this.innerRadius + 10;
  private svg: any;

  private couplingService = inject(CouplingService);
  private eventService = inject(EventService);

  private matrix: number[][] = [[]];
  private labels: string[] = [];
  private tooltip: any;

  constructor() {
    // Tooltip-Element für die Anzeige von Details
    this.tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background', '#fff')
      .style('border', '1px solid #ccc')
      .style('padding', '10px')
      .style('border-radius', '4px')
      .style('z-index', 1)
      .style('box-shadow', '0px 2px 4px rgba(0, 0, 0, 0.2)');

    this.load();
    this.eventService.filterChanged.pipe(takeUntilDestroyed()).subscribe(() => {
      d3.select('.chart-container svg').remove();
      this.load();
    });
  }

  private load() {
    this.couplingService.load().subscribe((r) => {
      this.matrix = r.matrix;
      this.labels = [...this.prepareDimensions(r.dimensions), ''];
      this.createSvg();
      this.createChordDiagram();
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
    const container = d3.select('.chart-container');

    // Setze die Breite des SVG auf die Breite des Containers
    this.width = parseInt(container.style('width'));
    this.height = this.width * 1; // Höhe basierend auf dem Verhältnis 2:1

    this.innerRadius = Math.min(this.width, this.height) * 0.5 - 100;
    this.outerRadius = this.innerRadius + 10;

    this.svg = d3
      .select('.chart-container')
      .append('svg')
      .attr('viewBox', `0 0 ${this.width} ${this.height}`)
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .append('g')
      .attr(
        'transform',
        'translate(' + this.width / 2 + ',' + this.height / 2 + ')'
      );

    this.svg
      .attr('opacity', 0) // Startzustand: Bänder sind nicht sichtbar
      .transition()
      .duration(1000)
      .delay((d, i) => i * 100)
      .attr('opacity', 1);
  }

  private createChordDiagram(): void {
    const chord = d3.chord().padAngle(0.05).sortSubgroups(d3.descending);

    const arc = d3
      .arc()
      .innerRadius(this.innerRadius)
      .outerRadius(this.outerRadius);

    const arcHover = d3
      .arc()
      .innerRadius(this.innerRadius)
      .outerRadius(this.outerRadius + 3);

    const ribbon = d3
      .ribbonArrow() // Verwende d3.ribbonArrow für Pfeileffekt
      .radius(this.innerRadius - 10); // Passe die Radius-Einstellung an

    // Verwende d3.quantize und d3.interpolateRainbow für die Farbskala
    const colors = d3.quantize(d3.interpolateRainbow, this.labels.length);
    // const color = d3.scaleOrdinal<string>()
    //   .domain(this.labels)
    //   .range(colors);

    const chords = chord(this.matrix);

    const group = this.svg
      .append('g')
      .selectAll('g')
      .data(chords.groups)
      .enter()
      .append('g');

    // Füge den Pfad hinzu und animiere ihn
    group
      .append('path')
      .style('fill', (d, i) => colors[d.index])
      .each(function (d) {
        // Speichere den ursprünglichen Endwinkel, bevor die Transition beginnt
        this._current = d;
      })
      .transition()
      .duration(1000)
      .attrTween('d', function (d) {
        const interpolate = d3.interpolate(d.startAngle, d.endAngle);
        const current = this._current; // Aktueller Zustand
        return function (t) {
          current.endAngle = interpolate(t);
          return arc(current); // Rückgabe des aktuellen Pfades
        };
      });

    // Füge die Maus-Events hinzu
    group
      .on('mouseover', (event, d) => {
        // Erstelle eine neue Transition, um die Größe des Arcs zu verändern
        d3.select(event.currentTarget)
          .select('path') // Selektiere den aktuellen Pfad
          .transition()
          .duration(200)
          .attr('d', function (d) {
            // Berechne den neuen Arc-Pfad für den Hover-Zustand
            return arcHover(d as any);
          })
          .style('cursor', 'pointer');

        // Zeige das Tooltip an
        d3.select('.tooltip')
          .style('visibility', 'visible')
          .text(`${this.labels[d.index]}`);
      })
      .on('mousemove', (event) => {
        this.tooltip
          .style('top', event.pageY - 10 + 'px')
          .style('left', event.pageX + 10 + 'px');
      })
      .on('mouseout', function (event, d) {
        // Setze den ursprünglichen Arc-Pfad zurück, wenn die Maus das Element verlässt
        d3.select(this)
          .select('path')
          .transition()
          .duration(200)
          .attr('d', function (d) {
            return arc(d as any);
          });

        // Verberge das Tooltip
        d3.select('.tooltip').style('visibility', 'hidden');
      });

    // group
    // .append('path')
    // .style('fill', (d, i) => colors[d.index]) // Wendet die Farbskala an
    // .transition() // Füge eine Transition direkt nach dem Append hinzu
    // .duration(1000) // Dauer der Transition
    // .attrTween('d', function(d) {
    //   const i = d3.interpolate(d.startAngle, d.endAngle);
    //   return function(t) {
    //     d.endAngle = i(t);
    //     return arc(d);
    //   };
    // });

    // group.on('click', (event, d) => {
    //   console.log('Knoten-Index:', d.index);
    // })
    // .on('mouseover', (event, d) => {
    //   d3.select(event.currentTarget)
    //     .attr('d', arcHover)
    //     .style('cursor', 'pointer'); // Zeige einen Zeiger an

    //   this.tooltip
    //     .style('visibility', 'visible')
    //     .text(`${this.labels[d.index]}`);
    // })
    // .on('mousemove', (event) => {
    //   this.tooltip
    //     .style('top', event.pageY - 10 + 'px')
    //     .style('left', event.pageX + 10 + 'px');
    // })
    // .on('mouseout', (event) => {
    //   d3.select(event.currentTarget).attr('d', arc);

    //   this.tooltip.style('visibility', 'hidden');
    // });

    // group

    // .transition()
    // .duration(1000)
    // .attrTween('d', d => {
    //   const interpolate = d3.interpolate(d.startAngle, d.endAngle);
    //   return t => arc({ ...d, endAngle: interpolate(t) });
    // })

    group
      .append('text')
      .each((d) => {
        d.angle = (d.startAngle + d.endAngle) / 2;
      })
      .style('font-size', '16px')
      // .attr('dy', '.35em')
      .attr(
        'transform',
        (d) => `
        rotate(${(d.angle * 180) / Math.PI - 90})
        translate(${this.outerRadius + 10})
        ${d.angle > Math.PI ? 'rotate(180)' : ''}
      `
      )
      .attr('text-anchor', (d) => (d.angle > Math.PI ? 'end' : null))
      .text((d, i) => this.labels[i])
      .on('mouseover', function (event, d) {
        d3.select(event.currentTarget)
          .style('cursor', 'pointer')
          .style('font-weight', 'bold'); // Klasse für Hover-Effekt hinzufügen
      })
      .on('mouseout', function (event, d) {
        d3.select(event.currentTarget).style('font-weight', 'normal'); // Klasse für Hover-Effekt hinzufügen
      })
      .on('click', function (event, d) {
        console.log('Sie haben auf ' + d.index + ' geklickt!');
      });

    // Zeichne die Bänder (ribbons) mit Pfeileffekt

    const r = this.svg
      .append('g')
      .attr('fill-opacity', 0.67)
      .selectAll('path')
      .data(chords)
      .enter()
      .append('path');

    r.attr('d', (d) => {
      // Startzustand: Kanten werden in einem schmalen Bereich gerendert
      const sourceCopy = { ...d.source };
      const targetCopy = { ...d.target };
      sourceCopy.endAngle = sourceCopy.startAngle;
      targetCopy.endAngle = targetCopy.startAngle;
      return ribbon({ source: sourceCopy, target: targetCopy });
    })
      .attr('fill', (d) => colors[d.target.index])
      .transition() // Füge die Transition hinzu
      .duration(1000) // Dauer der Transition
      .attrTween('d', function (d) {
        // Animations-Interpolationsfunktion für das Ribbon
        const interpolateSource = d3.interpolate(
          d.source.startAngle,
          d.source.endAngle
        );
        const interpolateTarget = d3.interpolate(
          d.target.startAngle,
          d.target.endAngle
        );
        return function (t) {
          d.source.endAngle = interpolateSource(t);
          d.target.endAngle = interpolateTarget(t);
          return ribbon(d);
        };
      });

    r.on('click', (event, d) => {
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
          .style('cursor', 'pointer');

        this.tooltip
          .style('visibility', 'visible')
          .text(
            `${this.labels[d.source.index]} -> ${
              this.labels[d.target.index]
            }, Amount: ${this.matrix[d.source.index][d.target.index]}`
          );
      })
      .on('mousemove', (event) => {
        this.tooltip
          .style('top', event.pageY - 10 + 'px')
          .style('left', event.pageX + 10 + 'px');
      })
      .on('mouseout', (event) => {
        d3.select(event.currentTarget)
          .style('fill-opacity', 0.67)
          .style('stroke-width', '1px');
        this.tooltip.style('visibility', 'hidden');
      });

    // this.svg
    //   .append('g')
    //   .attr('fill-opacity', 0.67)
    //   .selectAll('path')
    //   .data(chords)
    //   .enter()
    //   .append('path')
    //   .attr('d', ribbon)
    //   .attr('fill', (d) => colors[d.target.index])
    //   // .style("stroke", d => d3.rgb(color(this.labels[d.target.index])).darker())
    //   .on('click', (event, d) => {
    //     console.log(
    //       'Quelle-Index:',
    //       d.source.index,
    //       'Ziel-Index:',
    //       d.target.index
    //     );
    //     this.showContextMenu(event, d);
    //   })
    //   .on('mouseover', (event, d) => {
    //     d3.select(event.currentTarget)
    //       .style('fill-opacity', 1) // Erhöhe die Deckkraft
    //       .style('stroke-width', '3px') // Vergrößere die Linienbreite
    //       .style('cursor', 'pointer'); // Zeige einen Zeiger an

    //     this.tooltip
    //       .style('visibility', 'visible')
    //       .text(
    //         `${this.labels[d.source.index]} -> ${
    //           this.labels[d.target.index]
    //         }, Amount: ${this.matrix[d.source.index][d.target.index]}`
    //       );
    //   })
    //   .on('mousemove', (event) => {
    //     this.tooltip
    //       .style('top', event.pageY - 10 + 'px')
    //       .style('left', event.pageX + 10 + 'px');
    //   })
    //   .on('mouseout', (event) => {
    //     d3.select(event.currentTarget)
    //       .style('fill-opacity', 0.67) // Setze die Deckkraft zurück
    //       .style('stroke-width', '1px'); // Setze die Linienbreite zurück
    //     this.tooltip.style('visibility', 'hidden');
    //   });

    // responsivefy(this.svg);
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
}

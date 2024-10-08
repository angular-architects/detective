import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  input,
  OnChanges,
  SimpleChanges,
  viewChild,
} from '@angular/core';

import { drawGraph, Graph } from './graph';

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './graph.component.html',
  styleUrl: './graph.component.css',
})
export class GraphComponent implements OnChanges {
  graph = input.required<Graph>();
  containerRef = viewChild.required<ElementRef<HTMLElement>>('container');

  ngOnChanges(_changes: SimpleChanges): void {
    const containerRef = this.containerRef();
    const container = containerRef.nativeElement;
    drawGraph(this.graph(), container);
  }
}

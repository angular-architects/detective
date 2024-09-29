import { CommonModule } from '@angular/common';
import { Component, HostListener, model } from '@angular/core';

@Component({
  selector: 'app-resizer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resizer.component.html',
  styleUrl: './resizer.component.css',
})
export class ResizerComponent {
  minWidth = 100;
  maxWidth = 800;
  resizing = false;
  startX = 0;

  position = model(350);

  onMouseDown(event: MouseEvent) {
    this.resizing = true;
    this.startX = event.clientX;
    document.body.classList.add('resizing');
    event.preventDefault();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.resizing) {
      event.preventDefault();
      const deltaX = event.clientX - this.startX;
      const newWidth = this.position() + deltaX;
      if (newWidth >= this.minWidth && newWidth <= this.maxWidth) {
        this.position.set(newWidth);
        this.startX = event.clientX;
      }
    }
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    this.resizing = false;
    document.body.classList.remove('resizing');
  }
}

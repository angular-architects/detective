import { CommonModule } from '@angular/common';
import { afterNextRender, Component, inject, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import { XRayStore } from './x-ray.store';

@Component({
  selector: 'app-x-ray',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  providers: [XRayStore],
  templateUrl: './x-ray.component.html',
  styleUrls: ['./x-ray.component.css'],
})
export class XRayComponent {
  store = inject(XRayStore);

  filePath = input.required<string>();

  constructor() {
    afterNextRender(() => {
      this.store.load(this.filePath());
    });
  }
}

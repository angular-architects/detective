import { computed, inject, Injectable, signal } from '@angular/core';

import { initStatus } from '../model/status';

import { StatusService } from './status.service';

@Injectable({ providedIn: 'root' })
export class StatusStore {
  private statusService = inject(StatusService);

  private status = signal(initStatus);
  readonly commits = computed(() => this.status().commits);

  load(): void {
    this.statusService.loadStatus().subscribe((status) => {
      this.status.set(status);
    });
  }
}

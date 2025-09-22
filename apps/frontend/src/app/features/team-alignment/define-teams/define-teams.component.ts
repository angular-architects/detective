import { DialogRef } from '@angular/cdk/dialog';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  CdkDropListGroup,
  CdkDragHandle,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';

import { LimitsStore } from '../../../data/limits.store';

import { DefineTeamsStore, Team, User } from './define-teams.store';

@Component({
  selector: 'app-define-teams',
  standalone: true,
  imports: [
    CommonModule,
    CdkDropListGroup,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    MatButtonModule,
    MatIcon,
    MatDialogModule,
  ],
  templateUrl: './define-teams.component.html',
  styleUrl: './define-teams.component.css',
  providers: [DefineTeamsStore],
})
export class DefineTeamsComponent implements OnInit {
  protected store = inject(DefineTeamsStore);
  protected editing?: string;
  private doneAutoFocus = false;

  private limitsStore = inject(LimitsStore);

  dialogRef = inject(DialogRef);

  ngOnInit() {
    this.store.load(this.limitsStore.limits);
  }

  droppedOnTeam(dragDropEvent: CdkDragDrop<Team, Team, User>) {
    const to = dragDropEvent.container.data;
    const from = dragDropEvent.previousContainer.data;
    const user = dragDropEvent.item.data;

    if (!user || !from?.name || !to?.name || from.name === to.name) {
      return;
    }

    this.store.removeFromTeam(from, user);
    this.store.addToTeam(to, user);
  }

  autoFocusOnce(event: MouseEvent) {
    if (this.doneAutoFocus) {
      return;
    }
    const inputElm = event.currentTarget as HTMLInputElement;
    inputElm.focus();
    this.doneAutoFocus = true;
  }

  doRename(name: string, event: Event) {
    const inputElm = event.currentTarget as HTMLInputElement;
    const newName = inputElm.value;
    this.store.renameTeam(name, newName);
    this.editing = undefined;
    this.doneAutoFocus = false;
  }

  cancelRename() {
    this.editing = undefined;
    this.doneAutoFocus = false;
  }

  trackByUser(index: number, user: User): string {
    return user;
  }

  close(): void {
    this.dialogRef.close();
  }

  addTeam(): void {
    this.store.addTeam();

    const container = document.querySelector('.teams__list');
    if (container) {
      container.scrollTo({
        left: container.scrollWidth,
        behavior: 'smooth', // für einen weichen Scrollvorgang
      });
    }
  }
}

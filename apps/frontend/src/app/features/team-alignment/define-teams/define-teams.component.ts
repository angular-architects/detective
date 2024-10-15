import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  CdkDropListGroup,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  input,
  OnInit,
  output,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

import { Limits } from '../../../model/limits';

import { DefineTeamsStore, Team, User } from './define-teams.store';

@Component({
  selector: 'app-define-teams',
  standalone: true,
  imports: [
    CommonModule,
    CdkDropListGroup,
    CdkDropList,
    CdkDrag,
    MatButtonModule,
    MatIcon,
  ],
  templateUrl: './define-teams.component.html',
  styleUrl: './define-teams.component.css',
  providers: [DefineTeamsStore],
})
export class DefineTeamsComponent implements OnInit {
  protected store = inject(DefineTeamsStore);
  limits = input.required<Limits>();

  done = output<void>();
  protected editing?: string;

  dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  ngOnInit() {
    this.dialog().nativeElement.showModal();
    this.store.load(this.limits);
  }

  droppedOnTeam(dragDropEvent: CdkDragDrop<Team, Team, User>) {
    const to = dragDropEvent.container.data;
    const from = dragDropEvent.previousContainer.data;
    const user = dragDropEvent.item.data;

    if (!user || !from?.name || !to?.name || from.name === to.name) return;

    this.store.removeFromTeam(from, user);
    this.store.addToTeam(to, user);
  }

  private doneAutoFocus = false;
  autoFocusOnce(event: MouseEvent) {
    if (this.doneAutoFocus) return;
    const inputElm = event.currentTarget as HTMLInputElement;
    inputElm.focus();
    this.doneAutoFocus = true;
  }

  doRename(name: string, event: FocusEvent) {
    const inputElm = event.currentTarget as HTMLInputElement;
    const newName = inputElm.value;
    this.store.renameTeam(name, newName);
    this.editing = undefined;
    this.doneAutoFocus = false;
  }
}

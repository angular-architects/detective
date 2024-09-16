import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { StatusStore } from './data/status.store';
import { NavComponent } from './shell/nav/nav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  statusStore = inject(StatusStore);

  ngOnInit(): void {
    this.statusStore.load();
  }
}

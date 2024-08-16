import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CouplingComponent } from "./coupling/coupling.component";
import { NavComponent } from './nav/nav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CouplingComponent, NavComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend';
}

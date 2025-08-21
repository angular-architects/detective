import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { map, shareReplay } from 'rxjs/operators';

import { ResizerComponent } from '../../ui/resizer/resizer.component';
import { FilterTreeComponent } from '../filter-tree/filter-tree.component';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    FilterTreeComponent,
    RouterModule,
    ResizerComponent,
  ],
})
export class NavComponent {
  private breakpointObserver = inject(BreakpointObserver);

  isHandset$ = this.breakpointObserver.observe(['(max-width: 1200px)']).pipe(
    map((result) => result.matches),
    shareReplay()
  );

  isHandset = toSignal(this.isHandset$);
  sidenavWidth = signal(350);
}

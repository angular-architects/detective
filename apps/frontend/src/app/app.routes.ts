import { Routes } from '@angular/router';
import { CouplingComponent } from './features/coupling/coupling.component';
import { GraphTypeData } from './model/graph-type';
import { ensureCache } from './shell/cache.guard';
import { HotspotComponent } from './features/hotspot/hotspot.component';
import { TeamAlignmentComponent } from './features/team-alignment/team-alignment.component';
import { AboutComponent } from './shell/about/about.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'graph',
  },
  {
    path: 'graph',
    component: CouplingComponent,
    data: {
      type: 'structure',
    } as GraphTypeData,
  },
  {
    path: 'about',
    component: AboutComponent,
  },
  {
    path: '',
    canActivate: [ensureCache],
    children: [
      {
        path: 'team-alignment',
        component: TeamAlignmentComponent,
      },
      {
        path: 'hotspots',
        component: HotspotComponent,
      },
      {
        path: 'change-coupling',
        component: CouplingComponent,
        data: {
          type: 'changes',
        } as GraphTypeData,
      },
    ],
  },
];

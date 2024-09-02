import { Routes } from '@angular/router';
import { GraphComponent } from './features/coupling/graph.component';
import { GraphTypeData } from './model/graph-type';
import { ensureCache } from './utils/cache.guard';
import { HotspotComponent } from './features/hotspot/hotspot.component';
import { TeamAlignmentComponent } from './features/team-alignment/team-alignment.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'graph',
  },
  {
    path: 'graph',
    component: GraphComponent,
    data: {
      type: 'structure',
    } as GraphTypeData,
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
        component: GraphComponent,
        data: {
          type: 'changes',
        } as GraphTypeData,
      },
    ],
  },
];

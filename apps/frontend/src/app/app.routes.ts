import { Routes } from '@angular/router';

import { CouplingComponent } from './features/coupling/coupling.component';
import { HotspotComponent } from './features/hotspot/hotspot.component';
import { HotspotCityComponent } from './features/hotspot-city/hotspot-city.component';
import { TeamAlignmentComponent } from './features/team-alignment/team-alignment.component';
import { TrendAnalysisComponent } from './features/trend-analysis/trend-analysis.component';
import { GraphTypeData } from './model/graph-type';
import { AboutComponent } from './shell/about/about.component';
import { ensureCache } from './shell/cache.guard';

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
        path: 'hotspot-city',
        component: HotspotCityComponent,
      },
      {
        path: 'change-coupling',
        component: CouplingComponent,
        data: {
          type: 'changes',
        } as GraphTypeData,
      },
      {
        path: 'trend-analysis',
        component: TrendAnalysisComponent,
      },
    ],
  },
];

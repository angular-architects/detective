import { Routes } from '@angular/router';
import { ChordComponent } from './coupling/chord/chord.component';
import { GraphComponent } from './coupling/graph/graph.component';
import { TeamAlignmentComponent } from './team-alignment/team-alignment.component';
import { HotspotComponent } from './hotspot/hotspot.component';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home'
    }, 
    {
        path: 'home',
        component: ChordComponent
    },
    {
        path: 'graph',
        component: GraphComponent
    },
    {
        path: 'team-alignment',
        component: TeamAlignmentComponent
    },
    {
        path: 'hotspots',
        component: HotspotComponent
    }
];

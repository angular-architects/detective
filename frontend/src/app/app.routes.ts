import { Routes } from '@angular/router';
import { ChordComponent } from './coupling/chord/chord.component';
import { GraphComponent } from './coupling/graph/graph.component';
import { TeamAlignmentComponent } from './team-alignment/team-alignment.component';
import { HotspotComponent } from './hotspot/hotspot.component';
import { GraphType, GraphTypeData } from './coupling/graph/graph-type';
import { ensureCache } from './utils/cache.guard';

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
        component: GraphComponent,
        data: {
            type: 'structure'
        } as GraphTypeData
    },
    {
        path: '',
        canActivate: [ensureCache],
        children: [
            {
                path: 'team-alignment',
                component: TeamAlignmentComponent
            },
            {
                path: 'hotspots',
                component: HotspotComponent
            },
            {
                path: 'change-coupling',
                component: GraphComponent,
                data: {
                    type: 'changes'
                } as GraphTypeData
            }
        ]
    }
];

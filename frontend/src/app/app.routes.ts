import { Routes } from '@angular/router';
import { ChordComponent } from './coupling/chord/chord.component';
import { GraphComponent } from './coupling/graph/graph.component';

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
    }
];

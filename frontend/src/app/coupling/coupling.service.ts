import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CouplingResult } from './coupling-result';
import { GraphType } from './graph/graph-type';
import { initLimits } from '../model/limits';

@Injectable({providedIn: 'root'})
export class CouplingService {
    private http = inject(HttpClient);

    load(type: GraphType = 'structure', limits = initLimits): Observable<CouplingResult> {
        if (type === 'changes') {
            const params = { ...limits };
            return this.http.get<CouplingResult>('/api/change-coupling', { params, responseType: 'json' });
        }
        else {
            return this.http.get<CouplingResult>('/api/coupling');
        }
    }
}
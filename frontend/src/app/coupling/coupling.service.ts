import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CouplingResult } from './coupling-result';
import { GraphType } from './graph/graph-type';

@Injectable({providedIn: 'root'})
export class CouplingService {
    private http = inject(HttpClient);

    load(type: GraphType = 'structure'): Observable<CouplingResult> {

        if (type === 'changes') {
            return this.http.get<CouplingResult>('/api/change-coupling');
        }
        else {
            return this.http.get<CouplingResult>('/api/coupling');
        }
    }
}
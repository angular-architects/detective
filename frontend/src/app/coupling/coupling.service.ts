import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CouplingResult } from './coupling-result';

@Injectable({providedIn: 'root'})
export class CouplingService {
    private http = inject(HttpClient);

    load(): Observable<CouplingResult> {
        return this.http.get<CouplingResult>('/api/coupling');
    }
}
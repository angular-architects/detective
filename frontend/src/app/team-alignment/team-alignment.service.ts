import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TeamAlignmentResult } from './team-alignment-result';

@Injectable({providedIn: 'root'})
export class TeamAlignmentService {
    private http = inject(HttpClient);

    load(): Observable<TeamAlignmentResult> {
        return this.http.get<TeamAlignmentResult>('/api/team-alignment');
    }
}

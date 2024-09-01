import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TeamAlignmentResult } from './team-alignment-result';
import { Limits } from '../model/limits';

@Injectable({ providedIn: 'root' })
export class TeamAlignmentService {
  private http = inject(HttpClient);

  load(byUser: boolean, limits: Limits): Observable<TeamAlignmentResult> {
    const params = { byUser, ...limits };
    return this.http.get<TeamAlignmentResult>('/api/team-alignment', {
      params,
    });
  }
}

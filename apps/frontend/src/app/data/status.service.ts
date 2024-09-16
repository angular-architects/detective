import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Status } from '../model/status';

@Injectable({ providedIn: 'root' })
export class StatusService {
  private http = inject(HttpClient);

  loadStatus(): Observable<Status> {
    const url = `/api/status`;
    return this.http.get<Status>(url);
  }
}

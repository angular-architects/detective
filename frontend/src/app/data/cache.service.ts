import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CacheStatus } from '../model/cache-status';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CacheService {
  private http = inject(HttpClient);

  loadLogCacheStatus(): Observable<CacheStatus> {
    const url = `/api/cache/log`;
    return this.http.get<CacheStatus>(url);
  }

  updateLogCache(): Observable<void> {
    const url = `/api/cache/log/update`;
    return this.http.post<void>(url, null);
  }
}

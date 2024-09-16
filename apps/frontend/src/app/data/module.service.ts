import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ModuleInfo } from '../model/module-info';

@Injectable({ providedIn: 'root' })
export class ModuleService {
  private http = inject(HttpClient);

  load(): Observable<ModuleInfo> {
    return this.http.get<ModuleInfo>('/api/modules');
  }
}

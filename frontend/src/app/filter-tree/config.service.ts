import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Config } from './config';

@Injectable({providedIn: 'root'})
export class ConfigService {
    private http = inject(HttpClient);

    load(): Observable<Config> {
        return this.http.get<Config>('/api/config');
    }

    save(config: Config): Observable<void> {
        return this.http.post<void>('/api/config', config);
    }

}
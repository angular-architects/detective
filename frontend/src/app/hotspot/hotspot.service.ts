import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AggregatedHotspotsResult, HotspotResult } from './hotspot-result';
import { initLimits } from '../model/limits';

@Injectable({providedIn: 'root'})
export class HotspotService {
    private http = inject(HttpClient);

    load(minScore = 0, module = '', limits = initLimits): Observable<HotspotResult> {
        const url = `/api/hotspots`;
        const params = { minScore, module, ...limits }; 
        return this.http.get<HotspotResult>(url, { params });
    }

    loadAggregated(minScore = 0, limits = initLimits): Observable<AggregatedHotspotsResult> {
        const url = `/api/hotspots/aggregated`;
        const params = { minScore, ...limits }; 
        return this.http.get<AggregatedHotspotsResult>(url, { params });
    }
}
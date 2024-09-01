import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AggregatedHotspotsResult, HotspotCriteria, HotspotResult } from './hotspot-result';
import { initLimits } from '../model/limits';

@Injectable({providedIn: 'root'})
export class HotspotService {
    private http = inject(HttpClient);

    load(criteria: HotspotCriteria, limits = initLimits): Observable<HotspotResult> {
        const url = `/api/hotspots`;
        const params = { ...criteria, ...limits }; 
        return this.http.get<HotspotResult>(url, { params });
    }

    loadAggregated(criteria: HotspotCriteria, limits = initLimits): Observable<AggregatedHotspotsResult> {
        const url = `/api/hotspots/aggregated`;
        const params = { ...criteria, ...limits }; 
        return this.http.get<AggregatedHotspotsResult>(url, { params });
    }
}

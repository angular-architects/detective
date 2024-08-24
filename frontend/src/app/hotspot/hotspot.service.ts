import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AggregatedHotspotsResult, HotspotResult } from './hotspot-result';

@Injectable({providedIn: 'root'})
export class HotspotService {
    private http = inject(HttpClient);

    load(minScore = 0, module = ''): Observable<HotspotResult> {
        const url = `/api/hotspots`;
        const params = { minScore, module }; 
        return this.http.get<HotspotResult>(url, { params });
    }

    loadAggregated(minScore = 0): Observable<AggregatedHotspotsResult> {
        const url = `/api/hotspots/aggregated`;
        const params = { minScore }; 
        return this.http.get<AggregatedHotspotsResult>(url, { params });
    }
}
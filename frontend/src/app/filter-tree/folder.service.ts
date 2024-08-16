import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Folder } from './folder';

@Injectable({providedIn: 'root'})
export class FolderService {
    private http = inject(HttpClient);

    load(): Observable<Folder[]> {
        return this.http.get<Folder[]>('/api/folders');
    }
    
}
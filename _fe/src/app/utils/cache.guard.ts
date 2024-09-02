import { inject } from '@angular/core';
import { Observable, of, switchMap, tap } from 'rxjs';
import { CacheService } from '../data/cache.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LoadingComponent } from '../ui/loading/loading.component';

export function ensureCache(): Observable<void> {
  const cacheService = inject(CacheService);
  const dialog = inject(MatDialog);

  let dialogRef: MatDialogRef<LoadingComponent, unknown> | null = null;

  return cacheService.loadLogCacheStatus().pipe(
    switchMap((status) => {
      if (status.isStale) {
        dialogRef = dialog.open(LoadingComponent, {
          disableClose: true,
        });
        return cacheService.updateLogCache();
      } else {
        return of(undefined);
      }
    }),
    tap(() => {
      if (dialogRef) {
        dialogRef.close();
      }
    }),
  );
}

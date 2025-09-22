import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom, forkJoin } from 'rxjs';

import { XRayVM, buildXRayViewModel } from './x-ray.view-model';

export const XRayStore = signalStore(
  withState({
    loading: false as boolean,
    error: null as string | null,
    vm: null as XRayVM | null,
  }),
  withMethods((store, http = inject(HttpClient)) => ({
    async load(filePath: string): Promise<void> {
      patchState(store, { loading: true, error: null });

      try {
        const result$ = http.get<unknown>(
          `/api/x-ray?file=${encodeURIComponent(filePath)}`
        );
        const schemaDefault$ = http.get<unknown>('/api/x-ray/schema');
        const { result, schema } = await firstValueFrom(
          forkJoin({ result: result$, schema: schemaDefault$ })
        );
        const vm = buildXRayViewModel(result, schema);
        patchState(store, { vm, loading: false, error: null });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to load X-Ray analysis';
        patchState(store, {
          error: errorMessage,
          loading: false,
        });
      }
    },
  }))
);

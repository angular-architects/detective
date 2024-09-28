import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, Observable, of, pipe, switchMap, tap } from 'rxjs';

import { CouplingService } from '../../data/coupling.service';
import {
  CouplingResult,
  initCouplingResult,
} from '../../model/coupling-result';
import { GraphType } from '../../model/graph-type';
import { Limits } from '../../model/limits';
import { injectShowError } from '../../utils/error-handler';

export type CouplingFilter = {
  groupByFolder: boolean;
  minConnections: number;
};

export type LoadOptions = {
  type: GraphType;
  limits: Limits;
};

export const CouplingStore = signalStore(
  { providedIn: 'root' },
  withState({
    filter: {
      groupByFolder: false,
      minConnections: 1,
    } as CouplingFilter,
    couplingResult: initCouplingResult,
  }),
  withMethods(
    (
      _store,
      couplingService = inject(CouplingService),
      showError = injectShowError()
    ) => ({
      _loadCoupling(options: LoadOptions): Observable<CouplingResult> {
        return couplingService.load(options.type, options.limits).pipe(
          catchError((err) => {
            showError(err);
            return of(initCouplingResult);
          })
        );
      },
    })
  ),
  withMethods((store) => ({
    updateFilter(filter: Partial<CouplingFilter>) {
      patchState(store, (state) => ({
        filter: {
          ...state.filter,
          ...filter,
        },
      }));
    },
    rxLoad: rxMethod<LoadOptions>(
      pipe(
        switchMap((options) => store._loadCoupling(options)),
        tap((couplingResult) => patchState(store, { couplingResult }))
      )
    ),
  }))
);

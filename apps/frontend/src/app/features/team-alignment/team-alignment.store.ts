import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, Observable, of, pipe, switchMap, tap } from 'rxjs';

import { TeamAlignmentService } from '../../data/team-alignment.service';
import { Limits } from '../../model/limits';
import {
  initTeamAlignmentResult,
  TeamAlignmentResult,
} from '../../model/team-alignment-result';
import { injectShowError } from '../../utils/error-handler';

export type LoadOptions = {
  limits: Limits;
  byUser: boolean;
};

export const TeamAlignmentStore = signalStore(
  { providedIn: 'root' },
  withState({
    filter: {
      byUser: false,
    },
    result: initTeamAlignmentResult,
  }),
  withMethods(
    (
      _store,
      taService = inject(TeamAlignmentService),
      showError = injectShowError()
    ) => ({
      _loadTeamAlignment(
        options: LoadOptions
      ): Observable<TeamAlignmentResult> {
        return taService.load(options.byUser, options.limits).pipe(
          catchError((err) => {
            showError(err);
            return of(initTeamAlignmentResult);
          })
        );
      },
    })
  ),
  withMethods((store) => ({
    updateFilter(byUser: boolean) {
      patchState(store, { filter: { byUser } });
    },
    rxLoad: rxMethod<LoadOptions>(
      pipe(
        switchMap((combi) => store._loadTeamAlignment(combi)),
        tap((result) => patchState(store, { result }))
      )
    ),
  }))
);

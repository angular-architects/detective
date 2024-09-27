import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

import { initLimits, Limits } from '../model/limits';

export const LimitsStore = signalStore(
  { providedIn: 'root' },
  withState({
    limits: initLimits,
  }),
  withMethods((store) => ({
    updateLimits(limits: Limits) {
      patchState(store, { limits });
    },
  }))
);

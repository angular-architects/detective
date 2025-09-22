import { computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  patchState,
  signalStore,
  withMethods,
  withState,
  withHooks,
  withComputed,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { forkJoin, map, tap, switchMap, startWith, scan } from 'rxjs';

import { ConfigService } from '../../data/config.service';
import { HotspotService } from '../../data/hotspot.service';
import { LimitsStore } from '../../data/limits.store';
import { FlatHotspot } from '../../model/hotspot-result';
import { Limits } from '../../model/limits';
import { EventService } from '../../utils/event.service';

export interface CombinedHotspot {
  fileName: string;
  loc: number;
  mcCabe: number;
  commits: number;
  changedLines: number;
  score: number;
}

export interface LoadOptions {
  limits: Limits;
}

export const HotspotCityStore = signalStore(
  withState({
    loading: false,
    minScore: 33,
    hotspotData: [] as CombinedHotspot[],
  }),
  withMethods((store) => ({
    setLoading(loading: boolean) {
      patchState(store, { loading });
    },
  })),
  withComputed(
    (
      store,
      limitsStore = inject(LimitsStore),
      eventService = inject(EventService)
    ) => {
      const filterChanged = toSignal(
        eventService.filterChanged.pipe(
          startWith(0),
          scan((acc) => acc + 1, 0)
        ),
        { initialValue: 0 }
      );

      return {
        _filter: computed(() => ({
          minScore: store.minScore(),
          limits: limitsStore.limits(),
          filterChanged: filterChanged(),
        })),
      };
    }
  ),
  withMethods(
    (
      store,
      config = inject(ConfigService),
      hotspot = inject(HotspotService)
    ) => {
      const merge = (
        lengthResults: { hotspots: FlatHotspot[] }[],
        mcCabeResults: { hotspots: FlatHotspot[] }[]
      ): CombinedHotspot[] => {
        const byFile = new Map<string, CombinedHotspot>();

        for (const res of lengthResults) {
          for (const h of res.hotspots) {
            const loc = h.complexity;
            const prev = byFile.get(h.fileName);
            if (!prev) {
              byFile.set(h.fileName, {
                fileName: h.fileName,
                loc,
                mcCabe: 0,
                commits: h.commits,
                changedLines: h.changedLines,
                score: h.score,
              });
            } else {
              prev.loc = Math.max(prev.loc, loc);
              prev.commits = Math.max(prev.commits, h.commits);
              prev.changedLines = Math.max(prev.changedLines, h.changedLines);
              prev.score = Math.max(prev.score, h.score);
            }
          }
        }

        for (const res of mcCabeResults) {
          for (const h of res.hotspots) {
            const mc = h.complexity;
            const prev = byFile.get(h.fileName);
            if (!prev) {
              byFile.set(h.fileName, {
                fileName: h.fileName,
                loc: 0,
                mcCabe: mc,
                commits: h.commits,
                changedLines: h.changedLines,
                score: h.score,
              });
            } else {
              prev.mcCabe = Math.max(prev.mcCabe, mc);
              prev.commits = Math.max(prev.commits, h.commits);
              prev.changedLines = Math.max(prev.changedLines, h.changedLines);
              prev.score = Math.max(prev.score, h.score);
            }
          }
        }

        return Array.from(byFile.values());
      };

      return {
        setMinScore: (minScore: number) => {
          patchState(store, { minScore });
        },
        rxLoadCombined: rxMethod<{
          limits: Limits;
          minScore: number;
        }>((ev$) =>
          ev$.pipe(
            switchMap(({ limits, minScore }) => {
              store.setLoading(true);
              return config.load().pipe(
                switchMap((cfg) => {
                  const scopes = cfg.scopes?.length ? cfg.scopes : [''];
                  const lengthReqs = scopes.map((s) =>
                    hotspot.load(
                      { module: s, metric: 'Length', minScore },
                      limits
                    )
                  );
                  const mcCabeReqs = scopes.map((s) =>
                    hotspot.load(
                      { module: s, metric: 'McCabe', minScore },
                      limits
                    )
                  );
                  return forkJoin({
                    lengths: forkJoin(lengthReqs),
                    mcCabes: forkJoin(mcCabeReqs),
                  }).pipe(
                    map(({ lengths, mcCabes }) => merge(lengths, mcCabes))
                  );
                })
              );
            }),
            tap((hotspotData) => {
              store.setLoading(false);
              patchState(store, { hotspotData });
            })
          )
        ),
      };
    }
  ),
  withHooks({
    onInit({ rxLoadCombined, _filter }) {
      rxLoadCombined(_filter);
    },
  })
);

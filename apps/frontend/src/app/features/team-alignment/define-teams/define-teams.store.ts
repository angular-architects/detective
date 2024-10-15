import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';

import { ConfigService } from '../../../data/config.service';
import { TeamAlignmentService } from '../../../data/team-alignment.service';
import { initConfig, Teams, Users } from '../../../model/config';
import { Limits } from '../../../model/limits';

const UNKNOWN_TEAM = 'Not Assigned';
export type User = string;
export type Team = { name: string; users: User[]; mayBeEdited?: boolean };

export const DefineTeamsStore = signalStore(
  withState({ users: [] as Users, config: initConfig }),
  withComputed((store) => ({
    teams: computed(() =>
      Object.entries(store.config()?.teams || {}).map(
        ([name, users]): Team => ({ name, users, mayBeEdited: true })
      )
    ),
  })),
  withComputed((store) => ({
    unknownTeam: computed<Team>(() => {
      const usersInTeams = store.teams().flatMap(({ users }) => users);
      const users = store
        .users()
        .filter((user) => !usersInTeams.includes(user));
      return { name: UNKNOWN_TEAM, users };
    }),
  })),
  withMethods(
    (
      store,
      taService = inject(TeamAlignmentService),
      cfgService = inject(ConfigService)
    ) => ({
      load: rxMethod<Limits>(
        pipe(
          switchMap((limits) => taService.load(true, limits)),
          tap(({ teams }) => patchState(store, { users: teams })),
          switchMap(() => cfgService.load()),
          tap((config) => (config.teams ||= {})),
          tap((config) => patchState(store, { config }))
        )
      ),
      _save: () => cfgService.save(store.config()).subscribe(),
      _changeTeams: (changeTheTeams: (teams: Teams) => Teams | void) => {
        const config = store.config();
        let teams = store.config().teams ?? {};
        teams = changeTheTeams(teams) ?? teams;
        patchState(store, { config: { ...config, teams: { ...teams } } });
      },
      _existsTeam: (name: string) => store.config()?.teams?.[name],
    })
  ),
  withMethods((store) => ({
    addTeam: () => {
      store._changeTeams((teams) => {
        const newName = 'Team #' + (Object.keys(teams).length + 1);
        teams[newName] = [];
      });
    },
    removeTeam: ({ name }: Team) => {
      if (name === UNKNOWN_TEAM) return;
      store._changeTeams((teams) => {
        delete teams[name];
      });
    },
    renameTeam: (oldName: string, newName: string) => {
      if (!oldName || !newName) return;
      if (oldName === UNKNOWN_TEAM || newName === UNKNOWN_TEAM) return;
      if (!store._existsTeam(oldName) || store._existsTeam(newName)) return;
      const rename = (name: string) => (name === oldName ? newName : name);
      store._changeTeams((teams) =>
        Object.fromEntries(
          Object.entries(teams).map(([name, users]) => [rename(name), users])
        )
      );
    },
    addToTeam: ({ name }: Team, user: User) => {
      if (name === UNKNOWN_TEAM) return;
      store._changeTeams((teams) => {
        teams[name] = [...teams[name], user];
      });
    },
    removeFromTeam: ({ name }: Team, user: User) => {
      if (name === UNKNOWN_TEAM) return;
      store._changeTeams((teams) => {
        teams[name] = teams[name].filter((u) => u !== user);
      });
    },
  })),

  withHooks((store) => ({ onDestroy: () => store._save() }))
);

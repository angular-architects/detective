import { loadConfig } from "../infrastructure/config";
import { Options } from "../options/options";
import { parseGitLog } from "../utils/git-parser";

const UNKNOWN_TEAM = 'unknown';

export type ModuleDetails = {
  changes: Record<string, number>;
};

export type TeamAlignmentResult = {
  modules: Record<string, ModuleDetails>;
  teams: string[];
};

export async function calcTeamAlignment(
  byUser = false,
  options: Options
): Promise<TeamAlignmentResult> {
  
  const config = loadConfig(options);
  const modules = config.scopes;
  const teams = config.teams || {};

  const userToTeam = initUserToTeam(teams);
  const result = initResult(modules, Object.keys(teams));

  const users = new Set<string>();

  let count = 0;
  await parseGitLog((entry) => {
    let userName = entry.header.userName;

    if (options.demoMode) {
      count++;
      if (count % 4 === 2) {
        userName = 'John Doe';
      }
      else if (count % 4 == 3) {
        userName = 'Jane Doe';
      }
    }

    users.add(userName);
    
    let key = calcKey(byUser, userName, userToTeam);
    
    for (const change of entry.body) {
      for (const module of modules) {
        if (change.path.startsWith(module)) {
            const changes = result.modules[module].changes;
            const current = changes[key] || 0;
            changes[key] = current + change.linesAdded + change.linesRemoved;
        }
      }
    }
  });

  console.log('users', Array.from(users));

  if (byUser) {
    result.teams = Array.from(users);
  }

  return result;
}

function calcKey(byUser: boolean, userName: string, userToTeam: Record<string, string>) {
    if (byUser) {
        return userName;
    }
    else {
        return userToTeam[userName] || UNKNOWN_TEAM;
    }
}

function initUserToTeam(teams: Record<string, string[]>) {
    const userToTeam: Record<string, string> = {};

    for (const teamName of Object.keys(teams)) {
        const team = teams[teamName];
        for (const user of team) {
            userToTeam[user] = teamName;
        }
    }
    return userToTeam;
}

function initResult(modules: string[], teams: string[]) {
    const sorted = [...teams].sort();
    const result: TeamAlignmentResult = {
        modules: {},
        teams: [...sorted, UNKNOWN_TEAM],
    };
    for (const module of modules) {
        result.modules[module] = { changes: {} };
    }
    return result;
}


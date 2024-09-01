import { loadConfig } from "../infrastructure/config";
import { Limits } from "../model/limits";
import { Options } from "../options/options";
import { parseGitLog } from "../utils/git-parser";
import { getEmptyMatrix } from "../utils/matrix";
import { normalizeFolder } from "../utils/normalize-folder";

export type ChangeCouplingResult = {
    matrix: number[][];
    dimensions: string[];
    groups: string[];
    
    fileCount: number[];
    cohesion: number[];
}

export async function calcChangeCoupling(limits: Limits, options: Options): Promise<ChangeCouplingResult> {
    const config = loadConfig(options);

    const displayModules = config.scopes;
    const modules = displayModules.map(m => normalizeFolder(m));

    const matrix = getEmptyMatrix(modules.length);

    const commitsPerModule: number[] = new Array(matrix.length).fill(0);

    await parseGitLog((entry) => {
        const touchedModules = new Set<number>();
        for (const change of entry.body) {
            for (let i=0; i<modules.length; i++) {
                const module = modules[i];
                if (change.path.startsWith(module)) {
                    commitsPerModule[i]++;
                    touchedModules.add(i);
                }
            }
        }
        addToMatrix(touchedModules, matrix);
    }, limits);

    return {
        matrix,
        dimensions: displayModules,
        groups: config.groups,

        fileCount: commitsPerModule,
        cohesion: new Array(matrix.length).fill(-1),
    }
}

function addToMatrix(touchedModules: Set<number>, matrix: number[][]) {
    const touchedArray = Array.from(touchedModules);
    for (const module1 of touchedArray) {
        for (const module2 of touchedArray) {
            if (module1 < module2) {
                matrix[module1][module2]++;
            }
        }
    }
}

import { loadConfig } from "../infrastructure/config";
import { Options } from "../options/options";
import { parseGitLog } from "../utils/git-parser";
import { getEmptyMatrix } from "../utils/matrix";

export type ChangeCouplingResult = {
    matrix: number[][];
    dimensions: string[];
    groups: string[];
    
    fileCount: number[];
    cohesion: number[];
}

export async function calcChangeCoupling(options: Options): Promise<ChangeCouplingResult> {
    const config = loadConfig(options);
    const modules = config.scopes;

    const matrix = getEmptyMatrix(modules.length);

    await parseGitLog((entry) => {
        const touchedModules = new Set<number>();
        for (const change of entry.body) {
            for (let i=0; i<modules.length; i++) {
                const module = modules[i];
                if (change.path.startsWith(module)) {
                    touchedModules.add(i);
                }
            }
        }
        addToMatrix(touchedModules, matrix);
    });

    return {
        matrix,
        dimensions: modules,
        groups: config.groups,

        fileCount: new Array(matrix.length).fill(-1),
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

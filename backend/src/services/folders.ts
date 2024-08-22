import path from 'path';
import fs from 'fs';

export type Folder = {
    name: string;
    path: string;
    folders: Folder[];
};

const exclude = new Set(['node_modules', 'dist', '.git'])

export function getFolders(parent = '.', base = parent): Folder[] {

    const folders = fs.readdirSync(parent)
        .map(entry => ({
            name: entry,
            path: path.join(parent, entry)
        }))
        .filter(
            folder => !folder.name.startsWith('.')
                && fs.lstatSync(folder.path).isDirectory()
                && !exclude.has(folder.name)
        )
        .map(entry => ({...entry, path: entry.path, folders: getFolders(entry.path, base)}))
 
    return folders;
}

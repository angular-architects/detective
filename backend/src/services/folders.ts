import path from 'path';
import fs from 'fs';

export type Folder = {
    name: string;
    path: string;
    folders: Folder[];
};

const exclude = new Set(['node_modules', 'dist'])

export function getFolders(parent = '/Users/manfredsteyer/projects/public/standalone-example-cli', base = parent): Folder[] {

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
        .map(entry => ({...entry, path: entry.path.substring(base.length+1), folders: getFolders(entry.path, base)}))
 
    return folders;
}

// console.log('folders', JSON.stringify(getFolders(), null, 2));
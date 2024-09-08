import { Options } from '../options/options';
import { loadDeps } from '../infrastructure/deps';

export type Folder = {
  name: string;
  path: string;
  folders: Folder[];
};

export type InternalFolder = {
  name: string;
  path: string;
  folders: Record<string, InternalFolder>;
};

export function toFolder(folder: InternalFolder): Folder {
  const converted: Folder = {
    name: folder.name,
    path: folder.path,
    folders: Object.keys(folder.folders)
      .sort()
      .map((f) => toFolder(folder.folders[f])),
  };
  return converted;
}

export function inferFolders(options: Options): Folder[] {
  const deps = loadDeps(options);

  const root: InternalFolder = { name: '/', path: '/', folders: {} };

  for (const key of Object.keys(deps)) {
    const parts = key.split('/');
    const folders = parts.slice(0, parts.length - 1);

    let current = root;
    const history: string[] = [];

    for (const folder of folders) {
      history.push(folder);
      const path = history.join('/');

      let next = current.folders[folder];

      if (!next) {
        next = { name: folder, path, folders: {} };
        current.folders[folder] = next;
      }
      current = next;
    }
  }

  const converted = toFolder(root);
  return converted.folders;
}

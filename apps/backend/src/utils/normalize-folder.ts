export function normalizeFolder(folder: string): string {
  if (!folder.endsWith('/')) {
    return folder + '/';
  }
  return folder;
}

export function toDisplayFolder(folder: string): string {
  if (folder?.endsWith('/')) {
    return folder.substring(0, folder.length - 1);
  }
  return folder;
}

export function lastSegments(moduleName: string, segments: number) {
  let moduleNameParts = moduleName.split('/');
  if (moduleNameParts.length > segments) {
    moduleNameParts = moduleNameParts.slice(moduleNameParts.length - segments);
  }
  const label = moduleNameParts.join('/');
  return label;
}

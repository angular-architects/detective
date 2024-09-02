export function getEmptyMatrix(size: number): number[][] {
  return Array.from({ length: size }, () => new Array(size).fill(0));
}

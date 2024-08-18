export function toPercent(n: number, count: number) {
    const factor = Math.pow(10, count);
    return Math.round(n * factor);
}

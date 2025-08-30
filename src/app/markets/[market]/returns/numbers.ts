export function toNum(x: number | string | null | undefined): number | null {
    if (x === null || x === undefined) return null;
    const n = typeof x === "string" ? parseFloat(x) : x;
    return Number.isFinite(n) ? n : null;
}
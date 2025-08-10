import { PriceRow, PriceRowWithMaAndDi } from "@/types/stock";

export function addMovingAverageDi(data : PriceRow[], period : number = 20) : PriceRowWithMaAndDi[]{
    return data.map((priceRow, idx, array) => {
        if (idx < period - 1) {
            return {...priceRow, ma : null, di : null}
        }
        
        const slice = array.slice(idx - period + 1, idx + 1);
        const avg = slice.reduce((sum, r) => sum + r.close, 0) / period;
        const ma = parseFloat(avg.toFixed(2))

        const di =
            ma && ma !== 0
                ? parseFloat((((priceRow.close - ma) / ma) * 100).toFixed(2))
                : null;
            return { ...priceRow, ma : ma, di: di };

    })
}

export function calculateQuantile(data : PriceRowWithMaAndDi[], p : number) : number | null{
    const diValues = data
    .slice(-200)
    .map((row) => row.di as number)
    .filter(Number.isFinite) as number[];

    if (diValues.length === 0) return null;
    if (p <= 0) return Math.min(...diValues);
    if (p >= 1) return Math.max(...diValues);

    const sorted = [...diValues].sort((a,b) => a-b);
    const idx = (sorted.length - 1) * p;
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);

    if (lo === hi) return sorted[lo];
    const weight = idx - lo;
    return sorted[lo] * (1 - weight) + sorted[hi] * weight;

}


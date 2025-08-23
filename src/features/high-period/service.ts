import selectPeriodHighStocks from "./repository";
import { StartDateFromPeriod, distanceToHighPct } from "./utils";

export async function getPeriodHighStocks(period : string, tickers : string[]) {

    const as_of_date = StartDateFromPeriod(period);

    const periodHighStockRows = await selectPeriodHighStocks(tickers, as_of_date)

    // 52주 신고가 필터링
    const filteredPeriodHighStockRows = periodHighStockRows.filter(
        row => {
            const d = distanceToHighPct(row);
            return d >= 0 && d <= 10;
        })
        .sort((a,b) => distanceToHighPct(a) - distanceToHighPct(b))
        .map(row => ({ ...row, distanceToHighPct: +distanceToHighPct(row).toFixed(2)}));
    

    return filteredPeriodHighStockRows
}
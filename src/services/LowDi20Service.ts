import { NASDAQ_100 } from "@/constant/nasdaq_100";
import { pool } from "@/db";
import { getPricesByTickersAndRange } from "@/models/stocks_price";
import { StockByDi } from "@/types/stock";
import { getOneYearAgoStr, getTodayStr } from "@/utils/date";
import { addMovingAverageDi, calculateQuantile } from "@/utils/indicators";

// 날짜에 맞는 이격도 낮은 주식 가져오기
export async function getLowDi20Stocks(
    date: string = new Date().toISOString().split("T")[0],
    tickers: string[] = NASDAQ_100) : Promise<StockByDi[]>{

    const filteredStocksByDi = []
// 티커 리스트에 해당하는 주식 가격들 가지고 오기
const stocksInfo = await getPricesByTickersAndRange(tickers, getOneYearAgoStr(), date)

//(1) ma20 값, di 값 추가
for (const ticker in stocksInfo) {
    const addedMa20AndDi = addMovingAverageDi(stocksInfo[ticker])

    const pValue = calculateQuantile(addedMa20AndDi, 0.08)
    if (pValue === null) continue;
    const todayStockInfo = addedMa20AndDi.at(-1)

    if (todayStockInfo === undefined || todayStockInfo.di === null) continue;
    if (todayStockInfo.di <= pValue) {
        filteredStocksByDi.push({
            ticker : ticker,
            close : todayStockInfo.close,
            di : todayStockInfo.di,
            pValue : pValue,
            marketcap : todayStockInfo.marketcap,
            fullname : todayStockInfo.fullname

        })
    }
}   
    return filteredStocksByDi
}
export type PriceRow = {
    date: string;  // 'YYYY-MM-DD'로 받는 걸 권장
    fullname : string;
    marketcap: number
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  };

export type PricesByTicker = Record<string, PriceRow[]>;


export type PriceRowWithMaAndDi = PriceRow & {
    ma: number | null;
    di: number | null;
};

export type StockByDi = {
  ticker: string;
  close: number;
  di: number;
  pValue: number;
  marketcap: number;
  fullname: string;
}

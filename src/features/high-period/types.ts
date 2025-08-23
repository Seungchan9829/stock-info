export type PeriodHighStockRow = {
    ticker: string;
    fullname: string;
    marketcap: number | null; // BIGINT면 string 유지 권장
    date: string;             // 'YYYY-MM-DD'
    close: number;
    high_date: string;        // 'YYYY-MM-DD'
    high_close: number;
  };


export type NearHighItem = {
    ticker: string;
    fullname: string;
    marketcap: string | number;
    date: string; // ISO
    close: number;
    high_date: string; // ISO
    high_close: number;
    distanceToHighPct: number;
};
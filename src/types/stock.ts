export type PriceRow = {
    date: string;  // 'YYYY-MM-DD'로 받는 걸 권장
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
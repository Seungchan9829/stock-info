export type ApiRow = {
    ticker: string;
    fullname?: string | null; // 서버가 제공하면 사용
    as_of: string; // ISO date string
    close_now: number | string;
    d1_ret: number | string | null;
    w1_ret: number | string | null;
    m1_ret: number | string | null;
    m3_ret: number | string | null;
    m6_ret: number | string | null;
    marketcap?: number | string | null;
};

export type Row = {
    ticker: string;
    fullname: string | null;
    asOf: Date;
    close: number | null;
    d1: number | null;
    w1: number | null;
    m1: number | null;
    m3: number | null;
    m6: number | null;
    marketcap: number | null;
};

export type SortKey = keyof Pick<Row, "ticker" | "fullname" | "close" | "marketcap" | "d1" | "w1" | "m1" | "m3" | "m6">;

export type SortState = { key: SortKey; dir: "asc" | "desc" };

export type Currency = "USD" | "KRW";

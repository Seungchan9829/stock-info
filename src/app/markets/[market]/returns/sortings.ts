import { SortKey, Row } from "./types";

export const SORTERS: Record<SortKey, (r: Row) => number | string> = {
    ticker: (r) => r.ticker,
    fullname: (r) => r.fullname ?? "",
    close: (r) => r.close ?? Number.NEGATIVE_INFINITY,
    marketcap: (r) => r.marketcap ?? Number.NEGATIVE_INFINITY,
    d1: (r) => r.d1 ?? Number.NEGATIVE_INFINITY,
    w1: (r) => r.w1 ?? Number.NEGATIVE_INFINITY,
    m1: (r) => r.m1 ?? Number.NEGATIVE_INFINITY,
    m3: (r) => r.m3 ?? Number.NEGATIVE_INFINITY,
    m6: (r) => r.m6 ?? Number.NEGATIVE_INFINITY,
};
import { SortKey } from "@/app/markets/[market]/returns/types";

export const MARKET_SLUGS = ["nasdaq100", "snp500", "kospi50", "kosdaq150"] as const;
export type MarketSlug = typeof MARKET_SLUGS[number];

type PathSuffix = `/${string}`; // "/stocks", "/returns?date=..." 등

export type MarketConfig = {
  label: string;
  locale: string;
  currency: "USD" | "KRW";
  timezone: "America/New_York" | "Asia/Seoul";
  apiPath: (p?: PathSuffix) => string; // 기본은 "/stocks"
  defaultSort: { key: SortKey; dir: "asc" | "desc" };
};

const makeConfig = (
  slug: MarketSlug,
  base: Omit<MarketConfig, "apiPath">
): MarketConfig => ({
  ...base,
  apiPath: (p: PathSuffix = "/stocks") => `/api/markets/${slug}${p}`,
});

export const MARKET_CONFIGS: Record<MarketSlug, MarketConfig> = {
  nasdaq100: makeConfig("nasdaq100", {
    label: "나스닥 100",
    locale: "ko-KR",
    currency: "USD",
    timezone: "America/New_York",
    defaultSort: { key: "marketcap", dir: "desc" },
  }),
  snp500: makeConfig("snp500", {
    label: "S&P 500",
    locale: "ko-KR",
    currency: "USD",
    timezone: "America/New_York",
    defaultSort: { key: "marketcap", dir: "desc" },
  }),
  kospi50: makeConfig("kospi50", {
    label: "코스피 50",
    locale: "ko-KR",
    currency: "KRW",
    timezone: "Asia/Seoul",
    defaultSort: { key: "marketcap", dir: "desc" },
  }),
  kosdaq150: makeConfig("kosdaq150", {
    label: "코스닥 150",
    locale: "ko-KR",
    currency: "KRW",
    timezone: "Asia/Seoul",
    defaultSort: { key: "marketcap", dir: "desc" },
  }),
};

export function isMarketSlug(x: string): x is MarketSlug {
    return (MARKET_SLUGS as readonly string[]).includes(x);
}
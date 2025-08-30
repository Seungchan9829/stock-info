import { Currency } from "./types";

export function formatCurrency(
    n: number | null,
    currency: Currency,
    locale = "ko-KR"
  ): string {
    if (n === null) return "—";
    try {
      const opts: Intl.NumberFormatOptions =
        currency === "USD"
          ? { maximumFractionDigits: 2, minimumFractionDigits: 0 }
          : { maximumFractionDigits: 0, minimumFractionDigits: 0 }; // KRW는 보통 소수점 없음
      const val = new Intl.NumberFormat(locale, opts).format(n);
      return `${val} ${currency}`;
    } catch {
      return `${n} ${currency}`;
    }
  }

export function formatPercent(n: number | null): string {
    if (n === null) return "—";
    try {
      return new Intl.NumberFormat("ko-KR", {
        style: "percent",
        maximumFractionDigits: 2,
      }).format(n);
    } catch {
      return `${(n * 100).toFixed(2)}%`;
    }
}

export function trendClass(n: number | null): string {
    if (n === null) return "text-zinc-500";
    if (n > 0) return "text-emerald-600";
    if (n < 0) return "text-rose-600";
    return "text-zinc-600";
}

export function clsx(...args: Array<string | false | null | undefined>) {
    return args.filter(Boolean).join(" ");
}

export function formatMarketCap(
    n: number | null,
    currency: Currency,
    locale = "ko-KR"
  ): string {
    if (n === null) return "—";
    try {
      // 'ko-KR' + compact → 1,0000억/1.23조 같은 한국식 단위가 자동 적용
      const val = new Intl.NumberFormat(locale, {
        notation: "compact",
        maximumFractionDigits: 2,
      }).format(n);
      return `${val} ${currency}`; // USD 또는 KRW로 접미사 변경
    } catch {
      try {
        return `${Math.round(n).toLocaleString(locale)} ${currency}`;
      } catch {
        return `${Math.round(n)} ${currency}`;
      }
    }
  }
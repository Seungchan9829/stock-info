"use client";

import { useEffect, useMemo, useState } from "react";
import { ApiRow, Row, SortKey, SortState } from "./types";
import { toNum } from "./numbers";
import { SORTERS } from "./sortings";
import { clsx, formatCurrency, formatMarketCap, formatPercent, trendClass } from "./formats";
import { Th } from "./components/Th";
import { MarketSlug } from "@/shared/market";
import MarketSwitcher from "./components/MarketSwitcher";

export default function ReturnsClient({
  market,
  label,
  defaultSort,
  apiBase,
  currency,
  locale, 
}: {
  market: MarketSlug;
  label: string;
  defaultSort: SortState;
  apiBase: string; // e.g. "/api/markets/nasdaq100"
  currency: "USD" | "KRW";
  locale: string;  
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(50);
  const [sort, setSort] = useState<SortState>(defaultSort);

  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const url = `${apiBase}/stocks`;          // ✅ 함수 대신 문자열 합성
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = (await res.json()) as ApiRow[];
        if (canceled) return;

        const normalized: Row[] = data.map((r) => ({
          ticker: r.ticker,
          fullname: (r.fullname ?? null) as string | null,
          asOf: new Date(r.as_of),
          close: toNum(r.close_now),
          d1: toNum(r.d1_ret),
          w1: toNum(r.w1_ret),
          m1: toNum(r.m1_ret),
          m3: toNum(r.m3_ret),
          m6: toNum(r.m6_ret),
          marketcap: toNum(r.marketcap ?? null),
        }));
        setRows(normalized);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg || "Failed to load");
      } finally {
        if (!canceled) setLoading(false);
      }
    })();
    return () => { canceled = true; };
  }, [apiBase, market]); // ✅ 문자열 의존성만

  const sorted = useMemo(() => {
    const arr = [...rows];
    const getter = SORTERS[sort.key];
    const dir = sort.dir;
    arr.sort((a, b) => {
      const va = getter(a);
      const vb = getter(b);
      if (typeof va === "string" && typeof vb === "string") {
        return dir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      const na = va as number;
      const nb = vb as number;
      return dir === "asc" ? na - nb : nb - na;
    });
    return arr;
  }, [rows, sort]);

  const display = sorted.slice(0, visible);
  const canLoadMore = visible < sorted.length;

  function toggleSort(key: SortKey) {
    setSort((prev) => {
      if (prev.key === key) return { key, dir: prev.dir === "asc" ? "desc" : "asc" };
      const isText = key === "ticker" || key === "fullname";
      return { key, dir: isText ? "asc" : "desc" };
    });
  }

  const asOfText = useMemo(() => {
    if (!rows.length) return "";
    const d = rows[0].asOf;
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(d.getUTCDate()).padStart(2, "0");
    return `${yyyy}년 ${mm}월 ${dd}일`;
  }, [rows]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-zinc-50">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <header className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              {label} 수익률 대시보드
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              기준일 <span className="font-medium text-zinc-800">{asOfText || "—"}</span>. 열 제목을 클릭하면 정렬됩니다.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700">
              표시 {display.length} / {sorted.length}
            </span>
          </div>
          <MarketSwitcher current = {market}/>
        </header>
        <div className="overflow-hidden rounded-2xl border border-zinc-200 shadow-sm bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-50 text-left text-zinc-600 text-xs uppercase tracking-wider">
                <tr>
                  <Th label="티커" onClick={() => toggleSort("ticker")} active={sort.key === "ticker"} dir={sort.dir} />
                  <Th label="회사명" onClick={() => toggleSort("fullname")} active={sort.key === "fullname"} dir={sort.dir} />
                  <Th label="종가" onClick={() => toggleSort("close")} active={sort.key === "close"} dir={sort.dir} align="right" />
                  <Th label="시가총액" onClick={() => toggleSort("marketcap")} active={sort.key === "marketcap"} dir={sort.dir} align="right" />
                  <Th label="1일" onClick={() => toggleSort("d1")} active={sort.key === "d1"} dir={sort.dir} align="right" />
                  <Th label="1주" onClick={() => toggleSort("w1")} active={sort.key === "w1"} dir={sort.dir} align="right" />
                  <Th label="1개월" onClick={() => toggleSort("m1")} active={sort.key === "m1"} dir={sort.dir} align="right" />
                  <Th label="3개월" onClick={() => toggleSort("m3")} active={sort.key === "m3"} dir={sort.dir} align="right" />
                  <Th label="6개월" onClick={() => toggleSort("m6")} active={sort.key === "m6"} dir={sort.dir} align="right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {loading && (
                  <tr><td className="p-6 text-zinc-500" colSpan={9}>불러오는 중…</td></tr>
                )}
                {error && !loading && (
                  <tr><td className="p-6 text-rose-600" colSpan={9}>불러오기 실패: {error}</td></tr>
                )}
                {!loading && !error && display.map((r) => (
                  <tr key={r.ticker} className="hover:bg-zinc-50/80">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-zinc-900">{r.ticker}</td>
                    <td className="px-4 py-3 text-zinc-700">{r.fullname ?? "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(r.close, currency, locale)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatMarketCap(r.marketcap, currency, locale)}</td>
                    <td className={clsx("px-4 py-3 text-right tabular-nums", trendClass(r.d1))}>{formatPercent(r.d1)}</td>
                    <td className={clsx("px-4 py-3 text-right tabular-nums", trendClass(r.w1))}>{formatPercent(r.w1)}</td>
                    <td className={clsx("px-4 py-3 text-right tabular-nums", trendClass(r.m1))}>{formatPercent(r.m1)}</td>
                    <td className={clsx("px-4 py-3 text-right tabular-nums", trendClass(r.m3))}>{formatPercent(r.m3)}</td>
                    <td className={clsx("px-4 py-3 text-right tabular-nums", trendClass(r.m6))}>{formatPercent(r.m6)}</td>
                  </tr>
                ))}
                {!loading && !error && display.length === 0 && (
                  <tr><td className="p-6 text-zinc-500" colSpan={9}>데이터가 없습니다</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-zinc-200 p-4">
            <div className="text-xs text-zinc-600">열 제목을 클릭하면 정렬됩니다. 수익률이 양수면 초록, 음수면 빨강으로 표시됩니다.</div>
            {canLoadMore ? (
              <button
                onClick={() => setVisible((v) => v + 50)}
                className="inline-flex items-center rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-50 active:translate-y-px"
              >
                50개 더 보기
              </button>
            ) : (
              <span className="text-xs text-zinc-500">모두 불러왔습니다</span>
            )}
          </div>
        </div>      </div>
    </div>
  );
}

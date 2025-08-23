"use client";

import React from "react";

/**
 * Dependency‑free list UI for stocks near period highs.
 * Only React + TailwindCSS. No 3rd‑party UI libs, no icon packs, no motion.
 */

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

export type NearHighListProps = {
  items: NearHighItem[];
  title?: string;
  withinPct?: number;
  basePath?: string;
};

export default function NearHighList({ items, title = "Near Period Highs", withinPct = 10, basePath }: NearHighListProps) {
  const [q, setQ] = React.useState("");
  const [sortKey, setSortKey] = React.useState<"distance" | "marketcap" | "close" | "ticker">("distance");

  const filtered = React.useMemo(() => {
    const qlc = q.trim().toLowerCase();
    return items
      .filter((it) => it.distanceToHighPct >= 0 && it.distanceToHighPct <= withinPct)
      .filter((it) => (!qlc ? true : it.ticker.toLowerCase().includes(qlc) || it.fullname.toLowerCase().includes(qlc)))
      .sort((a, b) => {
        switch (sortKey) {
          case "distance":
            return a.distanceToHighPct - b.distanceToHighPct;
          case "marketcap":
            return toNumber(b.marketcap) - toNumber(a.marketcap);
          case "close":
            return b.close - a.close;
          case "ticker":
            return a.ticker.localeCompare(b.ticker);
          default:
            return 0;
        }
      });
  }, [items, q, sortKey, withinPct]);

  const onSortChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const v = e.target.value as "distance" | "marketcap" | "close" | "ticker";
    setSortKey(v);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{title}</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400"> 선택 기간 내 신고가 기준 {withinPct}% 이내 종목을 표시합니다 </p>
        </div>

        {/* Controls */}
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <div className="relative sm:w-72">
            <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 select-none text-sm">🔎</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="티커 또는 이름을 검색하세요"
              className="w-full rounded-xl border border-zinc-300 bg-white/80 pl-9 pr-3 py-2 text-sm shadow-sm outline-none ring-0 transition focus:border-zinc-400 focus:bg-white dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-100 dark:focus:border-zinc-600"
            />
          </div>

          <div>
            <select
              aria-label="Sort"
              value={sortKey}
              onChange={onSortChange}
              className="w-full rounded-xl border border-zinc-300 bg-white/80 px-3 py-2 text-sm shadow-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-100"
            >
              <option value="distance">신고가 근접</option>
              <option value="marketcap">시가 총액</option>
              <option value="close">종가</option>
              <option value="ticker">Ticker (A→Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.length === 0 && <EmptyState query={q} withinPct={withinPct} />}

        {filtered.map((it, idx) => (
          <StockCard key={it.ticker + idx} item={it} basePath={basePath} withinPct={withinPct} />
        ))}
      </div>
    </div>
  );
}

/* --------------------------- sub components --------------------------- */

function StockCard({ item, basePath, withinPct }: { item: NearHighItem; basePath?: string; withinPct: number }) {
  const isNewHigh = isSameDay(item.date, item.high_date) || item.distanceToHighPct === 0;
  const closeness = Math.max(0, Math.min(100, ((withinPct - item.distanceToHighPct) / withinPct) * 100));
  const href = basePath ? `${basePath}/${item.ticker}` : undefined;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-zinc-200/60 bg-white/70 p-5 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.15)] transition-transform duration-200 hover:-translate-y-0.5 backdrop-blur dark:border-zinc-800/60 dark:bg-zinc-900/60">
      {/* decorative gradient */}
      <div className="pointer-events-none absolute inset-x-0 -top-16 h-36 bg-[radial-gradient(30rem_12rem_at_50%_0%,rgba(34,197,94,0.15),transparent)] dark:bg-[radial-gradient(30rem_12rem_at_50%_0%,rgba(34,197,94,0.12),transparent)]" />

      <div className="relative mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TickerPill ticker={item.ticker} />
          {isNewHigh ? (
            <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">🏆 신고가 달성</Badge>
          ) : (
            <Badge className="bg-zinc-500/10 text-zinc-700 dark:text-zinc-300">📈 신고가 근접</Badge>
          )}
        </div>

        {href && (
          <a
            href={href}
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/70 px-3 py-1 text-xs text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800/70 dark:text-zinc-300 dark:hover:bg-zinc-800/50"
          >
            상세정보 <span aria-hidden="true">↗️</span>
          </a>
        )}
      </div>

      <div className="relative space-y-1.5">
        <h3 className="line-clamp-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">{item.fullname}</h3>
        <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
          <span>Last: <span className="font-medium text-zinc-800 dark:text-zinc-200">{fmtUSD(item.close)}</span></span>
          <Dot />
          <span>High: <span className="font-medium text-zinc-800 dark:text-zinc-200">{fmtUSD(item.high_close)}</span></span>
          <Dot />
          <span>Cap: <span className="font-medium text-zinc-800 dark:text-zinc-200">{fmtCap(item.marketcap)}</span></span>
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span className="inline-flex items-center gap-1">ℹ️ {item.distanceToHighPct.toFixed(2)}% below high</span>
          <span>{formatDate(item.high_date)}</span>
        </div>

        {/* Progress */}
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div className="h-full rounded-full bg-emerald-500/80 transition-[width]" style={{ width: `${closeness}%` }} />
        </div>
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span>Closeness</span>
          <span className="tabular-nums">{Math.round(closeness)}%</span>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ query, withinPct }: { query: string; withinPct: number }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
      <div className="flex flex-col items-center gap-2">
        <div className="text-2xl">📈</div>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          No results
          {query && (
            <>
              {" for "}
              <span className="font-medium">“{query}”</span>
            </>
          )}
          {" within "}{withinPct}%{" of the high."}
        </p>
        <p className="text-xs text-zinc-500">Try a different search or relax the threshold.</p>
      </div>
    </div>
  );
}

function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ring-black/5 dark:ring-white/10 ${className}`}>
      {children}
    </span>
  );
}

function TickerPill({ ticker }: { ticker: string }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-2.5 py-1 text-xs font-semibold text-white shadow-sm ring-1 ring-inset ring-black/10 dark:bg-zinc-100 dark:text-zinc-900 dark:ring-white/10">
      {ticker}
    </div>
  );
}

function Dot() {
  return <span className="h-1 w-1 rounded-full bg-zinc-400/70 align-middle" />;
}

/* ------------------------------ helpers ------------------------------ */

function toNumber(v: string | number): number {
  if (typeof v === "number") return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function fmtUSD(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: n < 100 ? 2 : 0 }).format(n);
}

function fmtCap(v: string | number): string {
  const n = toNumber(v);
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  } catch {
    return iso;
  }
}

function isSameDay(aIso: string, bIso: string): boolean {
  return formatDate(aIso) === formatDate(bIso);
}

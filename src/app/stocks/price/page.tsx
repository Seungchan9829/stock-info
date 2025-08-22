"use client";

import React from "react";

type ApiRow = {
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

type Row = {
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

type SortKey = keyof Pick<Row, "ticker" | "fullname" | "close" | "marketcap" | "d1" | "w1" | "m1" | "m3" | "m6">;

type SortState = { key: SortKey; dir: "asc" | "desc" };

// 안정적인 정렬 getter (TS가 타입을 더 잘 추론)
const SORTERS: Record<SortKey, (r: Row) => number | string> = {
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

function toNum(x: number | string | null | undefined): number | null {
  if (x === null || x === undefined) return null;
  const n = typeof x === "string" ? parseFloat(x) : x;
  return Number.isFinite(n) ? (n as number) : null;
}

function formatCurrency(n: number | null): string {
  if (n === null) return "—";
  try {
    const val = new Intl.NumberFormat("ko-KR", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(n);
    return `${val} USD`;
  } catch {
    return `${n} USD`;
  }
}

function formatPercent(n: number | null): string {
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

function trendClass(n: number | null): string {
  if (n === null) return "text-zinc-500";
  if (n > 0) return "text-emerald-600";
  if (n < 0) return "text-rose-600";
  return "text-zinc-600";
}

function clsx(...args: Array<string | false | null | undefined>) {
  return args.filter(Boolean).join(" ");
}

function formatMarketCap(n: number | null): string {
  if (n === null) return "—";
  try {
    const compact = new Intl.NumberFormat("ko-KR", {
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(n);
    return `${compact} USD`;
  } catch {
    try {
      return `${Math.round(n).toLocaleString("ko-KR")} USD`;
    } catch {
      return `${Math.round(n)} USD`;
    }
  }
}

export default function StocksPage() {
  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [visible, setVisible] = React.useState(50); // 처음 50개
  const [sort, setSort] = React.useState<SortState>({ key: "marketcap", dir: "desc" });

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/stocks", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as ApiRow[];
        if (!mounted) return;
        const normalized: Row[] = data.map((r) => ({
          ticker: r.ticker,
          fullname: (r.fullname ?? null) as string | null, // 서버가 주면 사용
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
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const sorted = React.useMemo(() => {
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
      if (prev.key === key) {
        return { key, dir: prev.dir === "asc" ? "desc" : "asc" };
      }
      // 기본 방향: 숫자형은 desc, 문자열은 asc
      const isText = key === "ticker" || key === "fullname";
      return { key, dir: isText ? "asc" : "desc" };
    });
  }

  const asOfText = React.useMemo(() => {
    if (!rows.length) return "";
    const d = rows[0].asOf;
    // YYYY-MM-DD 표시
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
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">나스닥 100 — 수익률 대시보드</h1>
            <p className="mt-1 text-sm text-zinc-600">기준일 <span className="font-medium text-zinc-800">{asOfText || "—"}</span>. 열 제목을 클릭하면 정렬됩니다.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700">표시 {display.length} / {sorted.length}</span>
          </div>
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
                  <tr>
                    <td className="p-6 text-zinc-500" colSpan={9}>불러오는 중…</td>
                  </tr>
                )}
                {error && !loading && (
                  <tr>
                    <td className="p-6 text-rose-600" colSpan={9}>불러오기 실패: {error}</td>
                  </tr>
                )}
                {!loading && !error && display.map((r) => (
                  <tr key={r.ticker} className="hover:bg-zinc-50/80">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-zinc-900">{r.ticker}</td>
                    <td className="px-4 py-3 text-zinc-700">{r.fullname ?? "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(r.close)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatMarketCap(r.marketcap)}</td>
                    <td className={clsx("px-4 py-3 text-right tabular-nums", trendClass(r.d1))}>{formatPercent(r.d1)}</td>
                    <td className={clsx("px-4 py-3 text-right tabular-nums", trendClass(r.w1))}>{formatPercent(r.w1)}</td>
                    <td className={clsx("px-4 py-3 text-right tabular-nums", trendClass(r.m1))}>{formatPercent(r.m1)}</td>
                    <td className={clsx("px-4 py-3 text-right tabular-nums", trendClass(r.m3))}>{formatPercent(r.m3)}</td>
                    <td className={clsx("px-4 py-3 text-right tabular-nums", trendClass(r.m6))}>{formatPercent(r.m6)}</td>
                  </tr>
                ))}
                {!loading && !error && display.length === 0 && (
                  <tr>
                    <td className="p-6 text-zinc-500" colSpan={9}>데이터가 없습니다</td>
                  </tr>
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
        </div>
      </div>
    </div>
  );
}

function Th({ label, onClick, active, dir, align = "left" }: {
  label: string;
  onClick: () => void;
  active: boolean;
  dir: "asc" | "desc";
  align?: "left" | "right";
}) {
  const arrow = active ? (dir === "asc" ? "▲" : "▼") : "↕";
  return (
    <th
      onClick={onClick}
      className={clsx(
        "sticky top-0 z-10 select-none whitespace-nowrap px-4 py-3 text-xs font-semibold tracking-wide text-zinc-600",
        "bg-zinc-50/90 backdrop-blur supports-[backdrop-filter]:bg-zinc-50/60",
        "cursor-pointer",
        align === "right" ? "text-right" : "text-left"
      )}
      scope="col"
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <span className="text-zinc-400">{arrow}</span>
      </span>
    </th>
  );
}

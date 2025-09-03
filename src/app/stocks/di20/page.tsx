// app/stocks/di20/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getLowDi20Stocks } from "@/services/LowDi20Service";
import { getTodayStr } from "@/utils/date";
import { toEokUnit } from "@/utils/transform";

import { NASDAQ_100 } from "@/constant/nasdaq_100";
import { KOSPI_50 } from "@/constant/korea_index";
import { StockByDi } from "@/types/stock";

// TODO: 준비되면 실제 상수로 교체하세요.
// import { SP500 } from "@/constant/sp500";
// import { KOSDAQ } from "@/constant/kosdaq";
const SNP500: string[] = []; // placeholder (향후 교체)
const KOSDAQ: string[] = []; // placeholder (향후 교체)

type SearchParams = {
  date?: string;
  board?: "nasdaq" | "snp500" | "kospi" | "kosdaq";
};

const INDEX_MAP: Record<
  NonNullable<SearchParams["board"]>,
  { label: string; tickers: string[] }
> = {
  nasdaq: { label: "나스닥 100", tickers: NASDAQ_100 },
  snp500: { label: "SNP500", tickers: SNP500 },
  kospi: { label: "코스피 50", tickers: KOSPI_50 },
  kosdaq: { label: "코스닥", tickers: KOSDAQ },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const date =
    params?.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date)
      ? params.date
      : getTodayStr();

  const board = (params?.board && params.board in INDEX_MAP
    ? params.board
    : "nasdaq") as NonNullable<SearchParams["board"]>;

  const { label, tickers } = INDEX_MAP[board];
  const rows = await getLowDi20Stocks(date, tickers);

  const tabBase = "px-3 py-2 rounded-lg border text-sm";
  const active = "bg-zinc-900 text-white border-zinc-900";
  const inactive = "bg-white text-zinc-700 hover:bg-zinc-50";

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold text-gray-800 mb-2">📉 DI20 과대낙폭</h1>
      <p className="text-sm text-gray-500 mb-4">
        날짜: {date} · 분류: {label}
      </p>

      {/* 인덱스 탭 */}
      <nav className="mb-6 flex items-center gap-2">
        {(Object.keys(INDEX_MAP) as Array<
          NonNullable<SearchParams["board"]>
        >).map((key) => {
          const href = `/stocks/di20?date=${date}&board=${key}`;
          const isActive = key === board;
          const tabLabel = INDEX_MAP[key].label
            .replace(" 100", "")
            .replace(" 50", "");
          return (
            <a
              key={key}
              href={href}
              className={`${tabBase} ${isActive ? active : inactive}`}
            >
              {tabLabel}
            </a>
          );
        })}
      </nav>

      {/* 날짜 선택 */}
      <form method="GET" className="mb-6 flex items-center gap-3">
        <input type="hidden" name="board" value={board} />
        <input
          type="date"
          name="date"
          defaultValue={date}
          className="border rounded-lg px-3 py-2"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg border shadow-sm hover:shadow transition"
        >
          적용
        </button>
        <a
          href={`/stocks/di20?board=${board}`} // 오늘로 (board 유지)
          className="px-3 py-2 rounded-lg border text-sm"
        >
          오늘로
        </a>
      </form>

      {/* 지원종목 안내 */}
      <div className="text-xs text-gray-500 mb-4">
        지원종목: 나스닥100 · 코스피50
        {SNP500.length ? " · S&P500" : ""}{KOSDAQ.length ? " · 코스닥" : ""}
      </div>

      {/* 리스트 */}
      {rows.length === 0 ? (
        <div className="text-sm text-gray-500">
          해당 분류에 표시할 종목이 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rows.map((r: StockByDi) => (
            <div
              key={r.ticker}
              className="bg-white shadow-md rounded-lg p-5 border hover:shadow-lg transition-shadow duration-200"
            >
              {/* 헤더: 티커 + 종목명 + 시총 */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="block text-lg font-bold text-indigo-600">
                    {r.ticker}
                  </span>
                  <span className="block text-xs text-gray-500">
                    {r.fullname}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  시가총액: {toEokUnit(r.marketcap)}
                </span>
              </div>

              {/* 종가 */}
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">종가</span>
                <span className="font-medium">
                  {Number(r.close).toLocaleString()}
                </span>
              </div>

              {/* 이격도 */}
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">이격도</span>
                <span
                  className={`font-medium ${
                    r.di < 0 ? "text-red-500" : "text-green-500"
                  }`}
                >
                  {r.di}%
                </span>
              </div>

              {/* pValue */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">pValue</span>
                <span className="font-medium">
                  {Number(r.pValue).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

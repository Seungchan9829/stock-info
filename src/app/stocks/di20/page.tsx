import { getLowDi20Stocks } from "@/services/LowDi20Service";
import { getTodayStr } from "@/utils/date";
import { toEokUnit } from "@/utils/transform";
type SearchParams = { date ?: string}; 

// { searchParams : SearchParams } -> 원래 props의 타입을 의미함 
export default async function Page({ searchParams } : { searchParams: Promise<SearchParams>}) {
    const params = await searchParams;
    const date = (params?.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date))
        ? params.date : getTodayStr();

    const rows = await getLowDi20Stocks(date);
    
    return (
        <main className="p-6">
        <h1 className="text-xl font-bold text-gray-800 mb-6">
            📉 (날짜 : {date} 기준 과대낙폭 종목)
        </h1>

        <form method="GET" className="mb-6 flex items-center gap-3">
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
          href="/stocks/di20" // 오늘 기본값 로직이 있으니 파라미터 없이 이동하면 오늘로
          className="px-3 py-2 rounded-lg border text-sm"
        >
          오늘로
        </a>
      </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rows.map((r) => (
            <div
                key={r.ticker}
                className="bg-white shadow-md rounded-lg p-5 border hover:shadow-lg transition-shadow duration-200"
            >
                {/* 헤더: 티커 + 종목명 + 시총 */}
                <div className="flex items-start justify-between mb-3">
                    <div>
                    <span className="block text-lg font-bold text-indigo-600">{r.ticker}</span>
                    <span className="block text-xs text-gray-500">{r.fullname}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                    시가총액: {toEokUnit(r.marketcap)}
                    </span>
                </div>

                {/* 종가 */}
                <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">종가</span>
                <span className="font-medium">{r.close.toLocaleString()} USD</span>
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
                <span className="font-medium">{r.pValue.toFixed(2)}</span>
                </div>
            </div>
            ))}
        </div>
        </main>
    )
}

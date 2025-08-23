import { NASDAQ_100 } from "@/constant/nasdaq_100";
import NearHighList from "@/features/high-period/components/NearHighList";
import { getPeriodHighStocks } from "@/features/high-period/service";
import { NearHighItem } from "@/features/high-period/types";

export default async function Page ({ params }: {
    params: { period: string };
    searchParams: { [k: string]: string | string[] | undefined };
})  {
    const period = params.period;

    const highStocks = await getPeriodHighStocks(period, NASDAQ_100)

    const items: NearHighItem[] = highStocks.map((r) => ({
        ...r,
        marketcap: r.marketcap ?? 0, // null → 0
      }));
    return (
        <NearHighList
        items={items}
        title={`${period.toUpperCase()} 신고가`}
        withinPct={10}         // 필요 시 임계값 조정
        basePath="/stocks"     // 카드 우상단 "Details" 링크 prefix (없으면 지워도 OK)
      />
    )
}
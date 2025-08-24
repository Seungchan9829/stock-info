import { NASDAQ_100 } from "@/constant/nasdaq_100";
import NearHighList from "@/features/high-period/components/NearHighList";
import { getPeriodHighStocks } from "@/features/high-period/service";
import { NearHighItem } from "@/features/high-period/types";

export default async function Page({
  params,
  searchParams, // 필요 없으면 지워도 됨(ESLint 경고 방지)
}: {
  params: Promise<{ period: string }>; // ✅ Promise 타입
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { period } = await params;            // ✅ await 필요
  // const qs = await searchParams;           // 필요할 때만 사용

  const highStocks = await getPeriodHighStocks(period, NASDAQ_100);

  const items: NearHighItem[] = highStocks.map((r) => ({
    ...r,
    marketcap: r.marketcap ?? 0,
  }));

  return (
    <NearHighList
      items={items}
      title={`Near ${period.toUpperCase()} Highs`}
      withinPct={10}
      basePath="/stocks"
    />
  );
}

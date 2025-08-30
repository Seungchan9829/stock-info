// app/markets/[market]/returns/page.tsx
import ReturnsClient from "./ReturnsClient";
import { MARKET_CONFIGS, MarketSlug, isMarketSlug } from "@/shared/market";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: Promise<{ market: MarketSlug }> }) {
  const { market } = await params;
  if (!isMarketSlug(market)) notFound();          // ✅ 잘못된 슬러그면 404

  const cfg = MARKET_CONFIGS[market];

  const apiBase = `/api/markets/${market}`;

  return (
    <div>
        <ReturnsClient
        market={market}
        label={cfg.label}
        defaultSort={cfg.defaultSort}
        apiBase={apiBase}
        currency={cfg.currency}
        locale={cfg.locale}   
        />
    </div>

  );
}

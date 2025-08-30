import { KOSDAQ_150, KOSPI_50 } from "@/constant/korea_index";
import { NASDAQ_100, SNP_500 } from "@/constant/nasdaq_100";
import { pool } from "@/db";
import { getReturnsForTickers } from "@/models/stocks_price";
import { MARKET_SLUGS, MarketSlug } from "@/shared/market";
import { NextRequest, NextResponse } from "next/server";

const MARKET_TO_TICKERS = {
    nasdaq100: NASDAQ_100,
    kospi50: KOSPI_50,
    snp500: SNP_500,
    kosdaq150: KOSDAQ_150
  } as const satisfies Record<MarketSlug, readonly string[]>;

// 공용 includes 타입가드
const includes = <T extends U, U>(arr: readonly T[], el: U): el is T =>
  arr.includes(el as T);

export async function GET(
    _req : NextRequest,
    { params } : { params : Promise<{ market : string}>}
){  
    const { market }  = await params

    if (!includes(MARKET_SLUGS, market)) {
        return NextResponse.json({ error: "Unsupported market" }, { status: 400 });
    }

    const tickers = MARKET_TO_TICKERS[market];

    const client = await pool.connect();
    try{
        const rows = await getReturnsForTickers(tickers , client);
        return NextResponse.json(rows, { status: 200 });
    } catch (e) {
        console.error(e)
        return NextResponse.json({ error: "Internal Server Error" }, {status : 500})
    } finally {
        client.release()
    }
}



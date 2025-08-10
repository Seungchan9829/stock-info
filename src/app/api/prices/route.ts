import { NextRequest, NextResponse } from "next/server";
import { getPricesByTickersAndRange } from "@/models/stocks_price";
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tickers = (searchParams.get("tickers") || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  const start = searchParams.get("start") || "";
  const end = searchParams.get("end") || "";

  if (!tickers.length || !start || !end) {
    return NextResponse.json({ error: "tickers,start,end are required" }, { status: 400 });
  }

  const data = await getPricesByTickersAndRange(tickers, start, end);
  return NextResponse.json(data);
}

import { NASDAQ_100 } from "@/constant/nasdaq_100";
import { getPeriodHighStocks } from "@/features/high-period/service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: { period: string } }
  )  {
    try {
        const period = params.period;

        const result = await getPeriodHighStocks(period, NASDAQ_100)

        return NextResponse.json(result)

    } catch (e) {
        return NextResponse.json({ error: "신고가 근접 종목 조회 실패" }, { status: 400 });
    }
  }
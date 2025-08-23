import { NASDAQ_100 } from "@/constant/nasdaq_100";
import { getPeriodHighStocks } from "@/features/high-period/service";
import { StartDateFromPeriod } from "@/features/high-period/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: { period: string } }
  ) {
    try {
        const period = params.period;

        const result = await getPeriodHighStocks(period, NASDAQ_100)

        return NextResponse.json(result)

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 });
    }
  }
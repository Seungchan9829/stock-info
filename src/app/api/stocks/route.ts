import { NASDAQ_100 } from "@/constant/nasdaq_100";
import { pool } from "@/db";
import { NextRequest, NextResponse } from "next/server";
import { getReturnsForTickers } from "@/models/stocks_price";

export async function GET(_req: NextRequest) {
    const client = await pool.connect();
    try {
      const rows = await getReturnsForTickers(NASDAQ_100, client); // 같은 연결 재사용
      return NextResponse.json(rows, { status: 200 });
    } catch (e) {
      console.error(e);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    } finally {
      client.release();
    }
  }
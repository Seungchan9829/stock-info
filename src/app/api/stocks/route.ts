import { NASDAQ_100 } from "@/constant/nasdaq_100";
import { pool } from "@/db";
import { NextRequest, NextResponse } from "next/server";
import { SQL_GET_NASDAQ_100 } from "@/repositories/stockPrices";

export async function GET(req: NextRequest) {
    const client = await pool.connect();
    try {
        const { rows } = await client.query(SQL_GET_NASDAQ_100, [NASDAQ_100]);

        return NextResponse.json(rows, { status: 200 });
        
    } finally {
        client.release()
    }
}
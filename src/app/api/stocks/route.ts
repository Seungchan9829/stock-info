import { NextResponse } from "next/server";
import { getStockInfoById } from "@/models/stocks_price";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const raw = url.searchParams.get('id');
  
    // 1) 파라미터 존재 체크
    if (raw === null) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }
  
    // 2) 숫자/정수/양수 체크
    const id = Number(raw);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: 'id must be a positive integer' }, { status: 400 });
    }
    
    const stockInfo = await getStockInfoById(id);

    if (!stockInfo) {
        return NextResponse.json({e : '주식 정보를 찾지 못하였습니다'}, { status : 404})
    }

    return NextResponse.json(stockInfo, {status : 200})
}
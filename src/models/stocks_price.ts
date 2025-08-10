export type stock_info = {
    id : number;
    ticker : string;
    full_name : string;
    exchange : string;
    country : string;
    marketcap : bigint;
};

import { query } from "@/db";
import { pool } from "@/db";
import { PriceRow, PricesByTicker } from "@/types/stock";
export async function getStockInfoById(id:number) : Promise<stock_info | null> {
    const res = await query('SELECT * FROM stock_info WHERE id = $1', [id]);
    return res.rows[0] ?? null;
}

export async function getPricesByTickersAndRange(
    tickers: string[],
    start : string,
    end: string
    ) : Promise<PricesByTicker>{
        if (!tickers?.length) return {};

        const upperTickers = tickers.map(t => t.toUpperCase());
        
        const sql = `
            SELECT
                si.ticker,
                sp.date::date::text AS date,
                sp.open::float8  AS open,
                sp.high::float8  AS high,
                sp.low::float8   AS low,
                sp.close::float8 AS close,
                sp.volume::float8 AS volume  -- 큰 정수여도 number로 받고 싶다면 float8
            FROM stock_info si
            JOIN stock_prices sp ON sp.stock_id = si.id
            WHERE si.ticker = ANY($1::text[])
                AND sp.date >= $2::date
                AND sp.date <= $3::date
            ORDER BY si.ticker, sp.date ASC
            `;
        
      const client = await pool.connect();
      try {
        const { rows } = await client.query<{
          ticker: string, date: string, open: number; high: number; low: number; close: number; volume: number;
        }>(sql, [upperTickers, start, end]);
    
        const byTicker: PricesByTicker = {};
        for (const r of rows) {
          if (!byTicker[r.ticker]) byTicker[r.ticker] = [];
          byTicker[r.ticker].push({
            date: r.date,
            open: r.open,
            high: r.high,
            low: r.low,
            close: r.close,
            volume: r.volume,
          });
        }
        return byTicker;
      } finally {
        client.release();
      }
    }






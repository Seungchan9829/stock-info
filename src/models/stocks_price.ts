import { pool } from "@/db";
import { PriceRow, PricesByTicker } from "@/types/stock";

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
                si.fullname,
                si.marketcap::float8,
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
          ticker: string; fullname: string; marketcap: number; 
          date: string; open: number; high: number; low: number; close: number; volume: number;
          
        }>(sql, [upperTickers, start, end]);
    
        const byTicker: PricesByTicker = {};
        for (const r of rows) {
          if (!byTicker[r.ticker]) byTicker[r.ticker] = [];
          byTicker[r.ticker].push({
            fullname: r.fullname,
            marketcap: r.marketcap,
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






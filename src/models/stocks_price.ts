export type stock_info = {
    id : number;
    ticker : string;
    full_name : string;
    exchange : string;
    country : string;
    marketcap : bigint;
};

import { query } from "@/db";

export async function getStockInfoById(id:number) : Promise<stock_info | null> {
    const res = await query('SELECT * FROM stock_info WHERE id = $1', [id]);
    return res.rows[0] ?? null;
}
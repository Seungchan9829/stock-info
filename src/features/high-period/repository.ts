import { pool } from "@/db";
import { PeriodHighStockRow } from "./types";
import { periodHighSQL } from "./sql";


export default async function selectPeriodHighStocks(tickers : string[], as_of_date : string) : Promise<PeriodHighStockRow[]> {
    const client = await pool.connect();
    try {
        const { rows } = await client.query<PeriodHighStockRow>(periodHighSQL, [as_of_date , tickers])
        return rows
    } finally {
        client.release()
    }
}
import { NASDAQ_100 } from "@/constant/nasdaq_100"
import { getPricesByTickersAndRange } from "@/models/stocks_price"
import { getLowDi20Stocks } from "@/services/LowDi20Service";
import { addMovingAverageDi, calculateQuantile } from "@/utils/indicators"

export default async function stockPage () {

    
    const result = await getLowDi20Stocks('2025-08-05')
    console.log(result)
    

    return (
        <div>
            기본페이지
        </div>
    )
}
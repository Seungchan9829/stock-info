export const SQL_GET_NASDAQ_100 = `
WITH
  -- 1) 파라미터 배열 -> 티커 집합
  tickers AS (
    SELECT UNNEST($1::text[]) AS ticker
  ),
  -- 2) 티커에 해당하는 종목의 id/메타
  ids AS (
    SELECT i.id AS stock_id, i.ticker, i.fullname, i.marketcap
    FROM stock_info i
    JOIN tickers t ON t.ticker = i.ticker
    -- 필요시 표준화:
    -- JOIN tickers t ON UPPER(REPLACE(t.ticker,'.','-')) = i.ticker
  ),
  -- 3) 종목별 최신 일자
  latest AS (
    SELECT p.stock_id, MAX(p.date::date) AS as_of
    FROM stock_prices p
    JOIN ids i ON i.stock_id = p.stock_id
    GROUP BY p.stock_id
  ),
  -- 4) 최신 일자 종가
  curr AS (
    SELECT
      i.ticker,
      i.fullname,
      i.marketcap,
      p.stock_id,
      l.as_of,
      p.close
    FROM stock_prices p
    JOIN latest l ON l.stock_id = p.stock_id
                 AND l.as_of    = p.date::date
    JOIN ids i    ON i.stock_id = p.stock_id
  )
SELECT
  c.ticker,
  c.fullname,
  c.as_of,
  c.close AS close_now,
  c.marketcap,
  (c.close / NULLIF(d1.close_ref,0) - 1) AS d1_ret,
  (c.close / NULLIF(w1.close_ref,0) - 1) AS w1_ret,
  (c.close / NULLIF(m1.close_ref,0) - 1) AS m1_ret,
  (c.close / NULLIF(m3.close_ref,0) - 1) AS m3_ret,
  (c.close / NULLIF(m6.close_ref,0) - 1) AS m6_ret
FROM curr c
LEFT JOIN LATERAL (
  SELECT p2.close AS close_ref
  FROM stock_prices p2
  WHERE p2.stock_id = c.stock_id
    AND p2.date::date <= c.as_of - INTERVAL '1 day'
  ORDER BY p2.date DESC
  LIMIT 1
) d1 ON TRUE
LEFT JOIN LATERAL (
  SELECT p2.close AS close_ref
  FROM stock_prices p2
  WHERE p2.stock_id = c.stock_id
    AND p2.date::date <= c.as_of - INTERVAL '7 days'
  ORDER BY p2.date DESC
  LIMIT 1
) w1 ON TRUE
LEFT JOIN LATERAL (
  SELECT p2.close AS close_ref
  FROM stock_prices p2
  WHERE p2.stock_id = c.stock_id
    AND p2.date::date <= c.as_of - INTERVAL '1 month'
  ORDER BY p2.date DESC
  LIMIT 1
) m1 ON TRUE
LEFT JOIN LATERAL (
  SELECT p2.close AS close_ref
  FROM stock_prices p2
  WHERE p2.stock_id = c.stock_id
    AND p2.date::date <= c.as_of - INTERVAL '3 months'
  ORDER BY p2.date DESC
  LIMIT 1
) m3 ON TRUE
LEFT JOIN LATERAL (
  SELECT p2.close AS close_ref
  FROM stock_prices p2
  WHERE p2.stock_id = c.stock_id
    AND p2.date::date <= c.as_of - INTERVAL '6 months'
  ORDER BY p2.date DESC
  LIMIT 1
) m6 ON TRUE
ORDER BY c.ticker;
`;

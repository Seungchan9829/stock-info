export const periodHighSQL = `
WITH params AS (
    SELECT $1::date AS start_date
  ),
  latest AS (
    SELECT MAX(p.date) AS as_of
    FROM stock_prices p
  ),
  info AS (  -- 티커 필터 (없으면 전체)
    SELECT i.id AS stock_id, i.ticker, i.fullname, i.marketcap
    FROM stock_info i
    WHERE COALESCE(cardinality($2::text[]), 0) = 0  -- 빈 배열/NULL이면 필터 없음
       OR i.ticker = ANY ($2::text[])
  ),
  recent AS (  -- 종목별 최근 일자/종가
    SELECT DISTINCT ON (p.stock_id)
           p.stock_id, p.date AS recent_date, p.close AS recent_close
    FROM stock_prices p
    JOIN info i ON i.stock_id = p.stock_id
    CROSS JOIN latest l
    WHERE p.date <= l.as_of
    ORDER BY p.stock_id, p.date DESC
  ),
  high AS (    -- 시작일~최신일 구간의 신고가 + 그 날짜
    SELECT DISTINCT ON (p.stock_id)
           p.stock_id, p.date AS high_date, p.close AS high_close
    FROM stock_prices p
    JOIN info i ON i.stock_id = p.stock_id
    CROSS JOIN latest l
    CROSS JOIN params
    WHERE p.date BETWEEN params.start_date AND l.as_of
    ORDER BY p.stock_id, p.close DESC, p.date DESC
  )
  SELECT
    i.ticker,
    i.fullname,
    i.marketcap,
    r.recent_date AS date,      -- 최근 날짜
    r.recent_close::float8 AS close,    -- 최근 종가
    h.high_date,                -- 신고가 날짜
    h.high_close::float8                -- 신고가일 종가
  FROM info i
  LEFT JOIN recent r USING (stock_id)
  LEFT JOIN high   h USING (stock_id)
  ORDER BY i.ticker;  
`
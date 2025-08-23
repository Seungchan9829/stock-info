import { PeriodHighStockRow } from "./types";

function todayISOInNY(): string {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());
    const y = parts.find(p => p.type === "year")!.value;
    const m = parts.find(p => p.type === "month")!.value;
    const d = parts.find(p => p.type === "day")!.value;
    return `${y}-${m}-${d}`; // YYYY-MM-DD
  }

export function StartDateFromPeriod(period: string): string {
    const p = period.trim().toLowerCase();
    const today = todayISOInNY();
  
    if (p === "max") return "1900-01-01";
    if (p === "ytd") return `${today.slice(0, 4)}-01-01`;
  
    const m = p.match(/^(\d+)([dwmy])$/);
    if (!m) throw new Error(`Invalid period: ${period}`);
    const n = Number(m[1]);
    const unit = m[2] as "d" | "w" | "m" | "y";
  
    // NY 기준 '오늘 00:00'을 UTC 자정 기준으로 고정해 계산(타임존 흔들림 방지)
    const base = new Date(`${today}T00:00:00Z`);
    if (unit === "d") base.setUTCDate(base.getUTCDate() - n);
    else if (unit === "w") base.setUTCDate(base.getUTCDate() - n * 7); // 52w = 364일
    else if (unit === "m") base.setUTCMonth(base.getUTCMonth() - n);   // 캘린더 월 단위
    else if (unit === "y") base.setUTCFullYear(base.getUTCFullYear() - n);
  
    const yy = base.getUTCFullYear();
    const mm = String(base.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(base.getUTCDate()).padStart(2, "0");
    return `${yy}-${mm}-${dd}`;
  }

  // 신고가 대비 몇 % 낮은지 계산 (0 = 신고가와 동일)
export const distanceToHighPct = (row: PeriodHighStockRow) => {
    if (!Number.isFinite(row.close) || !Number.isFinite(row.high_close) || row.high_close <= 0) return Infinity;
    return ((row.high_close - row.close) / row.high_close) * 100;
  };
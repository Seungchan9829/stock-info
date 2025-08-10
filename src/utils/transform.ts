export function toEokUnit(value: number, currency: string = "USD"): string {
    const eok = value / 100_000_000;

    const formatted = Math.round(eok).toLocaleString("ko-KR");

    return `${formatted}억 ${currency}`;

}

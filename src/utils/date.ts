export function getTodayStr() {
    
    return new Date().toISOString().split("T")[0];
}

export function getOneYearAgoStr(date : string = getTodayStr()): string {
    const d = new Date(date);

    d.setFullYear(d.getFullYear() - 1)

    return d.toISOString().split("T")[0];
}
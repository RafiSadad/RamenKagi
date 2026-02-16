export type RangePreset = "day" | "week" | "month" | "year" | "ytd" | "custom";

export type DateRangeResult = {
    from: Date;
    to: Date;
    label: string;
    preset: RangePreset;
};

function startOfDay(d: Date): Date {
    const out = new Date(d);
    out.setHours(0, 0, 0, 0);
    return out;
}

function endOfDay(d: Date): Date {
    const out = new Date(d);
    out.setHours(23, 59, 59, 999);
    return out;
}

export function getDateRangeFromParams(searchParams: Record<string, string | undefined>): DateRangeResult {
    const range = (searchParams.range ?? "week") as RangePreset;
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    if (range === "custom") {
        const fromStr = searchParams.from;
        const toStr = searchParams.to;
        if (fromStr && toStr) {
            const from = startOfDay(new Date(fromStr));
            const to = endOfDay(new Date(toStr));
            const label = `${formatDateId(from)} – ${formatDateId(to)}`;
            return { from, to, label, preset: "custom" };
        }
    }

    if (range === "day") {
        return {
            from: todayStart,
            to: todayEnd,
            label: "Hari ini",
            preset: "day",
        };
    }

    if (range === "week") {
        const from = new Date(now);
        from.setDate(from.getDate() - 6);
        from.setHours(0, 0, 0, 0);
        return {
            from,
            to: todayEnd,
            label: "7 hari terakhir",
            preset: "week",
        };
    }

    if (range === "month") {
        const from = new Date(now.getFullYear(), now.getMonth(), 1);
        const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        to.setHours(23, 59, 59, 999);
        return {
            from: startOfDay(from),
            to,
            label: `Bulan ${from.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}`,
            preset: "month",
        };
    }

    if (range === "year") {
        const from = new Date(now.getFullYear(), 0, 1);
        const to = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        return {
            from: startOfDay(from),
            to,
            label: `Tahun ${now.getFullYear()}`,
            preset: "year",
        };
    }

    if (range === "ytd") {
        const from = new Date(now.getFullYear(), 0, 1);
        return {
            from: startOfDay(from),
            to: todayEnd,
            label: `Tahun ini (s.d. hari ini)`,
            preset: "ytd",
        };
    }

    // fallback week
    const from = new Date(now);
    from.setDate(from.getDate() - 6);
    from.setHours(0, 0, 0, 0);
    return {
        from,
        to: todayEnd,
        label: "7 hari terakhir",
        preset: "week",
    };
}

function formatDateId(d: Date): string {
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export function toDateInputValue(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

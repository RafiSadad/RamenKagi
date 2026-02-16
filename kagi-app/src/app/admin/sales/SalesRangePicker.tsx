"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { RangePreset } from "./date-range";
import { toDateInputValue } from "./date-range";

const PRESETS: { value: RangePreset; label: string }[] = [
    { value: "day", label: "Hari ini" },
    { value: "week", label: "7 hari" },
    { value: "month", label: "Bulan ini" },
    { value: "year", label: "Tahun ini (penuh)" },
    { value: "ytd", label: "Tahun ini (s.d. hari ini)" },
    { value: "custom", label: "Custom range" },
];

export default function SalesRangePicker({
    currentRange,
    customFrom,
    customTo,
}: {
    currentRange: RangePreset;
    customFrom: string;
    customTo: string;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();

    function updateUrl(params: { range?: string; from?: string; to?: string }) {
        const next = new URLSearchParams(searchParams.toString());
        if (params.range !== undefined) next.set("range", params.range);
        if (params.from !== undefined) next.set("from", params.from);
        if (params.to !== undefined) next.set("to", params.to);
        router.push(`/admin/sales?${next.toString()}`);
    }

    function handlePresetChange(value: string) {
        const preset = value as RangePreset;
        if (preset === "custom") {
            const today = toDateInputValue(new Date());
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 6);
            updateUrl({ range: "custom", from: toDateInputValue(weekAgo), to: today });
        } else {
            updateUrl({ range: preset });
        }
    }

    function handleCustomFromChange(from: string) {
        updateUrl({ from, to: searchParams.get("to") ?? customTo });
    }

    function handleCustomToChange(to: string) {
        updateUrl({ to, from: searchParams.get("from") ?? customFrom });
    }

    return (
        <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2">
                <span className="text-sm text-[#FFF9EC]/70">Periode:</span>
                <select
                    value={currentRange}
                    onChange={(e) => handlePresetChange(e.target.value)}
                    className="rounded-lg border border-[#FFF9EC]/20 bg-[#1a1410] px-3 py-2 text-sm text-[#FFF9EC] focus:border-[#FFAF03] focus:outline-none"
                >
                    {PRESETS.map((p) => (
                        <option key={p.value} value={p.value}>
                            {p.label}
                        </option>
                    ))}
                </select>
            </label>
            {currentRange === "custom" && (
                <div className="flex flex-wrap items-center gap-2">
                    <label className="flex items-center gap-2">
                        <span className="text-sm text-[#FFF9EC]/60">Dari</span>
                        <input
                            type="date"
                            value={customFrom}
                            onChange={(e) => handleCustomFromChange(e.target.value)}
                            className="rounded-lg border border-[#FFF9EC]/20 bg-[#1a1410] px-3 py-2 text-sm text-[#FFF9EC] focus:border-[#FFAF03] focus:outline-none"
                        />
                    </label>
                    <label className="flex items-center gap-2">
                        <span className="text-sm text-[#FFF9EC]/60">Sampai</span>
                        <input
                            type="date"
                            value={customTo}
                            onChange={(e) => handleCustomToChange(e.target.value)}
                            className="rounded-lg border border-[#FFF9EC]/20 bg-[#1a1410] px-3 py-2 text-sm text-[#FFF9EC] focus:border-[#FFAF03] focus:outline-none"
                        />
                    </label>
                </div>
            )}
        </div>
    );
}

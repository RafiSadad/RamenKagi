"use client";

import { useState, useMemo, Fragment } from "react";
import { Button } from "@/components/ui/button";
import { updateMenuStock, resetAllStockToDefault } from "../actions";
import { ChevronDown, ChevronRight } from "lucide-react";

export type StockRow = {
    menu_id: string;
    name: string;
    categorySlug: string;
    categoryTitle: string;
    categoryOrder: number;
    quantity: number;
    default_quantity: number | null;
};

type CategoryGroup = {
    slug: string;
    title: string;
    order: number;
    rows: StockRow[];
};

export default function StockTable({
    rows: initialRows,
}: {
    rows: StockRow[];
}) {
    const [rows, setRows] = useState(initialRows);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => new Set(initialRows.map((r) => r.categorySlug)));
    const [editStok, setEditStok] = useState("");
    const [setAsDefault, setSetAsDefault] = useState(false);
    const [saving, setSaving] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [settingHabis, setSettingHabis] = useState(false);

    const selectedCount = selected.size;
    const stokNum = parseInt(editStok, 10) || 0;

    const categories = useMemo((): CategoryGroup[] => {
        const map = new Map<string, CategoryGroup>();
        for (const row of rows) {
            const existing = map.get(row.categorySlug);
            if (existing) {
                existing.rows.push(row);
            } else {
                map.set(row.categorySlug, {
                    slug: row.categorySlug,
                    title: row.categoryTitle,
                    order: row.categoryOrder,
                    rows: [row],
                });
            }
        }
        return Array.from(map.values()).sort((a, b) => a.order - b.order);
    }, [rows]);

    function toggleRow(menuId: string) {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(menuId)) next.delete(menuId);
            else next.add(menuId);
            return next;
        });
    }

    function toggleAll() {
        if (selected.size === rows.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(rows.map((r) => r.menu_id)));
        }
    }

    function toggleCategory(categorySlug: string) {
        setExpandedCategories((prev) => {
            const next = new Set(prev);
            if (next.has(categorySlug)) next.delete(categorySlug);
            else next.add(categorySlug);
            return next;
        });
    }

    function selectCategory(categorySlug: string) {
        const group = categories.find((c) => c.slug === categorySlug);
        if (!group) return;
        const ids = new Set(group.rows.map((r) => r.menu_id));
        const allSelected = ids.size > 0 && ids.size === group.rows.filter((r) => selected.has(r.menu_id)).length;
        setSelected((prev) => {
            const next = new Set(prev);
            if (allSelected) {
                ids.forEach((id) => next.delete(id));
            } else {
                ids.forEach((id) => next.add(id));
            }
            return next;
        });
    }

    async function handleSaveSelected() {
        if (selectedCount === 0) return;
        setSaving(true);
        try {
            for (const menuId of selected) {
                await updateMenuStock(
                    menuId,
                    stokNum,
                    setAsDefault ? stokNum : undefined
                );
            }
            setRows((prev) =>
                prev.map((r) =>
                    selected.has(r.menu_id)
                        ? {
                              ...r,
                              quantity: stokNum,
                              default_quantity: setAsDefault
                                  ? stokNum
                                  : r.default_quantity,
                          }
                        : r
                )
            );
            setSelected(new Set());
            setEditStok("");
        } finally {
            setSaving(false);
        }
    }

    async function handleResetAll() {
        setResetting(true);
        try {
            await resetAllStockToDefault();
            setRows((prev) =>
                prev.map((r) => ({
                    ...r,
                    quantity: r.default_quantity ?? 0,
                }))
            );
        } finally {
            setResetting(false);
        }
    }

    async function handleSetHabis() {
        if (selectedCount === 0) return;
        setSettingHabis(true);
        try {
            for (const menuId of selected) {
                await updateMenuStock(menuId, 0, undefined);
            }
            setRows((prev) =>
                prev.map((r) =>
                    selected.has(r.menu_id) ? { ...r, quantity: 0 } : r
                )
            );
            setSelected(new Set());
            setEditStok("");
        } finally {
            setSettingHabis(false);
        }
    }

    return (
        <>
            {/* Konten utama: dropdown per kategori + padding bawah saat floating bar tampil */}
            <div className={selectedCount > 0 ? "pb-36" : ""}>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={toggleAll}
                        className="border-[#FFF9EC]/20 text-[#FFF9EC] hover:bg-[#FFF9EC]/10"
                    >
                        {selectedCount === rows.length && rows.length > 0 ? "Batal pilih semua" : "Pilih semua"}
                    </Button>
                    <span className="text-sm text-[#FFF9EC]/50">
                        {selectedCount > 0 ? `${selectedCount} barang terpilih` : "Pilih per kategori atau per barang"}
                    </span>
                </div>

                <div className="rounded-xl border border-[#FFF9EC]/10 overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[#FFF9EC]/10 bg-[#FFF9EC]/5">
                                <th className="w-10 px-2 py-3" />
                                <th className="px-4 py-3 text-sm font-semibold text-[#FFF9EC]">
                                    Menu
                                </th>
                                <th className="px-4 py-3 text-sm font-semibold text-[#FFF9EC] w-24">
                                    Stok
                                </th>
                                <th className="px-4 py-3 text-sm font-semibold text-[#FFF9EC] w-24">
                                    Default
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((group) => {
                                const isExpanded = expandedCategories.has(group.slug);
                                const selectedInCategory = group.rows.filter((r) => selected.has(r.menu_id)).length;
                                const allInCategorySelected = group.rows.length > 0 && selectedInCategory === group.rows.length;
                                return (
                                    <Fragment key={group.slug}>
                                        <tr
                                            className="bg-[#FFF9EC]/5 border-b border-[#FFF9EC]/10"
                                        >
                                            <td className="w-10 px-2 py-0 align-middle">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleCategory(group.slug)}
                                                    className="p-2 -m-2 rounded text-[#FFAF03] hover:bg-[#FFAF03]/10"
                                                    aria-label={isExpanded ? "Tutup kategori" : "Buka kategori"}
                                                >
                                                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                </button>
                                            </td>
                                            <td
                                                colSpan={3}
                                                className="px-2 py-2 flex flex-wrap items-center gap-2"
                                            >
                                                <span className="text-sm font-semibold text-[#FFAF03]">
                                                    {group.title}
                                                </span>
                                                <span className="text-xs text-[#FFF9EC]/50">
                                                    ({group.rows.length} barang)
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        selectCategory(group.slug);
                                                    }}
                                                    className="h-7 text-xs text-[#FFF9EC]/80 hover:text-[#FFAF03] hover:bg-[#FFAF03]/10"
                                                >
                                                    {allInCategorySelected ? "Batal pilih kategori" : "Pilih kategori"}
                                                </Button>
                                            </td>
                                        </tr>
                                        {isExpanded &&
                                            group.rows.map((row, rowIndex) => (
                                                <tr
                                                    key={row.menu_id}
                                                    className={`border-b border-[#FFF9EC]/5 ${
                                                        selected.has(row.menu_id)
                                                            ? "bg-[#FFAF03]/10 hover:bg-[#FFAF03]/15"
                                                            : rowIndex % 2 === 0
                                                                ? "bg-transparent hover:bg-[#FFF9EC]/5"
                                                                : "bg-black/20 hover:bg-black/30"
                                                    }`}
                                                >
                                                    <td className="w-10 px-3 py-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={selected.has(row.menu_id)}
                                                            onChange={() => toggleRow(row.menu_id)}
                                                            className="rounded border-[#FFF9EC]/30 bg-black/30 text-[#FFAF03] focus:ring-[#FFAF03]"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-[#FFF9EC]">{row.name}</td>
                                                    <td className="px-4 py-3 text-[#FFF9EC]/90">{row.quantity}</td>
                                                    <td className="px-4 py-3 text-[#FFF9EC]/60">
                                                        {row.default_quantity ?? "—"}
                                                    </td>
                                                </tr>
                                            ))}
                                    </Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Floating bar hanya muncul saat ada barang terpilih */}
            {selectedCount > 0 && (
                <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#FFF9EC]/10 bg-[#1a1410]/95 backdrop-blur-sm py-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
                    <div className="max-w-4xl mx-auto px-4 pt-4 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-4">
                        <div className="flex-1 min-w-0 flex flex-wrap items-center gap-4">
                            <span className="text-sm font-medium text-[#FFF9EC] whitespace-nowrap">
                                Edit stok terpilih ({selectedCount} barang)
                            </span>
                            <label className="flex items-center gap-2">
                                <span className="text-sm text-[#FFF9EC]/70">Stok:</span>
                                <input
                                    type="number"
                                    min={0}
                                    value={editStok}
                                    onChange={(e) => setEditStok(e.target.value)}
                                    placeholder="0"
                                    className="w-24 rounded border border-[#FFF9EC]/20 bg-black/30 px-3 py-2 text-[#FFF9EC] placeholder:text-[#FFF9EC]/40 focus:border-[#FFAF03] focus:outline-none"
                                />
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={setAsDefault}
                                    onChange={(e) => setSetAsDefault(e.target.checked)}
                                    className="rounded border-[#FFF9EC]/30 bg-black/30 text-[#FFAF03] focus:ring-[#FFAF03]"
                                />
                                <span className="text-sm text-[#FFF9EC]/80">Set as default?</span>
                            </label>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 shrink-0">
                            <Button
                                onClick={handleSaveSelected}
                                disabled={saving || settingHabis}
                                className="bg-[#FFAF03] text-[#47240F] hover:bg-[#e09e03]"
                            >
                                {saving ? "Menyimpan..." : "Simpan"}
                            </Button>
                            <Button
                                onClick={handleSetHabis}
                                disabled={saving || resetting || settingHabis || selectedCount === 0}
                                className="bg-red-600 text-white hover:bg-red-700 border-0"
                            >
                                {settingHabis ? "..." : "Habis"}
                            </Button>
                            <Button
                                onClick={handleResetAll}
                                disabled={resetting}
                                variant="outline"
                                className="border-[#FFF9EC]/20 text-[#FFF9EC] hover:bg-[#FFF9EC]/10"
                            >
                                {resetting ? "Memproses..." : "Reset stok ke default"}
                            </Button>
                            <span className="text-sm text-[#FFF9EC]/50 hidden sm:inline">
                                {selectedCount} barang — isi stok lalu Simpan
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

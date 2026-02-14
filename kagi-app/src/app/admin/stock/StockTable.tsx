"use client";

import { useState, Fragment } from "react";
import { Button } from "@/components/ui/button";
import { updateMenuStock, resetAllStockToDefault } from "../actions";

export type StockRow = {
    menu_id: string;
    name: string;
    categorySlug: string;
    categoryTitle: string;
    categoryOrder: number;
    quantity: number;
    default_quantity: number | null;
};

export default function StockTable({
    rows: initialRows,
}: {
    rows: StockRow[];
}) {
    const [rows, setRows] = useState(initialRows);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [editStok, setEditStok] = useState("");
    const [setAsDefault, setSetAsDefault] = useState(false);
    const [saving, setSaving] = useState(false);
    const [resetting, setResetting] = useState(false);

    const selectedCount = selected.size;
    const stokNum = parseInt(editStok, 10) || 0;

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

    return (
        <>
            {/* Konten utama: hanya tabel, dengan padding bawah agar tidak tertutup floating bar */}
            <div className="pb-36">
                <p className="text-sm text-[#FFF9EC]/50 mb-4">
                    Klik checkbox di kiri untuk memilih barang, lalu isi stok di bar bawah dan simpan.
                </p>
                <div className="rounded-xl border border-[#FFF9EC]/10 overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[#FFF9EC]/10 bg-[#FFF9EC]/5">
                                <th className="w-12 px-3 py-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedCount === rows.length && rows.length > 0}
                                        onChange={toggleAll}
                                        className="rounded border-[#FFF9EC]/30 bg-black/30 text-[#FFAF03] focus:ring-[#FFAF03]"
                                    />
                                </th>
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
                            {rows.map((row, index) => {
                                const showCategoryHeader =
                                    index === 0 ||
                                    rows[index - 1].categorySlug !== row.categorySlug;
                                return (
                                    <Fragment key={row.menu_id}>
                                        {showCategoryHeader && (
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="px-4 py-2 text-sm font-semibold text-[#FFAF03] bg-[#FFF9EC]/5 border-b border-[#FFF9EC]/10"
                                                >
                                                    {row.categoryTitle}
                                                </td>
                                            </tr>
                                        )}
                                        <tr
                                            className={`border-b border-[#FFF9EC]/5 hover:bg-[#FFF9EC]/5 ${
                                                selected.has(row.menu_id) ? "bg-[#FFAF03]/10" : ""
                                            }`}
                                        >
                                            <td className="w-12 px-3 py-3">
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
                                    </Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Floating bar di bawah layar: edit stok terpilih + Simpan + Reset */}
            <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#FFF9EC]/10 bg-[#1a1410]/95 backdrop-blur-sm py-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
                <div className="max-w-4xl mx-auto px-4 pt-4 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-4">
                    {/* Edit stok terpilih */}
                    <div className="flex-1 min-w-0 flex flex-wrap items-center gap-4">
                        {selectedCount === 0 ? (
                            <span className="text-sm text-[#FFF9EC]/50">
                                Pilih barang di tabel untuk edit stok
                            </span>
                        ) : (
                            <>
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
                            </>
                        )}
                    </div>
                    {/* Tombol Simpan + Reset */}
                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <Button
                            onClick={handleSaveSelected}
                            disabled={saving || selectedCount === 0}
                            className="bg-[#FFAF03] text-[#47240F] hover:bg-[#e09e03]"
                        >
                            {saving ? "Menyimpan..." : "Simpan"}
                        </Button>
                        <Button
                            onClick={handleResetAll}
                            disabled={resetting}
                            variant="outline"
                            className="border-[#FFF9EC]/20 text-[#FFF9EC] hover:bg-[#FFF9EC]/10"
                        >
                            {resetting ? "Memproses..." : "Reset stok ke default"}
                        </Button>
                        {selectedCount > 0 && (
                            <span className="text-sm text-[#FFF9EC]/50 hidden sm:inline">
                                {selectedCount} barang — isi stok lalu Simpan
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

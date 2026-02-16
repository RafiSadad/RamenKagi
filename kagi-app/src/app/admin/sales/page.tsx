import { Suspense } from "react";
import {
    getOrdersForAdmin,
    getSalesStats,
    type AdminOrder,
} from "@/lib/admin-orders";
import { formatRupiah } from "@/lib/utils";
import { getDateRangeFromParams, toDateInputValue } from "./date-range";
import SalesRangePicker from "./SalesRangePicker";

type PageProps = { searchParams: Promise<Record<string, string | undefined>> };

export default async function AdminSalesPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const { from, to, label, preset } = getDateRangeFromParams(params);

    const customFrom = params.from ?? toDateInputValue(from);
    const customTo = params.to ?? toDateInputValue(to);

    const [stats, orders] = await Promise.all([
        getSalesStats({ fromDate: from, toDate: to }),
        getOrdersForAdmin({ fromDate: from, toDate: to, limit: 200 }),
    ]);

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h1 className="text-2xl font-semibold text-[#FFF9EC]">
                    Dashboard Penjualan
                </h1>
                <Suspense fallback={<div className="h-10 w-48 rounded-lg bg-[#FFF9EC]/5 animate-pulse" />}>
                    <SalesRangePicker
                        currentRange={preset}
                        customFrom={customFrom}
                        customTo={customTo}
                    />
                </Suspense>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <StatCard title={`Order ${label}`} value={String(stats.count)} />
                <StatCard title={`Revenue ${label}`} value={formatRupiah(stats.revenue)} />
            </div>

            <h2 className="text-lg font-semibold text-[#FFF9EC] mb-4">
                Daftar Order
            </h2>
            <OrdersTable orders={orders} />
        </div>
    );
}

function StatCard({
    title,
    value,
}: {
    title: string;
    value: string;
}) {
    return (
        <div className="rounded-xl border border-[#FFF9EC]/10 bg-[#1a1410] p-4">
            <p className="text-sm text-[#FFF9EC]/60 mb-1">{title}</p>
            <p className="text-xl font-semibold text-[#FFF9EC]">{value}</p>
        </div>
    );
}

function OrdersTable({ orders }: { orders: AdminOrder[] }) {
    return (
        <div className="rounded-xl border border-[#FFF9EC]/10 overflow-hidden">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-[#FFF9EC]/10 bg-[#FFF9EC]/5">
                        <th className="px-4 py-3 text-sm font-semibold text-[#FFF9EC]">
                            Order ID
                        </th>
                        <th className="px-4 py-3 text-sm font-semibold text-[#FFF9EC]">
                            Tanggal
                        </th>
                        <th className="px-4 py-3 text-sm font-semibold text-[#FFF9EC]">
                            Customer
                        </th>
                        <th className="px-4 py-3 text-sm font-semibold text-[#FFF9EC]">
                            Meja / Takeaway
                        </th>
                        <th className="px-4 py-3 text-sm font-semibold text-[#FFF9EC]">
                            Total
                        </th>
                        <th className="px-4 py-3 text-sm font-semibold text-[#FFF9EC]">
                            Status
                        </th>
                        <th className="px-4 py-3 text-sm font-semibold text-[#FFF9EC]">
                            Bayar
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {orders.length === 0 ? (
                        <tr>
                            <td
                                colSpan={7}
                                className="px-4 py-8 text-center text-[#FFF9EC]/50"
                            >
                                Belum ada order.
                            </td>
                        </tr>
                    ) : (
                        orders.map((o) => (
                            <tr
                                key={o.order_id}
                                className="border-b border-[#FFF9EC]/5 hover:bg-[#FFF9EC]/5"
                            >
                                <td className="px-4 py-3 text-[#FFF9EC] font-mono text-sm">
                                    {o.order_id}
                                </td>
                                <td className="px-4 py-3 text-[#FFF9EC]/80 text-sm">
                                    {o.created_at
                                        ? new Date(o.created_at).toLocaleString(
                                              "id-ID",
                                              {
                                                  dateStyle: "short",
                                                  timeStyle: "short",
                                              }
                                          )
                                        : "—"}
                                </td>
                                <td className="px-4 py-3 text-[#FFF9EC]">
                                    {o.customer_name ?? "—"}
                                </td>
                                <td className="px-4 py-3 text-[#FFF9EC]/80">
                                    {o.is_takeaway
                                        ? "Takeaway"
                                        : o.table_number ?? "—"}
                                </td>
                                <td className="px-4 py-3 text-[#FFF9EC] font-medium">
                                    {formatRupiah(o.total_price ?? 0)}
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-sm text-[#FFF9EC]/80">
                                        {o.status ?? "—"}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`text-sm ${
                                            o.payment_status === "paid"
                                                ? "text-green-400"
                                                : o.payment_status === "pending"
                                                  ? "text-amber-400"
                                                  : "text-[#FFF9EC]/60"
                                        }`}
                                    >
                                        {o.payment_status ?? "—"}
                                    </span>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

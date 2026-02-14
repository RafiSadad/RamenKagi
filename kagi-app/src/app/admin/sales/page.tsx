import {
    getOrdersForAdmin,
    getSalesStats,
    type AdminOrder,
} from "@/lib/admin-orders";
import { formatRupiah } from "@/lib/utils";

function getTodayStartEnd(): { from: Date; to: Date } {
    const now = new Date();
    const from = new Date(now);
    from.setHours(0, 0, 0, 0);
    const to = new Date(now);
    to.setHours(23, 59, 59, 999);
    return { from, to };
}

function getWeekStartEnd(): { from: Date; to: Date } {
    const now = new Date();
    const to = new Date(now);
    to.setHours(23, 59, 59, 999);
    const from = new Date(now);
    from.setDate(from.getDate() - 7);
    from.setHours(0, 0, 0, 0);
    return { from, to };
}

export default async function AdminSalesPage() {
    const today = getTodayStartEnd();
    const week = getWeekStartEnd();

    const [statsToday, statsWeek, recentOrders] = await Promise.all([
        getSalesStats({ fromDate: today.from, toDate: today.to }),
        getSalesStats({ fromDate: week.from, toDate: week.to }),
        getOrdersForAdmin({ limit: 50 }),
    ]);

    return (
        <div>
            <h1 className="text-2xl font-semibold text-[#FFF9EC] mb-6">
                Dashboard Penjualan
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    title="Order hari ini"
                    value={String(statsToday.count)}
                />
                <StatCard
                    title="Revenue hari ini"
                    value={formatRupiah(statsToday.revenue)}
                />
                <StatCard
                    title="Order 7 hari"
                    value={String(statsWeek.count)}
                />
                <StatCard
                    title="Revenue 7 hari"
                    value={formatRupiah(statsWeek.revenue)}
                />
            </div>

            <h2 className="text-lg font-semibold text-[#FFF9EC] mb-4">
                Daftar Order (terbaru)
            </h2>
            <OrdersTable orders={recentOrders} />
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

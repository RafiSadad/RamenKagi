import { getMenuItems, getCategories } from "@/lib/sanity";
import { getAllMenuStock } from "@/lib/menu-stock";
import { syncMenuStockFromSanity } from "../actions";
import type { MenuItem } from "@/types/menu";
import StockTable from "./StockTable";

export default async function AdminStockPage() {
    const [menuItems, categories, stockRows] = await Promise.all([
        getMenuItems(),
        getCategories(),
        getAllMenuStock(),
    ]);
    const menuList: MenuItem[] = menuItems ?? [];
    const categoryList = categories ?? [];
    const categoryOrderMap = new Map(
        categoryList.map((c) => [c.slug, c.order])
    );
    const categoryTitleMap = new Map(
        categoryList.map((c) => [c.slug, c.title])
    );

    const stockSet = new Set(stockRows.map((r) => r.menu_id));
    const missingIds = menuList.filter((m) => !stockSet.has(m._id)).map((m) => m._id);

    let currentStock = stockRows;
    if (missingIds.length > 0) {
        await syncMenuStockFromSanity(missingIds);
        currentStock = await getAllMenuStock();
    }

    const stockMap = new Map(currentStock.map((r) => [r.menu_id, r]));
    const rows = menuList
        .map((m) => {
            const s = stockMap.get(m._id);
            const categoryOrder = categoryOrderMap.get(m.category) ?? 999;
            return {
                menu_id: m._id,
                name: m.name,
                categorySlug: m.category,
                categoryTitle: categoryTitleMap.get(m.category) ?? m.category,
                categoryOrder,
                quantity: s?.quantity ?? 0,
                default_quantity: s?.default_quantity ?? null,
            };
        })
        .sort((a, b) => {
            if (a.categoryOrder !== b.categoryOrder)
                return a.categoryOrder - b.categoryOrder;
            return a.name.localeCompare(b.name);
        });

    return (
        <div>
            <h1 className="text-2xl font-semibold text-[#FFF9EC] mb-6">
                Kelola Stok Menu
            </h1>
            <StockTable rows={rows} />
        </div>
    );
}

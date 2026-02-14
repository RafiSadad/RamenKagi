import HomeClient from "@/components/HomeClient";
import { getCategories, getMenuItems, getBanners, getWelcomePage } from "@/lib/sanity";
import { getMenuStock } from "@/lib/menu-stock";
import type { MenuItem, Banner, WelcomePage } from "@/types/menu";

export default async function Home() {
  const [categories, menuItemsRaw, banners, welcome] = await Promise.all([
    getCategories(),
    getMenuItems(),
    getBanners(),
    getWelcomePage(),
  ]);
  const menuItemsList: MenuItem[] = menuItemsRaw ?? [];
  const stockMap = await getMenuStock(menuItemsList.map((m) => m._id));
  const menuItems: MenuItem[] = menuItemsList.map((m) => ({
    ...m,
    stock: stockMap[m._id] !== undefined ? stockMap[m._id] : undefined,
  }));

  return (
    <HomeClient
      categories={categories ?? []}
      menuItems={menuItems}
      banners={(banners ?? []) as Banner[]}
      welcome={(welcome ?? null) as WelcomePage | null}
    />
  );
}

export interface Banner {
  _id: string;
  title?: string | null;
  headline: string;
  subtitle?: string | null;
  image?: string | null;
  link?: string | null;
  order?: number | null;
}

export interface Category {
  _id: string;
  title: string;
  slug: string;
  icon: string;
  order: number;
}

export interface Topping {
  name: string;
  price: number;
}

export interface MenuItem {
  _id: string;
  name: string;
  slug: string;
  image?: string | null;
  videoUrl?: string | null;
  price: number;
  description: string;
  category: string; // category slug
  isPopular: boolean;
  isUpsell: boolean;
  toppings?: Topping[];
  /** From Supabase menu_stock; undefined = no row (unlimited) */
  stock?: number;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  selectedToppings?: Topping[];
  notes?: string;
}

export interface Order {
  customerName: string;
  tableNumber: string;
  isTakeaway: boolean;
  items: CartItem[];
  totalPrice: number;
  notes: string;
  orderId?: string;
  paymentStatus?: string;
}

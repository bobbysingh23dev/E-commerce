// These mirror the JSON your backend actually returns (see openapi.yaml).
// Keeping them in sync with the backend is what makes the whole app type-safe.

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string; // decimal comes back as a string to preserve precision
  stock_quantity: number;
  is_active: boolean;
  category_id: number | null;
  category_name: string | null; // present on list/detail reads (via JOIN)
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// Shapes for CREATING/UPDATING (what we send TO the backend). Note price is a
// NUMBER here — reads return it as a string, but writes must send a JSON number.
export interface ProductInput {
  name: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  category_id: number | null;
  image_url: string | null;
}

export interface CategoryInput {
  name: string;
  description: string | null;
}

export type UserRole = "customer" | "admin";

export interface PublicUser {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}

export interface LoginResponse {
  jwtToken: string;
  user: PublicUser;
}

export type OrderStatus = "pending" | "paid" | "completed" | "cancelled";

export interface OrderSummary {
  id: number;
  total: string;
  status: OrderStatus;
  created_at: string;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: string;
}

export interface OrderDetail extends OrderSummary {
  items: OrderItem[];
}

// The backend now wraps list endpoints in a pagination envelope.
export interface Pagination {
  page: number;
  limit: number;
  total: number; // total matching rows (across all pages)
  totalPages: number;
}

// A generic: Paginated<Product> = { data: Product[], pagination }.
// The <T> means this one type works for any kind of list response.
export interface Paginated<T> {
  data: T[];
  pagination: Pagination;
}

// ---------- Reports (admin analytics) ----------
export interface ReportSummary {
  overview: {
    totalRevenue: string; // money as string
    orderCount: number;
    avgOrderValue: string; // money as string
    productCount: number;
    customerCount: number;
  };
  // Only statuses that actually occur are present.
  ordersByStatus: Partial<Record<OrderStatus, number>>;
  topProducts: {
    id: number;
    name: string;
    unitsSold: number;
    revenue: string;
  }[];
  bestSellerPerCategory: {
    category: string;
    product: string;
    units_sold: number; // note: snake_case from this query
  }[];
}

// ---------- Cart (server-side, per user) ----------
// One line as GET /cart returns it — joined to products for a LIVE price.
export interface CartItemView {
  id: number; // cart_item row id
  product_id: number;
  product_name: string;
  price: string; // live product price (string, like all NUMERIC)
  quantity: number;
  line_total: string; // price * quantity
}

// The whole GET /cart response.
export interface CartView {
  items: CartItemView[];
  total: string;
  itemCount: number; // backend = number of distinct lines
}

// The raw row that add/update/remove mutations return (before the join).
export interface CartItemRow {
  id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
}

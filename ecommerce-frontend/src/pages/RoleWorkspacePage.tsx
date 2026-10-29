import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { getCategories } from "../api/categories";
import { getStaffOrders, updateStaffOrderStatus } from "../api/orders";
import { getProducts } from "../api/products";
import { getSummary } from "../api/reports";
import type {
  Category,
  OrderStatus,
  Product,
  ReportSummary,
  StaffOrder,
  UserRole,
} from "../types";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";

type StaffRole = Exclude<UserRole, "customer" | "admin">;

const STAFF_ROLES: StaffRole[] = [
  "support",
  "inventory_manager",
  "order_manager",
  "finance",
  "content_editor",
];

const PAGE_INFO: Record<StaffRole, { title: string; summary: string }> = {
  support: {
    title: "Customer support",
    summary: "Review customer orders and find the details needed to help.",
  },
  inventory_manager: {
    title: "Inventory overview",
    summary: "Track catalog stock levels and spot products that need attention.",
  },
  order_manager: {
    title: "Order management",
    summary: "Review incoming orders and keep fulfillment statuses up to date.",
  },
  finance: {
    title: "Company finances",
    summary: "Review revenue, order value, sales trends, and best sellers.",
  },
  content_editor: {
    title: "Catalog content",
    summary: "Maintain product and category information shown in the shop.",
  },
};

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "paid",
  "completed",
  "cancelled",
];

export default function RoleWorkspacePage() {
  const { user } = useAuth();
  const { workspaceRole } = useParams();
  const signedInRole = user?.role;
  const requestedRole = STAFF_ROLES.find((role) => role === workspaceRole);
  const activeRole =
    signedInRole === "admin" ? requestedRole :
    signedInRole && STAFF_ROLES.includes(signedInRole as StaffRole)
      ? (signedInRole as StaffRole)
      : undefined;
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [orders, setOrders] = useState<StaffOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        if (activeRole === "finance") {
          const result = await getSummary();
          if (!ignore) setSummary(result);
        } else if (activeRole === "support" || activeRole === "order_manager") {
          const result = await getStaffOrders();
          if (!ignore) setOrders(result);
        } else if (activeRole === "inventory_manager" || activeRole === "content_editor") {
          const firstPage = await getProducts({ limit: 100, sort: "name" });
          const remainingPages = await Promise.all(
            Array.from({ length: Math.max(0, firstPage.pagination.totalPages - 1) }, (_, index) =>
              getProducts({ limit: 100, page: index + 2, sort: "name" }),
            ),
          );
          const allProducts = [
            ...firstPage.data,
            ...remainingPages.flatMap((page) => page.data),
          ];
          if (!ignore) setProducts(allProducts);
          if (activeRole === "content_editor") {
            const categoryList = await getCategories();
            if (!ignore) setCategories(categoryList);
          }
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Could not load workspace data");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    if (activeRole) void load();
    else setLoading(false);

    return () => {
      ignore = true;
    };
  }, [activeRole]);

  if (!user) return <Navigate to="/" replace />;
  if (signedInRole === "customer") return <Navigate to="/" replace />;
  if (signedInRole === "admin" && !requestedRole) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (signedInRole !== "admin" && requestedRole && requestedRole !== signedInRole) {
    return <Navigate to={`/workspace/${signedInRole}`} replace />;
  }

  const staffRole = activeRole;
  if (!staffRole) return <Navigate to="/" replace />;
  const page = PAGE_INFO[staffRole];

  async function changeOrderStatus(order: StaffOrder, status: OrderStatus) {
    if (status === order.status) return;
    setUpdatingOrderId(order.id);
    setError(null);
    try {
      const updated = await updateStaffOrderStatus(order.id, status);
      setOrders((current) =>
        current.map((item) =>
          item.id === updated.id ? { ...item, status: updated.status } : item,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update order");
    } finally {
      setUpdatingOrderId(null);
    }
  }

  const lowStock = products.filter((product) => product.stock_quantity > 0 && product.stock_quantity <= 10);
  const outOfStock = products.filter((product) => product.stock_quantity <= 0);
  const totalUnits = products.reduce((sum, product) => sum + product.stock_quantity, 0);
  const missingDescriptions = products.filter((product) => !product.description?.trim());
  const missingImages = products.filter((product) => !product.image_url?.trim());
  const orderCounts = orders.reduce<Record<string, number>>((counts, order) => {
    counts[order.status] = (counts[order.status] ?? 0) + 1;
    return counts;
  }, {});

  return (
    <div>
      <header className="mb-6">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-accent">
          {staffRole.replaceAll("_", " ")}
        </p>
        <h1 className="text-3xl font-bold">{page.title}</h1>
        <p className="mt-2 text-sm text-muted">{page.summary}</p>
      </header>

      {error && <div className="alert-error mb-5">{error}</div>}
      {loading ? (
        <p className="text-muted">Loading workspace data…</p>
      ) : (
        <>
          {staffRole === "finance" && summary && <FinanceDashboard summary={summary} />}
          {staffRole === "inventory_manager" && (
            <InventoryDashboard
              products={products}
              lowStock={lowStock}
              outOfStock={outOfStock}
              totalUnits={totalUnits}
            />
          )}
          {staffRole === "content_editor" && (
            <ContentDashboard
              products={products}
              categories={categories}
              missingDescriptions={missingDescriptions.length}
              missingImages={missingImages.length}
            />
          )}
          {(staffRole === "support" || staffRole === "order_manager") && (
            <OrdersDashboard
              orders={orders}
              counts={orderCounts}
              canUpdate={staffRole === "order_manager"}
              updatingOrderId={updatingOrderId}
              onStatusChange={changeOrderStatus}
            />
          )}
        </>
      )}
    </div>
  );
}

function Metric({ label, value, note }: { label: string; value: string | number; note?: string }) {
  return (
    <section className="card p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-faint">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold text-fg">{value}</p>
      {note && <p className="mt-1 text-xs text-muted">{note}</p>}
    </section>
  );
}

function FinanceDashboard({ summary }: { summary: ReportSummary }) {
  const money = (value: string) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(Number(value));
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Total revenue" value={money(summary.overview.totalRevenue)} />
        <Metric label="Orders" value={summary.overview.orderCount} />
        <Metric label="Average order" value={money(summary.overview.avgOrderValue)} />
        <Metric label="Customers" value={summary.overview.customerCount} />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="mb-4 text-lg font-semibold">Orders by status</h2>
          <ul className="space-y-3">
            {ORDER_STATUSES.map((status) => (
              <li key={status} className="flex items-center justify-between text-sm">
                <span className="capitalize text-muted">{status}</span>
                <span className="font-semibold">{summary.ordersByStatus[status] ?? 0}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="card p-5">
          <h2 className="mb-4 text-lg font-semibold">Top products by sales</h2>
          {summary.topProducts.length === 0 ? (
            <p className="text-sm text-muted">No sales yet.</p>
          ) : (
            <ul className="space-y-3">
              {summary.topProducts.map((product) => (
                <li key={product.id} className="flex justify-between gap-4 text-sm">
                  <span className="truncate">{product.name}</span>
                  <span className="shrink-0 text-muted">
                    {product.unitsSold} sold · {money(product.revenue)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function InventoryDashboard({
  products,
  lowStock,
  outOfStock,
  totalUnits,
}: {
  products: Product[];
  lowStock: Product[];
  outOfStock: Product[];
  totalUnits: number;
}) {
  const attention = [...outOfStock, ...lowStock].slice(0, 12);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Products" value={products.length} />
        <Metric label="Units in stock" value={totalUnits} />
        <Metric label="Low stock" value={lowStock.length} note="10 units or fewer" />
        <Metric label="Out of stock" value={outOfStock.length} />
      </div>
      <section className="card overflow-x-auto p-5">
        <h2 className="mb-4 text-lg font-semibold">Stock needing attention</h2>
        {attention.length === 0 ? (
          <p className="text-sm text-muted">All products have more than 10 units in stock.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wider text-faint">
              <tr>
                <th className="py-3 pr-4 font-medium">Product</th>
                <th className="py-3 pr-4 font-medium">Category</th>
                <th className="py-3 text-right font-medium">Available</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {attention.map((product) => (
                <tr key={product.id}>
                  <td className="py-3 pr-4 font-medium">{product.name}</td>
                  <td className="py-3 pr-4 text-muted">{product.category_name ?? "Uncategorized"}</td>
                  <td className="py-3 text-right font-semibold text-fg">{product.stock_quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function ContentDashboard({
  products,
  categories,
  missingDescriptions,
  missingImages,
}: {
  products: Product[];
  categories: Category[];
  missingDescriptions: number;
  missingImages: number;
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Products" value={products.length} />
        <Metric label="Categories" value={categories.length} />
        <Metric label="Missing descriptions" value={missingDescriptions} />
        <Metric label="Missing images" value={missingImages} />
      </div>
      <section className="card p-5">
        <h2 className="mb-2 text-lg font-semibold">Catalog tasks</h2>
        <p className="mb-4 text-sm text-muted">
          Keep product copy, images, and category details complete and consistent.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/products" className="btn-primary">Manage products</Link>
          <Link to="/admin/categories" className="btn-ghost">Manage categories</Link>
        </div>
      </section>
    </div>
  );
}

function OrdersDashboard({
  orders,
  counts,
  canUpdate,
  updatingOrderId,
  onStatusChange,
}: {
  orders: StaffOrder[];
  counts: Record<string, number>;
  canUpdate: boolean;
  updatingOrderId: number | null;
  onStatusChange: (order: StaffOrder, status: OrderStatus) => void;
}) {
  const needsAttention = (counts.pending ?? 0) + (counts.cancelled ?? 0);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="All orders" value={orders.length} />
        <Metric label="Pending" value={counts.pending ?? 0} />
        <Metric label="Paid" value={counts.paid ?? 0} />
        <Metric label="Needs attention" value={needsAttention} note="Pending or cancelled" />
      </div>
      <section className="card overflow-x-auto p-5">
        <h2 className="mb-4 text-lg font-semibold">
          {canUpdate ? "Order queue" : "Customer order lookup"}
        </h2>
        {orders.length === 0 ? (
          <p className="text-sm text-muted">No orders yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wider text-faint">
              <tr>
                <th className="py-3 pr-4 font-medium">Order</th>
                <th className="py-3 pr-4 font-medium">Customer</th>
                <th className="py-3 pr-4 font-medium">Date</th>
                <th className="py-3 pr-4 text-right font-medium">Total</th>
                <th className="py-3 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="py-3 pr-4 font-semibold">#{order.id}</td>
                  <td className="py-3 pr-4">
                    <p>{order.customer_name}</p>
                    <a className="text-xs text-accent-3 hover:underline" href={`mailto:${order.customer_email}`}>
                      {order.customer_email}
                    </a>
                  </td>
                  <td className="py-3 pr-4 text-muted">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 pr-4 text-right">${order.total}</td>
                  <td className="py-3 text-right">
                    {canUpdate ? (
                      <select
                        aria-label={`Status for order ${order.id}`}
                        value={order.status}
                        disabled={updatingOrderId === order.id}
                        onChange={(event) => onStatusChange(order, event.target.value as OrderStatus)}
                        className="rounded-lg border border-line bg-transparent px-2 py-1 text-sm disabled:opacity-50"
                      >
                        {nextStatuses(order.status).map((status) => (
                          <option key={status} value={status} className="text-black">{status}</option>
                        ))}
                      </select>
                    ) : (
                      <StatusBadge status={order.status} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function nextStatuses(current: OrderStatus): OrderStatus[] {
  if (current === "pending") return ["pending", "cancelled"];
  if (current === "paid") return ["paid", "completed"];
  return [current];
}

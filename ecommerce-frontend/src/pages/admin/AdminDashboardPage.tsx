import { useEffect, useState } from "react";
import { getSummary } from "../../api/reports";
import type { ReportSummary, OrderStatus } from "../../types";
import AdminNav from "../../components/AdminNav";
import AnimatedPrice from "../../components/AnimatedPrice";
import AnimatedNumber from "../../components/AnimatedNumber";

export default function AdminDashboardPage() {
  const [data, setData] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    getSummary()
      .then((d) => {
        if (!ignore) setData(d);
      })
      .catch((err) => {
        if (!ignore) setError(err.message ?? "Failed to load summary");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div>
      <AdminNav />
      <h1 className="mb-5 text-2xl font-bold">Overview</h1>

      {loading ? (
        <p className="text-muted">Loading analytics…</p>
      ) : error ? (
        <div className="alert-error">{error}</div>
      ) : !data ? null : (
        <div className="space-y-4">
          {/* KPI tiles — headline numbers, not charts */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            <Stat label="Revenue" money={data.overview.totalRevenue} accent />
            <Stat label="Orders" number={data.overview.orderCount} />
            <Stat label="Avg order" money={data.overview.avgOrderValue} />
            <Stat label="Products" number={data.overview.productCount} />
            <Stat label="Customers" number={data.overview.customerCount} />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {/* Top products — single-hue magnitude bars */}
            <section className="card p-6 lg:col-span-2">
              <h2 className="font-display text-lg font-semibold">
                Top products{" "}
                <span className="text-sm font-normal text-faint">
                  · by units sold
                </span>
              </h2>
              <TopProducts products={data.topProducts} />
            </section>

            <div className="flex flex-col gap-4">
              <section className="card p-6">
                <h2 className="font-display text-lg font-semibold">
                  Orders by status
                </h2>
                <OrdersByStatus map={data.ordersByStatus} />
              </section>

              <section className="card p-6">
                <h2 className="font-display text-lg font-semibold">
                  Best seller · by category
                </h2>
                <BestSellers rows={data.bestSellerPerCategory} />
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  money,
  number,
  accent,
}: {
  label: string;
  money?: string;
  number?: number;
  accent?: boolean;
}) {
  return (
    <div className="card p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-faint">
        {label}
      </p>
      {money !== undefined ? (
        <AnimatedPrice
          value={money}
          className={`mt-2 block font-display text-2xl font-bold ${accent ? "gradient-text" : "text-fg"}`}
        />
      ) : (
        <AnimatedNumber
          value={number ?? 0}
          className="mt-2 block font-display text-2xl font-bold text-fg"
        />
      )}
    </div>
  );
}

function TopProducts({ products }: { products: ReportSummary["topProducts"] }) {
  if (products.length === 0)
    return <p className="mt-4 text-sm text-muted">No sales yet.</p>;

  const max = Math.max(...products.map((p) => p.unitsSold));

  return (
    <div className="mt-4 space-y-3">
      {products.map((p) => (
        <div key={p.id} className="flex items-center gap-3">
          <span
            className="w-28 shrink-0 truncate text-sm text-fg"
            title={p.name}
          >
            {p.name}
          </span>
          {/* One hue for one measure (magnitude). Rounded data-end. */}
          <div className="h-2.5 flex-1 rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-linear-to-r from-accent to-accent-2"
              style={{ width: `${Math.max(4, (p.unitsSold / max) * 100)}%` }}
            />
          </div>
          <span className="w-24 shrink-0 text-right text-sm text-muted">
            <span className="font-semibold text-fg">{p.unitsSold}</span> · $
            {p.revenue}
          </span>
        </div>
      ))}
    </div>
  );
}

// Reserved status colours (match StatusBadge), always paired with a label.
const STATUS_ORDER: OrderStatus[] = [
  "pending",
  "paid",
  "completed",
  "cancelled",
];
const STATUS_FILL: Record<OrderStatus, string> = {
  pending: "#fbbf24",
  paid: "#38bdf8",
  completed: "#34d399",
  cancelled: "#64748b",
};

function OrdersByStatus({
  map,
}: {
  map: ReportSummary["ordersByStatus"];
}) {
  const entries = STATUS_ORDER.filter((s) => (map[s] ?? 0) > 0).map(
    (s) => [s, map[s] as number] as [OrderStatus, number],
  );
  const total = entries.reduce((sum, [, n]) => sum + n, 0);

  if (total === 0)
    return <p className="mt-4 text-sm text-muted">No orders yet.</p>;

  return (
    <>
      {/* Stacked share bar with a 2px gap between segments */}
      <div className="mt-4 flex h-3 gap-0.5 overflow-hidden rounded-full">
        {entries.map(([s, n]) => (
          <div
            key={s}
            style={{ width: `${(n / total) * 100}%`, background: STATUS_FILL[s] }}
          />
        ))}
      </div>
      <ul className="mt-4 space-y-2">
        {entries.map(([s, n]) => (
          <li key={s} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: STATUS_FILL[s] }}
              />
              <span className="capitalize text-muted">{s}</span>
            </span>
            <span className="font-semibold text-fg">{n}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

function BestSellers({
  rows,
}: {
  rows: ReportSummary["bestSellerPerCategory"];
}) {
  if (rows.length === 0)
    return <p className="mt-4 text-sm text-muted">No data yet.</p>;

  return (
    <ul className="mt-4 space-y-3">
      {rows.map((r) => (
        <li key={r.category} className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-fg">{r.product}</p>
            <p className="text-xs text-faint">{r.category}</p>
          </div>
          <span className="chip">{r.units_sold} sold</span>
        </li>
      ))}
    </ul>
  );
}

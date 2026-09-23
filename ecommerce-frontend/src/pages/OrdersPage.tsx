import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOrders } from "../api/orders";
import type { OrderSummary } from "../types";
import StatusBadge from "../components/StatusBadge";

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    getOrders()
      .then((data) => {
        if (!ignore) setOrders(data);
      })
      .catch((err) => {
        if (!ignore) setError(err.message ?? "Failed to load orders");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  if (loading) return <p className="text-muted">Loading orders…</p>;
  if (error) return <div className="alert-error">{error}</div>;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-3xl font-bold">My orders</h1>

      {orders.length === 0 ? (
        <p className="text-muted">
          You haven&apos;t placed any orders yet.{" "}
          <Link to="/" className="font-medium text-accent-3 hover:underline">
            Start shopping
          </Link>
          .
        </p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="card flex items-center justify-between p-4 transition-all hover:-translate-y-0.5 hover:border-accent/40"
            >
              <div>
                <p className="font-semibold text-fg">Order #{order.id}</p>
                <p className="text-sm text-faint">
                  {new Date(order.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <StatusBadge status={order.status} />
                <span className="font-semibold text-fg">${order.total}</span>
                <span className="text-muted">›</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

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

  if (loading) return <p className="text-slate-500">Loading orders…</p>;

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-slate-900">My orders</h1>

      {orders.length === 0 ? (
        <p className="text-slate-500">
          You haven&apos;t placed any orders yet.{" "}
          <Link to="/" className="font-medium text-slate-900 underline">
            Start shopping
          </Link>
          .
        </p>
      ) : (
        <div className="divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white">
          {orders.map((order) => (
            // The whole row is a link to the order's detail page.
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
            >
              <div>
                <p className="font-medium text-slate-900">Order #{order.id}</p>
                <p className="text-sm text-slate-500">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <StatusBadge status={order.status} />
                <span className="font-semibold text-slate-900">
                  ${order.total}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

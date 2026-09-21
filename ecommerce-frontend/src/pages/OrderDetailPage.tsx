import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getOrder, updateOrderStatus } from "../api/orders";
import type { OrderDetail } from "../types";
import StatusBadge from "../components/StatusBadge";

export default function OrderDetailPage() {
  // useParams reads the ":id" segment from the URL (it's always a string).
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    getOrder(orderId)
      .then((data) => {
        if (!ignore) setOrder(data);
      })
      .catch((err) => {
        if (!ignore) setError(err.message ?? "Failed to load order");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [orderId]); // refetch if the id in the URL changes

  async function handleCancel() {
    if (!order) return;
    if (!window.confirm(`Cancel order #${order.id}? This restocks the items.`))
      return;

    setCancelling(true);
    setError(null);
    try {
      const updated = await updateOrderStatus(order.id, "cancelled");
      // PATCH returns the summary; keep our items, just update the status.
      setOrder({ ...order, status: updated.status });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't cancel order");
    } finally {
      setCancelling(false);
    }
  }

  if (loading) return <p className="text-slate-500">Loading order…</p>;

  if (error && !order) {
    return (
      <div>
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
        <Link to="/orders" className="mt-4 inline-block text-sm underline">
          ← Back to orders
        </Link>
      </div>
    );
  }

  if (!order) return null;

  // Only offer cancellation for orders that haven't shipped/finished.
  const canCancel = order.status === "pending" || order.status === "paid";

  return (
    <div>
      <Link
        to="/orders"
        className="mb-4 inline-block text-sm text-slate-500 hover:text-slate-900"
      >
        ← Back to orders
      </Link>

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">
          Order #{order.id}
        </h1>
        <StatusBadge status={order.status} />
      </div>

      <p className="mb-4 text-sm text-slate-500">
        Placed {new Date(order.created_at).toLocaleString()}
      </p>

      {/* An inline error (e.g. cancel failed) while the order is still shown. */}
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Line items */}
      <div className="divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white">
        {order.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between px-4 py-3"
          >
            <div>
              <p className="font-medium text-slate-900">{item.product_name}</p>
              <p className="text-sm text-slate-500">
                {item.quantity} × ${item.unit_price}
              </p>
            </div>
            <span className="font-medium text-slate-900">
              ${(Number(item.unit_price) * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
        <span className="text-lg font-semibold text-slate-900">Total</span>
        <span className="text-lg font-bold text-slate-900">${order.total}</span>
      </div>

      {canCancel && (
        <button
          onClick={handleCancel}
          disabled={cancelling}
          className="mt-6 rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          {cancelling ? "Cancelling…" : "Cancel order"}
        </button>
      )}
    </div>
  );
}
